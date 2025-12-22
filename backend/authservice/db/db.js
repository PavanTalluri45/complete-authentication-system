const mysql = require("mysql2");
require("dotenv").config();

// Create database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Connect to database
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to AuthService database:", err.message);
        process.exit(1);
    }
    console.log("Connected to AuthService MySQL database");
});

// Function to execute SQL queries
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = { query };
