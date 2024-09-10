// Import dependencies
const express = require('express');
const os = require('os');
const { checkDir } = require('./components/dirManagement');


// Initialize Stuff
const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to get the local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Check if it's IPv4 and not internal (not the loopback interface)
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
}

// Start the server
app.listen(port, '0.0.0.0', () => {
  const localIP = getLocalIP(); // Get the local IP
  console.log(`Server is running on:`);
  console.log(`- Local:    http://localhost:${port}`);
  console.log(`- Network:  http://${localIP}:${port}`);
});

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Route to handle POST request and log data
app.post('/data', (req, res) => {
  const { key } = req.body;
  
  // Log the POST request body to the console
  console.log('POST request received with data:', req.body);
  
  // Check Directory
  if (checkDir(req.body.sessionId)) {
    
  }

  res.send(`You sent: ${key}`);
});
