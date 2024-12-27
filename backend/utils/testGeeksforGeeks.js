require('dotenv').config(); // Load environment variables from .env
const puppeteer = require('puppeteer');

const fetchGeeksforGeeksData = async () => {
    const url = `https://auth.geeksforgeeks.org/user/bhushanmahdduu/practice/`;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scrape total problems solved for each difficulty level
    const data = await page.evaluate(() => {
        const stats = {};
        const rows = document.querySelectorAll('.problemNavbar_head_nav__a4K6P'); // Update selector if necessary

        rows.forEach((row) => {
            const difficulty = row.querySelector('.problemNavbar_head_nav--text__UaGCx').textContent.trim(); // Update class names
            const match = difficulty.match(/(.*)\s\((\d+)\)/);
            if (match) {
                stats[match[1]] = parseInt(match[2], 10);
            }
        });

        return stats;
    });

    console.log('Scraped Data:', data);

    await browser.close();
};

fetchGeeksforGeeksData();
