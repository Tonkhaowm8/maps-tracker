// Import dependencies
const express = require('express');
const os = require('os');
const { checkDir, createDir, storeData } = require('./components/dirManagement');

// Global Variables
var newDir = false;

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

// Check Directory
app.post('/data', (req, res) => {
  const { sessionId, key } = req.body;
  
  // Define the directories to check
  const check = [
    ["./data", sessionId],
    [`./data/${sessionId}`, "CSV"],
    [`./data/${sessionId}`, "JSON"]
  ]
  
  // Log the POST request body to the console
  console.log('POST request received with data:', req.body);
  
  // Check and Create Directory
  check.forEach(dir => {
    console.log("Directory: ", dir)
    if (!checkDir(dir[0], dir[1])) {
      createDir(dir[0], dir[1]); // Ensure the directory is created
    }
  });

// Extract variables
req.body.payload.forEach(payload => {
  const { name, time, values } = payload;

  // Add time to values
  const updatedValues = { ...values, time }; // Adds the time to the values object

  console.log(`Name: ${name}, Time: ${time}, Value: ${JSON.stringify(updatedValues)}`);

  // Store the updated values (including time) in the storeData function
  storeData(sessionId, name, updatedValues);
});

  // Check and Create CSV and JSON files for new file and data
  

  res.send(`You sent: ${key}`);
});

