const fs = require('fs');
const path = require('path');

// Function to check and create directory
function checkDir(dirPath, dirName) {

  dirPath = path.join(dirPath, dirName);
  
  // Check if the directory exists
  if (!fs.existsSync(dirPath)) {
    // If the directory doesn't exist, create it
    // fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory ${dirName} at ${dirPath} doesn't exist`);
    return false
  } else {
    console.log(`Directory ${dirName} already exists.`);
    return true
  }
}

function createDir(dirPath, dirName) {
    dirPath = path.join(dirPath, dirName);
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`${dirName} Directory created at ${dirPath} `);
}

module.exports = { checkDir, createDir };