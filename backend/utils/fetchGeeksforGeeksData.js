const puppeteer = require("puppeteer-core");
// const path = require("path");

const fetchGeeksforGeeksData = async () => {
    const username = process.env.GFG_USERNAME || "default_username";
    const url = `https://auth.geeksforgeeks.org/user/${username}/practice/`;
    const localChromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; // Path to local Chrome binary

    try {
        // console.log("Using local Chrome binary for testing...");
        // console.log("Launching browser with executable path:", localChromePath);

        const browser = await puppeteer.launch({
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--window-size=1280x800",
            ],
            defaultViewport: {
                width: 1280,
                height: 800,
            },
            // executablePath: localChromePath,
            channel: 'chrome',
            headless: true,
        });

        console.log("Browser launched successfully.");

        const page = await browser.newPage();
        console.log("Navigating to GeeksforGeeks URL:", url);
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        console.log("Scraping data...");
        const data = await page.evaluate(() => {
            const stats = {};
            const rows = document.querySelectorAll(".problemNavbar_head_nav__a4K6P");
            if (!rows.length) {
                console.error("No rows found on the page.");
                return stats;
            }
            rows.forEach((row) => {
                const difficultyElement = row.querySelector(".problemNavbar_head_nav--text__UaGCx");
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

        console.log("Scraped Data:", data);
        await browser.close();

        const totalProblemsSolved = Object.values(data).reduce((sum, count) => sum + count, 0);
        return {
            ...data,
            totalProblemsSolved,
        };
    } catch (error) {
        console.error("Error fetching GeeksforGeeks data:", error);
        return { totalProblemsSolved: 0 };
    }
};

module.exports = fetchGeeksforGeeksData;
