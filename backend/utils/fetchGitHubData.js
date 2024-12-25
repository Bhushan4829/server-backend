const axios = require('axios');

const fetchGitHubData = async () => {
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  try {
    const response = await axios.get('https://api.github.com/users/Bhushan4829/events', {
      headers: { Authorization: `token ${token}` },
    });
    const today = new Date().toISOString().split('T')[0];
    const commitsToday = response.data.filter((event) => {
        const eventDate = new Date(event.created_at).toISOString().split('T')[0];
        return eventDate === today && event.type === 'PushEvent';
      });
    const commits = response.data.filter((event) => event.type === 'PushEvent').length;
    return { commits, totalCommitstoday: commitsToday.length}; // Example data
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return { commits: 0, totalCommitstoday:0};
  }
};

module.exports = fetchGitHubData;
