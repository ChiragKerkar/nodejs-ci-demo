import 'dotenv/config'; // Modern way to load dotenv in TypeScript/ESM
import express from 'express';
import type { Request, Response } from 'express';
import axios from 'axios';
import { Pool } from 'pg';
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.ts";

const app = express();
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

interface TimeResult {
    current_time: Date;
}


const pgPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    // Optional: Set max connections and idle timeout
    max: 10, // Max number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client can be idle before being disconnected
});

pgPool.connect()
    .then(client => {
        console.log("Database Pool connected successfully!");
        client.release(); // Release the client back to the pool
    })
    .catch(err => {
        console.error("Error connecting to database pool:", err.message);
    });

// Middleware to parse JSON
app.use(express.json());
app.use("/api/auth", authRoutes);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend files
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/users", async (req, res) => {
  // Fetch from Prisma (example)
  // const users = await prisma.user.findMany();
  const users = [{ id: 1, name: "Chirag", email: "test@example.com" }];
  res.json(users);
});

app.get('/database-test', async (req: Request, res: Response) => {
    try {
        const result = await pgPool.query('SELECT NOW() as current_time');
        res.status(200).json({
            message: 'Database connection successful via Pool',
            time: result.rows[0].current_time
        });
    } catch (error: any) {
        console.error('Database connection error:', error.message);
        res.status(500).json({ message: 'Failed to connect to database.' });
    }
});




// The single endpoint to fetch a list of users
app.get('/users', async (req: Request, res: Response) => {
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
        const errorMessage = (error as Error).message || 'An unknown error occurred.';
        console.error('Error fetching users:', errorMessage);
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