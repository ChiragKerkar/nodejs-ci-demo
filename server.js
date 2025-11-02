import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from "url";
const { Pool } = pkg;

dotenv.config();

const app = express();
const PORT = 3000;

console.log("--- DEBUG CREDENTIALS ---");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("-------------------------");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pgPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 10,
    idleTimeoutMillis: 30000,
});

app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(express.json());

// Routes
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
        client.release();
    })
    .catch(err => {
        console.error("Error connecting to database pool:", err.message);
    });

app.get('/users', async (req, res) => {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
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

app.get('/', (req, res) => {
    // res.send('Node.js Server is running!');
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
