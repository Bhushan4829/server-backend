const puppeteer = require('puppeteer');

const fetchGeeksforGeeksData = async () => {
    const username = process.env.GFG_USERNAME; // Ensure GFG_USERNAME is set in your .env file
    const url = `https://auth.geeksforgeeks.org/user/${username}/practice/`;

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for certain environments like Render
        });
        const page = await browser.newPage();

        console.log('Navigating to GeeksforGeeks URL:', url);
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Scrape total problems solved for each difficulty level
        const data = await page.evaluate(() => {
            const stats = {};
            const rows = document.querySelectorAll('.problemNavbar_head_nav__a4K6P'); // Update selector as per structure

            rows.forEach((row) => {
                const difficultyElement = row.querySelector('.problemNavbar_head_nav--text__UaGCx'); // Selector for difficulty
                if (difficultyElement) {
                    const difficultyText = difficultyElement.textContent.trim();
                    const match = difficultyText.match(/(.*)\s\((\d+)\)/);
                    if (match) {
                        stats[match[1].toUpperCase()] = parseInt(match[2], 10); // Store stats with uppercase keys for consistency
                    }
                }
            });

            return stats;
        });

        console.log('Scraped Data:', data);

        await browser.close();

        // Calculate total problems solved
        const totalProblemsSolved = Object.values(data).reduce((sum, count) => sum + count, 0);

        return {
            ...data,
            totalProblemsSolved,
            dailySolved: 0, // Placeholder, as daily solved data is not implemented
        };
    } catch (error) {
        console.error('Error fetching GeeksforGeeks data:', error);
        return { totalProblemsSolved: 0, dailySolved: 0 };
    }
};

module.exports = fetchGeeksforGeeksData;
