require("dotenv").config(); // Load environment variables

const fetchGeeksforGeeksData = require("./fetchGeeksforGeeksData");

const testGeeksforGeeksData = async () => {
    console.log("Testing GeeksforGeeks Data Retrieval...");

    try {
        const data = await fetchGeeksforGeeksData();
        console.log("GeeksforGeeks Data:", data);

        if (!data || Object.keys(data).length === 0) {
            console.error(
                "No data retrieved. Check the selectors or ensure the GeeksforGeeks username is valid."
            );
        } else {
            console.log("Test Successful. Data retrieved correctly.");
        }
    } catch (error) {
        console.error("Error testing GeeksforGeeks Data Retrieval:", error);
    }
};

testGeeksforGeeksData();
