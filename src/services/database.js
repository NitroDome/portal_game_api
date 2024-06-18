require('dotenv').config();
const mysql = require('mysql2/promise');

// Create a MySQL pool connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to get a database connection
async function getConnection() {
    return await pool.getConnection();
}

module.exports = {
    getConnection
};
