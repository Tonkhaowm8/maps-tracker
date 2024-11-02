const { calculateRawData } = require('../components/dataManipulation');
const { getData, connectDb } = require("../components/dbManager");

async function processData() {
    await connectDb();
    for (let i = 1; i <= 12; i++) {
        console.log(`surface ${i}`);
        
        // Await the `getData` call here
        const data = await getData("raw-data", { "sessionId": `surface ${i}` }, true);
        // console.log("Data ", data[0]);
        if (data && data.length !== 0) {
            // Use `for...of` loop here to await each `calculateRawData` call
            calculateRawData(data);
        }
    }
}

// Call the function
processData()
    .then(() => console.log("Processing completed"))
    .catch((error) => console.error("Error processing data:", error));

