const puppeteer = require('puppeteer');

const fetchGeeksforGeeksData = async () => {
    const username = process.env.GFG_USERNAME;
    const url = `https://auth.geeksforgeeks.org/user/${username}/practice/`;

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

        console.log('Navigating to GeeksforGeeks URL:', url);
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Scrape data
        const data = await page.evaluate(() => {
            const stats = {};
            const rows = document.querySelectorAll('.problemNavbar_head_nav__a4K6P');

            rows.forEach((row) => {
                const difficultyElement = row.querySelector('.problemNavbar_head_nav--text__UaGCx');
                if (difficultyElement) {
                    const difficultyText = difficultyElement.textContent.trim();
                    const match = difficultyText.match(/(.*)\s\((\d+)\)/);
                    if (match) {
                        stats[match[1].toUpperCase()] = parseInt(match[2], 10);
                    }
                }
            });

            return stats;
        });

        console.log('Scraped Data:', data);

        await browser.close();

        const totalProblemsSolved = Object.values(data).reduce((sum, count) => sum + count, 0);

        return {
            ...data,
            totalProblemsSolved,
        };
    } catch (error) {
        console.error('Error fetching GeeksforGeeks data:', error);
        return { totalProblemsSolved: 0 };
    }
};

module.exports = fetchGeeksforGeeksData;
