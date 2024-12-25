const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
// Import stat fetchers
const fetchLeetCodeData = require('../utils/fetchLeetCodeData');
const fetchGeeksforGeeksData = require('../utils/fetchGeeksforGeeksData');
const fetchGitHubData = require('../utils/fetchGitHubData');
const { fetchGoogleTasks, oauth2Client } = require('../utils/tasks');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = 'mongodb+srv://bhushanm:Bhushan%402908@personalproject.0nufs.mongodb.net/?retryWrites=true&w=majority&appName=Personalproject';
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));
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
// Generate authentication URL

// Helper function to calculate streak
const calculateStreak = ({ codingStats, githubStats, taskStats }) => {
  const taskPoint = taskStats.completionRate >= 80 ? 1 : 0;
  const codingPoint = (codingStats.leetcodeDailySolved || 0) + (codingStats.geeksDailySolved || 0) >= 2 ? 1 : 0;
  const githubPoint = githubStats.commits > 0 ? 1 : 0;

  const totalPoints = taskPoint + codingPoint + githubPoint;
  return totalPoints >= 2 ? 1 : 0;
};

// Update streak for the day
const updateStreak = async () => {
  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];

  // Fetch data from external sources
  const codingStatsLeetCode = await fetchLeetCodeData();
  const codingStatsGeeksforGeeks = await fetchGeeksforGeeksData('bhushanmahdduu');
  const githubStats = await fetchGitHubData();
  const taskStats = await fetchGoogleTasks();

  // Fetch the most recent streak entry (previous day)
  const previousStreak = await Streak.findOne().sort({ date: -1 });

  const leetcodeDailySolved = previousStreak
    ? Math.max(
        codingStatsLeetCode.totalProblemsSolved -
          (previousStreak.codingStatsLeetCode?.totalProblemsSolved || 0),
        0
      )
    : 0;

  const geeksDailySolved = previousStreak
    ? Math.max(
        codingStatsGeeksforGeeks.totalProblemsSolved -
          (previousStreak.codingStatsGeeksforGeeks?.totalProblemsSolved || 0),
        0
      )
    : 0;

  const codingPoint = leetcodeDailySolved + geeksDailySolved >= 2 ? 1 : 0;
  const githubPoint = githubStats.commits > 0 ? 1 : 0;
  const taskPoint = taskStats.completionRate >= 80 ? 1 : 0;

  const totalPoints = codingPoint + githubPoint + taskPoint;

  let streak = 0;

  const existingStreak = await Streak.findOne({ date: new Date(localToday) });

  if (existingStreak) {
    console.log('Streak for today already exists. Updating data.');

    streak =
      existingStreak.streak +
      (totalPoints >= 2 ? 1 : 0); // Increment streak if conditions are met

    await Streak.updateOne(
      { date: new Date(localToday) },
      {
        streak,
        codingStatsLeetCode,
        codingStatsGeeksforGeeks,
        leetcodeDailySolved,
        geeksDailySolved,
        githubStats,
        taskStats,
      }
    );
  } else {
    streak = previousStreak ? previousStreak.streak : 0;
    if (totalPoints >= 2) streak += 1;

    await Streak.create({
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

  console.log(`Streak for ${localToday}: ${streak}`);
};

// Schedule streak updates to run daily
cron.schedule('0 0 * * *', updateStreak);

// API Endpoint to fetch dashboard data
app.get('/api/dashboard-data', async (req, res) => {
  try {
    const today = new Date();
    const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];

    // Fetch data from external sources
    const codingStatsLeetCode = await fetchLeetCodeData();
    const codingStatsGeeksforGeeks = await fetchGeeksforGeeksData();
    const githubStats = await fetchGitHubData();
    const taskStats = await fetchGoogleTasks();

    // Fetch the most recent streak entry
    const previousStreak = await Streak.findOne().sort({ date: -1 });
    let streakData = await Streak.findOne({ date: new Date(localToday) });
    console.log('Task Stats to Update:', taskStats);

    if (streakData) {
      console.log('Data for today exists. Updating values.');

      const leetcodeDailySolved = previousStreak
        ? Math.max(
            codingStatsLeetCode.totalProblemsSolved -
              (previousStreak.codingStatsLeetCode?.totalProblemsSolved || 0),
            0
          )
        : 0;

      const geeksDailySolved = previousStreak
        ? Math.max(
            codingStatsGeeksforGeeks.totalProblemsSolved -
              (previousStreak.codingStatsGeeksforGeeks?.totalProblemsSolved || 0),
            0
          )
        : 0;

      streakData = await Streak.findOneAndUpdate(
        { date: new Date(localToday) },
        {
          codingStatsLeetCode,
          codingStatsGeeksforGeeks,
          githubStats,
          taskStats,
          leetcodeDailySolved,
          geeksDailySolved,
        },
        { new: true }
      );
    } else {
      console.log('No data found for today. Creating new entry.');
      const leetcodeDailySolved = codingStatsLeetCode.totalProblemsSolved;
      const geeksDailySolved = codingStatsGeeksforGeeks.totalProblemsSolved;

      streakData = await Streak.create({
        date: new Date(localToday),
        codingStatsLeetCode,
        codingStatsGeeksforGeeks,
        githubStats,
        taskStats,
        leetcodeDailySolved,
        geeksDailySolved,
      });
    }

    res.json(streakData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
