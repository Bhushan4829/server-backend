const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const moment = require('moment-timezone');
const fs = require('fs');
// Import stat fetchers
const fetchLeetCodeData = require('../utils/fetchLeetCodeData');
const fetchGeeksforGeeksData = require('../utils/fetchGeeksforGeeksData');
const fetchGitHubData = require('../utils/fetchGitHubData');
const { fetchGoogleTasks, oauth2Client } = require('../utils/tasks');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

app.get('/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/tasks.readonly'];
  const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await oauth2Client.getToken(code);
    const tokens = response.tokens;

    console.log('Token Response:', tokens);
    oauth2Client.setCredentials(tokens);

    if (tokens.refresh_token) {
      console.log('Saving new refresh token');
      try {
        // Load the current .env file content
        const envFilePath = './.env';
        const envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, 'utf8') : '';

        // Replace the existing REFRESH_TOKEN or append it if it doesn't exist
        const updatedEnvContent = envContent.includes('REFRESH_TOKEN=')
          ? envContent.replace(/REFRESH_TOKEN=.*/, `REFRESH_TOKEN=${tokens.refresh_token}`)
          : `${envContent.trim()}\nREFRESH_TOKEN=${tokens.refresh_token}`;

        // Write the updated content back to the .env file
        fs.writeFileSync(envFilePath, updatedEnvContent, 'utf8');
        console.log('Refresh token saved successfully to .env');
      } catch (err) {
        console.error('Error saving refresh token to .env:', err);
      }
    } else {
      console.log('No refresh token provided in the response');
    }

    res.send('Authentication successful! You can close this tab.');
  } catch (error) {
    console.error('Error during authentication callback:', error);
    res.status(500).send('Authentication failed.');
  }
});

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define local day boundaries based on the desired time zone
const getLocalDayBoundaries = () => {
  const startOfDay = moment().tz('America/New_York').startOf('day');
  const endOfDay = moment().tz('America/New_York').endOf('day');
  return { startOfDay, endOfDay };
};
const getUTCBoundariesForLocalDay = () => {
  const startOfDay = moment().tz('America/New_York').startOf('day').utc();
  const endOfDay = moment().tz('America/New_York').endOf('day').utc();
  return { startOfDay, endOfDay };
};
const getPreviousDayBoundaries = () => {
  const previousDayStart = moment().tz('America/New_York').subtract(1, 'day').startOf('day').utc();
  const previousDayEnd = moment().tz('America/New_York').subtract(1, 'day').endOf('day').utc();
  return { previousDayStart, previousDayEnd };
};

// Define Mongoose schema and model
const streakSchema = new mongoose.Schema({
  date: { type: Date, unique: true, required: true },
  streak: Number,
  codingStatsLeetCode: Object,
  codingStatsGeeksforGeeks: Object,
  leetcodeDailySolved: { type: Number, default: 0 },
  geeksDailySolved: { type: Number, default: 0 },
  githubStats: Object,
  taskStats: Object,
});

const Streak = mongoose.model('Streak', streakSchema);

// Helper function to calculate streak
const calculateStreak = ({ codingStats, githubStats, taskStats }) => {
  const { startOfDay, endOfDay } = getLocalDayBoundaries();
  const completedTasks = taskStats.todayTasks.filter(task => {
    const completedTimeLocal = moment(task.completedTimestamp).tz('America/New_York');
    return completedTimeLocal.isBetween(startOfDay, endOfDay, null, '[)');
  });

  const taskPoint = completedTasks.length >= 2 ? 1 : 0;
  const codingPoint = (codingStats.leetcodeDailySolved || 0) + (codingStats.geeksDailySolved || 0) >= 2 ? 1 : 0;
  const githubPoint = githubStats.commits > 0 ? 1 : 0;

  const totalPoints = taskPoint + codingPoint + githubPoint;
  return totalPoints >= 2 ? 1 : 0;
};

// API Endpoint to fetch dashboard data
app.get('/api/dashboard-data', async (req, res) => {
  try {
    console.log('[DEBUG] /api/dashboard-data: Request received.');

    const localTodayISO = moment().tz('America/New_York').startOf('day').toISOString();
    const { startOfDay, endOfDay } = getUTCBoundariesForLocalDay();
    console.log('[DEBUG] Local Day UTC Boundaries:', {
      startOfDay: startOfDay.format(),
      endOfDay: endOfDay.format(),
    });

    // Fetch data from external sources concurrently
    console.log('[DEBUG] Fetching data from external sources...');
    const [
      codingStatsLeetCode,
      codingStatsGeeksforGeeks,
      githubStats,
      taskStats,
    ] = await Promise.allSettled([
      fetchLeetCodeData(),
      fetchGeeksforGeeksData(),
      fetchGitHubData(),
      fetchGoogleTasks(),
    ]);

    // Log any rejected fetches
    if (taskStats.status === 'rejected') {
      console.error('[ERROR] Failed to fetch Google Tasks:', taskStats.reason);
    }

    console.log('[DEBUG] All external data fetched successfully.');

    const { previousDayStart, previousDayEnd } = getPreviousDayBoundaries();
    const previousStreak = await Streak.findOne({
      date: { $gte: previousDayStart.toDate(), $lte: previousDayEnd.toDate() },
    }).sort({ date: -1 });

    const leetcodeDailySolved = previousStreak
      ? Math.max(
          (codingStatsLeetCode.value?.totalProblemsSolved || 0) -
            (previousStreak.codingStatsLeetCode?.totalProblemsSolved || 0),
          0
        )
      : 0; // Default to 0 if no previous data

    const geeksDailySolved = previousStreak
      ? Math.max(
          (codingStatsGeeksforGeeks.value?.totalProblemsSolved || 0) -
            (previousStreak.codingStatsGeeksforGeeks?.totalProblemsSolved || 0),
          0
        )
      : 0; // Default to 0 if no previous data

    const streakPoints = calculateStreak({
      codingStats: { leetcodeDailySolved, geeksDailySolved },
      githubStats: githubStats.value,
      taskStats: taskStats.value || { todayTasks: [] },
    });

    const updatedStreak = await Streak.findOneAndUpdate(
      { date: new Date(localTodayISO) },
      {
        streak: streakPoints === 1 ? (previousStreak?.streak || 0) + 1 : 0,
        codingStatsLeetCode: codingStatsLeetCode.value || {},
        codingStatsGeeksforGeeks: codingStatsGeeksforGeeks.value || {},
        leetcodeDailySolved,
        geeksDailySolved,
        githubStats: githubStats.value || {},
        taskStats: taskStats.value || { todayTasks: [] },
      },
      { upsert: true, new: true }
    );

    console.log('[DEBUG] Updated Streak Data:', updatedStreak);
    res.json(updatedStreak);
  } catch (error) {
    console.error('[ERROR] Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.get('/api/streak-history', async (req, res) => {
  try {
    console.log('[DEBUG] /api/streak-history: Request received.');

    const streakHistory = await Streak.find().sort({ date: 1 });
    console.log('[DEBUG] Streak History Fetched:', streakHistory);

    res.json(streakHistory);
  } catch (error) {
    console.error('[ERROR] Error fetching streak history:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.get('/api/latest-dashboard-data', async (req, res) => {
  try {
    const latestEntry = await Streak.findOne().sort({ date: -1 });
    res.json(latestEntry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching latest entry', error: error.message });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
