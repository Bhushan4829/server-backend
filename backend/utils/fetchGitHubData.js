const moment = require('moment-timezone');
const axios = require('axios');

const fetchGitHubData = async () => {
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  try {
    const response = await axios.get('https://api.github.com/users/Bhushan4829/events', {
      headers: { Authorization: `token ${token}` },
    });

    // Define local start and end of the current day
    const startOfDay = moment().tz('America/New_York').startOf('day');
    const endOfDay = moment().tz('America/New_York').endOf('day');

    // console.log(`Start of Day (EST): ${startOfDay.format()}`);
    // console.log(`End of Day (EST): ${endOfDay.format()}`);

    // Filter events for commits made within the local day
    const commitsToday = response.data.filter((event) => {
      if (event.type !== 'PushEvent') return false;
      const eventDate = moment(event.created_at).tz('America/New_York');
      // console.log(`Event Date (EST): ${eventDate.format()}, Start: ${startOfDay.format()}, End: ${endOfDay.format()}`);
      return eventDate.isBetween(startOfDay, endOfDay, null, '[]');
    });

    const totalCommits = response.data.filter((event) => event.type === 'PushEvent').length;

    return {
      commits: totalCommits,
      totalCommitstoday: commitsToday.length,
    };
  } catch (error) {
    // console.error('Error fetching GitHub data:', error);
    return { commits: 0, totalCommitstoday: 0 };
  }
};

module.exports = fetchGitHubData;
