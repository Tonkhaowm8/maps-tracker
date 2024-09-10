const fs = require('fs');
const path = require('path');

// Function to check and create directory
function checkDir(dirName) {

  const dirPath = path.join(__dirname, dirName);
  
  // Check if the directory exists
  if (!fs.existsSync(dirPath)) {
    // If the directory doesn't exist, create it
    // fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory ${sessionId} doesn't exist`);
    return false
  } else {
    console.log(`Directory ${sessionId} already exists.`);
    return true
  }
}

function createDir(dirName) {
    const dirPath = path.join(__dirname, dirName);
    
}

module.exports = { checkDir, createDir };