const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const pool = require("./services/pool");
const gameRoutes = require("./api/routes/gameRoutes");
const apiKeyMiddleware = require("./utils/apiKeyMiddleware");
const helmet = require("helmet");
const cors = require("cors");
const fs = require("fs");

const allowedOrigins = ["http://localhost", "http://127.0.0.1"];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
    })
);

app.use(helmet());
app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
    next();
});

app.use("/api/games", apiKeyMiddleware, gameRoutes);

app.use((req, res, next) => {
    res.status(404).send({ error: "Not found" });
});

function logToFile(message) {
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;
    const serverpath = process.env.SERVERPATH;
    fs.appendFileSync(serverpath, logMessage);
}

setInterval(async () => {
    try {
        const conn = await pool.getConnection();
        await conn.query("SELECT 1");
        conn.release();
    } catch (err) {
        logToFile("error Database");
    }
}, 30000); // Every 30 seconds

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    logToFile(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (err) => {
    process.exit(1); // Optional: Exit the process
});

process.on("unhandledRejection", (reason, promise) => {
    process.exit(1); // Optional: Exit the process
});

module.exports = app; // For testing purposes
