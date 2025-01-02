const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { MongoClient } = require("mongodb");
const fs = require("fs");
require("dotenv").config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.mongodb.net/test?retryWrites=true&w=majority";

async function connectToDatabase() {
  // Use local caching variables
  let cachedClient = null;
  let cachedDb = null;

  if (cachedDb) {
    console.log("Reusing existing MongoDB connection.");
    return cachedDb;
  }

  try {
    console.log("Connecting to MongoDB with URI:", MONGODB_URI);

    if (!MONGODB_URI) {
      throw new Error("MONGO_URI is undefined. Please check your environment variables.");
    }

    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Timeout for Lambda cold starts
    });

    cachedClient = client;
    cachedDb = client.db();
    console.log("Connected to MongoDB successfully.");

    // Ensure streaks collection exists
    const collections = await cachedDb.listCollections({ name: "streaks" }).toArray();
    if (collections.length === 0) {
      console.log("Streaks collection does not exist. Creating it...");
      await cachedDb.createCollection("streaks");
    }

    return cachedDb;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Example API Route
app.get("/api/test", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const streaksCollection = db.collection("streaks");
    const data = await streaksCollection.find({}).toArray();
    res.json({ message: "Connected successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Start server Locally
if (process.env.IS_LOCAL === "true") {
  const PORT = 3000;
  app.listen(PORT, () => console.log(`Local server running on http://localhost:${PORT}`));
}

// Export for AWS Lambda
module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; // Allow Lambda to exit early
  return serverless(app)(event, context);
};
