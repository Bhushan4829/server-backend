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

    const easy = stats.find((item) => item.difficulty === 'Easy')?.count || 0;
    const medium = stats.find((item) => item.difficulty === 'Medium')?.count || 0;
    const hard = stats.find((item) => item.difficulty === 'Hard')?.count || 0;

    // Correct calculation of totalProblemsSolved
    const totalProblemsSolved = easy + medium + hard;

    return {
      easy,
      medium,
      hard,
      totalProblemsSolved,
    };
  } catch (error) {
    console.error('Error fetching LeetCode data:', error.response?.data || error.message);
    return { easy: 0, medium: 0, hard: 0, totalProblemsSolved: 0 };
  }
};

module.exports = fetchLeetCodeData;
