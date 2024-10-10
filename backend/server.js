// Import dependencies
const express = require('express');
const os = require('os');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { checkDir, createDir, storeData, findVibration, updateMapData} = require('./components/dirManagement');
const cors = require('cors');

// Global Variables
var newDir = false;
var localIP;

// Initialize Stuff
const app = express();
const port = 4000;

// Use CORS
app.use(cors());

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

// Start the HTTP server
http.createServer(app).listen(port, '0.0.0.0', () => {
  localIP = getLocalIP(); // Get the local IP
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
  ];
  
  // Check and Create Directory
  check.forEach(dir => {
    if (!checkDir(dir[0], dir[1])) {
      createDir(dir[0], dir[1]); // Ensure the directory is created
    }
  });

  let lastTimeData = {}; // Store the last processed time for each name
  let accArr = {
    x: [],
    y: [],
    z: [],
    vbr: [],
    mic: []
  }; // Initialize the accelerometer data array outside

  req.body.payload.forEach(async (payload) => {
    const { name, time, values } = payload;
  
    // Round the Unix timestamp to the nearest second
    const roundedTime = Math.floor(time / 1000); // Convert ms to seconds

    let updatedValues;
  
    // Check if the current timestamp is the same as the last one for this name
    if (lastTimeData[name] !== roundedTime) {
      // Add rounded time to the values object
      updatedValues = { ...values, time: roundedTime };
  
      // Store the updated values (including rounded time)
      storeData(sessionId, name, updatedValues);

      // Update the last processed time for this name
      lastTimeData[name] = roundedTime;
    } else {
      // If the time is the same, replace the previous data
      updatedValues = { ...values, time: roundedTime };
  
      // Store the updated values (including rounded time)
      storeData(sessionId, name, updatedValues);
    }
  
    // Find Vibration
    accArr = await findVibration(name, updatedValues, accArr); // Apply the findVibration function here
  });
  
  res.send(`You sent: ${key}`);
});

// Proxy to bypass SSL restriction
app.get('/get-data', async (req, res) => {
  try {
    const response = await fetch(`http://${localIP}:${port}/getData`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Get data
app.get('/getData', (req, res) => {
  const filePath = path.join('map-data.json');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading the file');
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error(parseError);
      res.status(500).send('Error parsing the JSON');
    }
  });
});
