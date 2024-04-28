const express = require("express");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Importing routes
const gameRoutes = require("./api/routes/gameRoutes");

// Using routes
app.use("/api/game", gameRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app; // For testing purposes
