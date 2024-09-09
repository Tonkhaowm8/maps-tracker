// Import dependencies
const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Route with a parameter
app.get('/user/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Hello, ${name}!`);
});

// Route to handle POST request and log data
app.post('/data', (req, res) => {
  const { key } = req.body;
  
  // Log the POST request body to the console
  console.log('POST request received with data:', req.body);
  console.log('payload: ', req.body.payload[0].values);

  res.send(`You sent: ${key}`);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
