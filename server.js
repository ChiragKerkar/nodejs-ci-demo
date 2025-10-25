const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

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