const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Middleware

app.use('/api', apiRoutes); // Mount your API routes

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
