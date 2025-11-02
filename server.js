require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;
const { Pool } = require('pg');


console.log("--- DEBUG CREDENTIALS ---");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("-------------------------");


const pgPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Optional: Set max connections and idle timeout
    max: 10, // Max number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client can be idle before being disconnected
});

// Middleware to parse JSON
app.use(express.json());

app.get('/database-test', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT NOW() as current_time');
        res.status(200).json({
            message: 'Database connection successful via Pool',
            time: result.rows[0].current_time
        });
    } catch (error) {
        console.error('Database connection error:', error.message);
        res.status(500).json({ message: 'Failed to connect to database.' });
    }
});

pgPool.connect()
    .then(client => {
        console.log("Database Pool connected successfully!");
        client.release(); // Release the client back to the pool
    })
    .catch(err => {
        console.error("Error connecting to database pool:", err.message);
    });


// The single endpoint to fetch a list of users
app.get('/users', async (req, res) => {
    try {
        // Fetch data from the public JSONPlaceholder API
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');

        // Respond with the fetched data
        res.status(200).json({
            message: 'User list fetched successfully',
            count: response.data.length,
            users: response.data
        });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Failed to fetch user data.' });
    }
});

// A simple root endpoint to confirm the server is running
app.get('/', (req, res) => {
    res.send('Node.js Server is running!');
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});