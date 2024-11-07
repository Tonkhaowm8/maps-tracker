const fs = require('fs');
const path = require('path');
const { connectDb, storeData } = require('../components/dbManager');

// Define the base directory and list of surfaces
const baseDir = path.join(__dirname, 'data');
const surfaceDirs = Array.from({ length: 12 }, (_, i) => `surface ${i + 1}`);

// Helper function to generate MongoDB-like ObjectId
function generateObjectId() {
  return (Math.floor(Math.random() * 1000000000)).toString(16).padStart(24, '0');
}

// Read JSON files and format data
async function readAndFormatData() {

  for (const surface of surfaceDirs) {
    const jsonDir = path.join(baseDir, surface, 'JSON');
    if (!fs.existsSync(jsonDir)) continue;
    let data
    const files = fs.readdirSync(jsonDir);
    console.log(files);
    for (const file of files) {
      const filePath = path.join(jsonDir, file);
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Iterate over each object in the array and add `name` and `sessionID`
        data.forEach((item) => {
            item.name = path.basename(file, '.json'),
            item.sessionId = surface;
        });

        // Store Data in database
        await connectDb();
        await storeData(data, "raw-data");
      
    }
  }
}

// Execute the function
readAndFormatData();
