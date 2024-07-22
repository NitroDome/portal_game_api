const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require('fs');
const pool = require("./services/pool");
const gameRoutes = require("./api/routes/gameRoutes");

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.options("*", cors());

app.use((req, res, next) => {
    next();
});

// Importing routes
app.use("/api/games", gameRoutes);

// 404 Error handling
app.use((req, res, next) => {
    res.status(404).send({ error: "Not found" });
});

// Set interval to keep the DB connection alive
setInterval(async () => {
    try {
        const conn = await pool.getConnection();
        await conn.query('SELECT 1');
        conn.release();
    } catch (err) {
        console.log('error')
    }
}, 30000); // Every 30 seconds

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
    process.exit(1); // Optional: Exit the process
});

process.on('unhandledRejection', (reason, promise) => {
    process.exit(1); // Optional: Exit the process
});

module.exports = app; // For testing purposes
