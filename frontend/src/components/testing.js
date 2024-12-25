const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { fetchGoogleTasks, oauth2Client } = require('../utils/tasks'); // Import tasks module

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (same code as before)
const mongoURI = 'mongodb+srv://bhushanm:Bhushan%402908@personalproject.0nufs.mongodb.net/?retryWrites=true&w=majority&appName=Personalproject';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Google Authentication Routes
app.get('/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/tasks.readonly'];
  const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query; // Get authorization code from query params
    try {
      const response = await oauth2Client.getToken(code); // Get tokens using the code
      const tokens = response.tokens; // Extract tokens from response
      console.log('Tokens:', tokens); // Log tokens for debugging (remove this in production)
  
      oauth2Client.setCredentials(tokens); // Set the credentials in the client
      res.send('Authentication successful! You can close this tab.');
    } catch (error) {
      console.error('Error during authentication callback:', error);
      res.status(500).send('Authentication failed.');
    }
  });
  

// Test Endpoint to Fetch Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await fetchGoogleTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
