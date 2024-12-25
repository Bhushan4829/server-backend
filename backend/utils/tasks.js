require('dotenv').config();
const { google } = require('googleapis');
const { DateTime } = require('luxon'); // Ensure luxon is installed
const fs = require('fs');
// Initialize Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

console.log('OAuth2 Client Initialized');
try {
  const tokenData = fs.readFileSync('./refresh_token.json', 'utf8');
  const { refresh_token } = JSON.parse(tokenData);

  if (refresh_token) {
    oauth2Client.setCredentials({ refresh_token });
    console.log('Refresh Token Loaded');
  }
} catch (error) {
  console.error('Error loading refresh token:', error);
}
// Function to fetch tasks from Google Tasks API
const fetchGoogleTasks = async () => {
  const tasksService = google.tasks({ version: 'v1', auth: oauth2Client });

  try {
    const taskListsResponse = await tasksService.tasklists.list();
    const taskLists = taskListsResponse.data.items || [];

    const allTasks = []; // Store all tasks

    // Get today's date in EST
    const nowEST = DateTime.now().setZone('America/New_York'); // Current EST time
    const todayYear = nowEST.year;
    const todayMonth = nowEST.month - 1; // JavaScript Date months are 0-based
    const todayDate = nowEST.day;

    // Calculate start and end of EST day in UTC for completed tasks
    const startOfDayUTC = nowEST.startOf('day').toUTC();
    const endOfDayUTC = nowEST.endOf('day').toUTC();

    console.log(`Today's Date (EST): ${nowEST.toISODate()}`);
    console.log(`Start of Day (UTC): ${startOfDayUTC.toISO()}`);
    console.log(`End of Day (UTC): ${endOfDayUTC.toISO()}`);

    // Fetch tasks for each task list
    for (const taskList of taskLists) {
      const tasksResponse = await tasksService.tasks.list({
        tasklist: taskList.id,
        showCompleted: true,
        showHidden: true,
      });

      const taskItems = tasksResponse.data.items || [];
      allTasks.push(...taskItems);
    }

    // Filter tasks due today using older simple logic
    const todayTasks = allTasks.filter((task) => {
      if (task.due) {
        const dueDate = new Date(task.due); // Parse `due` date
        return (
          dueDate.getUTCFullYear() === todayYear &&
          dueDate.getUTCMonth() === todayMonth &&
          dueDate.getUTCDate() === todayDate
        );
      }
      return false;
    });

    // Filter tasks completed today (adjusting for EST-UTC window overlap)
    const todayCompletedTasks = allTasks.filter((task) => {
      if (task.completed) {
        const completedDateUTC = DateTime.fromISO(task.completed, { zone: 'UTC' });
        return completedDateUTC >= startOfDayUTC && completedDateUTC <= endOfDayUTC;
      }
      return false;
    });

    console.log('Tasks Due Today (EST):', todayTasks);
    console.log('Tasks Completed Today (Adjusted to EST):', todayCompletedTasks);

    // Prepare the return object
    return {
      totalTasks: todayTasks.length,
      completedTasks: todayCompletedTasks.length,
      todayTasks: todayTasks.map((task) => ({
        title: task.title || 'Untitled Task',
        status: task.status,
        due: task.due, // Original due date
        completed: task.status === 'completed',
        completedTimestamp: task.completed
          ? DateTime.fromISO(task.completed, { zone: 'UTC' }).setZone('America/New_York').toISO()
          : null,
      })),
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { totalTasks: 0, completedTasks: 0, todayTasks: [] };
  }
};

module.exports = { fetchGoogleTasks, oauth2Client };
