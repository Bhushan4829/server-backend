const axios = require('axios');

const fetchLeetCodeData = async () => {
  const username = process.env.LEETCODE_USERNAME;
  const query = `
  {
    matchedUser(username: "${username}") {
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }`;

  try {
    const response = await axios.post('https://leetcode.com/graphql', { query });
    console.log('Response Data:', response.data); // Log response for debugging
    const stats = response.data.data.matchedUser.submitStats.acSubmissionNum;

    return {
      easy: stats[1].count,
      medium: stats[2].count,
      hard: stats[3].count,
      totalProblemsSolved: stats.reduce((acc, curr) => acc + curr.count, 0),
    };
  } catch (error) {
    console.error('Error fetching LeetCode data:', error.response?.data || error.message);
    return { easy: 0, medium: 0, hard: 0, totalProblemsSolved: 0 };
  }
};

module.exports = fetchLeetCodeData;
