const fs = require('fs');
const path = require('path');
const { calculateArray, rootMeanSquare } = require('./dataManipulation.js')

// Function to check and create directory
function checkDir(dirPath, dirName) {

  dirPath = path.join(dirPath, dirName);
  
  // Check if the directory exists
  if (!fs.existsSync(dirPath)) {
    // If the directory doesn't exist, create it
    // fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory ${dirName} at ${dirPath} doesn't exist`);
    return false;
  } else {
    console.log(`Directory ${dirName} already exists.`);
    return true;
  }
}

function createDir(dirPath, dirName) {
    dirPath = path.join(dirPath, dirName);
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`${dirName} Directory created at ${dirPath} `);
}

function storeData(session, name, data) {
  // Define the directories for JSON and CSV
  const jsonDirPath = path.join("./data", session, 'JSON');
  const csvDirPath = path.join("./data", session, 'CSV');

  // Define file paths
  const jsonFilePath = path.join(jsonDirPath, `${name}.json`);
  const csvFilePath = path.join(csvDirPath, `${name}.csv`);

  // Handle JSON file
  if (fs.existsSync(jsonFilePath)) {
      // If JSON file exists, read it, add the new data, and write it back
      const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
      fileData.push(data);
      fs.writeFileSync(jsonFilePath, JSON.stringify(fileData, null, 2));
  } else {
      // If JSON file doesn't exist, create it with the initial data
      fs.writeFileSync(jsonFilePath, JSON.stringify([data], null, 2));
  }

  // Handle CSV file
  if (fs.existsSync(csvFilePath)) {
    // If CSV file exists, append the new data as a comma-separated string
    let csvData = '';
    
    // Check if data is an object
    if (typeof data === 'object' && !Array.isArray(data)) {
        csvData = Object.values(data).join(','); // Get the values of the object and join them with commas
    } else if (Array.isArray(data)) {
        csvData = data.join(','); // If it's an array, join the array elements with commas
    } else {
        csvData = data; // If it's a simple value, just use it as is
    }

    // Append the values to the CSV file
    fs.appendFileSync(csvFilePath, csvData + '\n');
  } else {
    // If CSV file doesn't exist, create it and add the initial data
    let csvData = '';
    
    // Check if data is an object
    if (typeof data === 'object' && !Array.isArray(data)) {
        // Write CSV header (keys of the object)
        const headers = Object.keys(data).join(',');
        fs.writeFileSync(csvFilePath, headers + '\n');  // Write headers first
        
        // Write the values (data)
        csvData = Object.values(data).join(',');
    } else if (Array.isArray(data)) {
        csvData = data.join(','); // If it's an array, join the array elements with commas
    } else {
        csvData = data; // If it's a simple value, just use it as is
    }

    // Write the data to the file (first write the headers, then the data)
    fs.writeFileSync(csvFilePath, csvData + '\n', { flag: 'a' });
  }
}

async function findVibration(name, data, accArr) {
  if (name === "accelerometer") {
    // Initialize the arrays only once using nullish coalescing (faster than multiple checks)
    accArr.x = accArr.x ?? [];
    accArr.y = accArr.y ?? [];
    accArr.z = accArr.z ?? [];

    // Push all values directly (in a single access to `accArr`)
    accArr.x.push(data.x);
    accArr.y.push(data.y);
    accArr.z.push(data.z);
  } else if (name === "location") {

    // Find Root Mean Square
    vbr = {
      x: rootMeanSquare(accArr.x),
      y: rootMeanSquare(accArr.y),
      z: rootMeanSquare(accArr.z)
    }
    accArr.vbr = vbr

    // log vibration
    console.log(`Vibration: ${JSON.stringify(vbr)}`)

    // Clear all arrays in one go by resetting their length
    accArr.x.length = 0;
    accArr.y.length = 0;
    accArr.z.length = 0;
  }

  return accArr;
}


module.exports = { checkDir, createDir, storeData, findVibration };