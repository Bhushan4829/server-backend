const puppeteer = require('puppeteer');

const fetchGeeksforGeeksData = async (username) => {
  const url = `https://auth.geeksforgeeks.org/user/${username}/practice/`;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.problemNavbar_head__cKSRi', { timeout: 10000 });

    const data = await page.evaluate(() => {
      const stats = {};
      const rows = document.querySelectorAll('.problemNavbar_head_nav__a4K6P');

      rows.forEach((row) => {
        const difficulty = row.querySelector('.problemNavbar_head_nav--text__UaGCx').textContent.trim();
        const match = difficulty.match(/(.*)\s\((\d+)\)/);
        if (match) {
          stats[match[1]] = parseInt(match[2], 10);
        }
      });

      const today = new Date().toISOString().split('T')[0];
      const dailySolvedProblems = Array.from(document.querySelectorAll('.solvedProblemsList')).filter((item) => {
        const date = new Date(item.querySelector('.date').textContent.trim());
        return date.toISOString().split('T')[0] === today;
      });

      return { stats, dailySolved: dailySolvedProblems.length };
    });

    await browser.close();

    const totalProblemsSolved = Object.values(data.stats).reduce((sum, count) => sum + count, 0);
    return {
      ...data.stats,
      totalProblemsSolved,
      dailySolved: data.dailySolved,
    };
  } catch (error) {
    console.error('Error fetching GeeksforGeeks data:', error);
    return { totalProblemsSolved: 0, dailySolved: 0 };
  }
};

module.exports = fetchGeeksforGeeksData;
