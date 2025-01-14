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
        fs.writeFileSync('./refresh_token.json', JSON.stringify({ refresh_token: tokens.refresh_token }));
        console.log('Refresh token saved successfully');
      } catch (err) {
        console.error('Error saving refresh token:', err);
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
  // Filter tasks completed within the local day
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
const { previousDayStart, previousDayEnd } = getPreviousDayBoundaries();
// API Endpoint to fetch dashboard data
app.get('/api/dashboard-data', async (req, res) => {
  try {
    console.log('[DEBUG] /api/dashboard-data: Request received.');
    console.log('[DEBUG] Stored Streak Dates in DB:', await Streak.find({}, { date: 1 }));

    const today = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });

    const parts = formatter.formatToParts(today);
    const localToday = `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
    const { startOfDay, endOfDay } = getUTCBoundariesForLocalDay();
    console.log('[DEBUG] Local Day UTC Boundaries:', {
      startOfDay: startOfDay.format(),
      endOfDay: endOfDay.format(),
    });
    console.log('[DEBUG] Local Today (Adjusted to EST):', localToday);

    // Fetch data from external sources concurrently
    console.log('[DEBUG] Fetching data from external sources...');
    const [
      codingStatsLeetCode,
      codingStatsGeeksforGeeks,
      githubStats,
      taskStats,
    ] = await Promise.all([
      fetchLeetCodeData().then((data) => {
        console.log('[DEBUG] LeetCode Data Fetched:', data);
        return data;
      }),
      fetchGeeksforGeeksData().then((data) => {
        console.log('[DEBUG] GeeksforGeeks Data Fetched:', data);
        return data;
      }),
      fetchGitHubData().then((data) => {
        console.log('[DEBUG] GitHub Data Fetched:', data);
        return data;
      }),
      fetchGoogleTasks().then((data) => {
        console.log('[DEBUG] Google Tasks Data Fetched:', data);
        return data;
      }),
    ]);

    console.log('[DEBUG] All external data fetched successfully.');

    // Fetch the most recent streak entry (previous day)
    console.log('[DEBUG] Fetching the most recent streak entry...');
    const previousStreak = await Streak.findOne({
      date: { $gte: previousDayStart.toDate(), $lte: previousDayEnd.toDate() },
    }).sort({ date: -1 });    
    console.log('[DEBUG] Previous Streak:', previousStreak);

    // Calculate daily solved problems
    const leetcodeDailySolved = previousStreak
      ? Math.max(
          (codingStatsLeetCode.totalProblemsSolved || 0) -
            (previousStreak.codingStatsLeetCode?.totalProblemsSolved || 0),
          0
        )
      : codingStatsLeetCode.totalProblemsSolved || 0;

    const geeksDailySolved = previousStreak
      ? Math.max(
          (codingStatsGeeksforGeeks.totalProblemsSolved || 0) -
            (previousStreak.codingStatsGeeksforGeeks?.totalProblemsSolved || 0),
          0
        )
      : codingStatsGeeksforGeeks.totalProblemsSolved || 0;

    console.log('[DEBUG] Data passed to calculateStreak:', {
      codingStats: { leetcodeDailySolved, geeksDailySolved },
      githubStats,
      taskStats,
    });

    const streakPoints = calculateStreak({
      codingStats: { leetcodeDailySolved, geeksDailySolved },
      githubStats,
      taskStats,
    });
    console.log('[DEBUG] Streak Points:', streakPoints);

    let streak = 0;
    let streakData = await Streak.findOne({
      date: { $gte: startOfDay.toDate(), $lt: endOfDay.toDate() },
    });

    if (streakData) {
      console.log('[DEBUG] Streak for today already exists. Re-evaluating streak data.');
      console.log('[DEBUG] Streak Calculation:', {
        streakPoints,
        previousStreak: previousStreak?.streak,
        currentStreak: streakData?.streak,
      });
      streak = streakPoints === 1
        ? (previousStreak?.streak || 0) + 1
        : 0;

      streakData = await Streak.findOneAndUpdate(
        { date: new Date(localToday) },
        {
          streak,
          codingStatsLeetCode,
          codingStatsGeeksforGeeks,
          leetcodeDailySolved,
          geeksDailySolved,
          githubStats,
          taskStats,
        },
        { new: true }
      );
    } else {
      console.log('[DEBUG] No data found for today. Creating a new streak record.');

      streak = streakPoints === 1
        ? (previousStreak?.streak || 0) + 1
        : 0;

      streakData = await Streak.create({
        date: new Date(localToday),
        streak,
        codingStatsLeetCode,
        codingStatsGeeksforGeeks,
        leetcodeDailySolved,
        geeksDailySolved,
        githubStats,
        taskStats,
      });
    }

    console.log('[DEBUG] Updated Streak Data:', streakData);
    res.json(streakData);
  } catch (error) {
    console.error('[ERROR] Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.get('/api/streak-history', async (req, res) => {
  try {
    console.log('[DEBUG] /api/streak-history: Request received.');

    // Fetch all streak data sorted by date in ascending order
    const streakHistory = await Streak.find().sort({ date: 1 });

    console.log('[DEBUG] Streak History Fetched:', streakHistory);

    res.json(streakHistory);
  } catch (error) {
    console.error('[ERROR] Error fetching streak history:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
