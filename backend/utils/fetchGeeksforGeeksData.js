const puppeteer = require("puppeteer-core");

const fetchGeeksforGeeksData = async () => {
    const username = process.env.GFG_USERNAME || "default_username";
    const url = `https://auth.geeksforgeeks.org/user/${username}/practice/`;
    const localChromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; // Windows Chrome Path
    const linuxChromePath = "/usr/bin/google-chrome-stable"; // Linux Chrome Path

    try {
        console.log("Launching browser...");
        
        const browser = await puppeteer.launch({
            executablePath: process.platform === "win32" ? localChromePath : linuxChromePath, // Handle different OS
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
            headless: true,
        });

        console.log("Browser launched successfully.");

        const page = await browser.newPage();
        console.log("Navigating to GeeksforGeeks URL:", url);
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        console.log("Scraping data...");
        const data = await page.evaluate(() => {
            const stats = {};
            const rows = document.querySelectorAll(".score_card_value");

            if (!rows.length) {
                console.error("No rows found on the page.");
                return stats;
            }

            const categories = ["easy", "medium", "hard"];
            rows.forEach((row, index) => {
                if (index < categories.length) {
                    const value = row.textContent.trim();
                    stats[categories[index].toUpperCase()] = parseInt(value, 10) || 0;
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
        return { totalProblemsSolved: 0 }; // Return default data to prevent system failure
    }
};

module.exports = fetchGeeksforGeeksData;
