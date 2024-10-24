const { rootMeanSquare, normalize, calculateArray } = require('./math.js');
const { connectDb, storeData, getData } = require('./dbManager.js');

const flattenData = (data) => {
  const transformed = data.payload.map(item => ({
    name: item.name,
    time: item.time,
    sessionId: data.sessionId,
    ...item.values  // Spread operator to flatten the values
  }));

  return transformed;
};

const calculateRawData = async (rawData) => {
  let previousLocation;
  let vibration;
  let avgMic;

  for (const data of rawData) {
    let acceleration;
    let unNormalizedMic;

    // Check if the name is "location"
    if (data.name === "location") {
      try {

        // If previous location exists
        if (previousLocation) {
          // get acceleration
          acceleration = await getData("raw-data", {
            "name": "accelerometer",
            "sessionId": data.sessionId,
            "time": { $gte: previousLocation.time, $lt: data.time }
          })

          // get sound
          unNormalizedMic = await getData("raw-data", {
            "name": "microphone",
            "sessionId": data.sessionId,
            "time": { $lt: data.time }
          })

        } else {
          acceleration = await getData("raw-data", {
            "name": "accelerometer",
            "sessionId": data.sessionId,
            "time": { $lt: data.time }
          })

          // get sound
          unNormalizedMic = await getData("raw-data", {
            "name": "microphone",
            "sessionId": data.sessionId,
            "time": { $lt: data.time }
          })
        }
        // Log queried data
        // console.log(`acceleration: ${acceleration}, mic: ${unNormalizedMic}`);

        // Calculate Vibration
        const zArray = extractData(acceleration, "z");
        vibration = rootMeanSquare(zArray);

        // Normalize Mic
        const micArray = extractData(unNormalizedMic, "dBFS");
        avgMic = calculateArray(micArray, "mean");

        // Store data into processed-data collection
        const storeDocs = [{
          "latitude": data.latitude,
          "longitude": data.longitude,
          "time": data.time,
          "zVibration": vibration,
          "microphone": avgMic
        }]
        await storeData(storeDocs, "processed-data");

        // Fetch the previous location from the database
        previous = await getData("raw-data", {
          "name": "location",                // Name is "location"
          "sessionId": data.sessionId,        // Same sessionId as data
          "time": { $lt: data.time }          // Time is less than data.time
        });

        previousLocation = previous[0];
        // console.log(previousLocation);


      } catch (error) {
        console.error("Error fetching previous location: ", error);
      }
    }
  }
};

const extractData = (accelerometerData, field) => {
  // Map through the accelerometer data and dynamically extract the specified field
  const extractedData = accelerometerData.map(data => data[field]);

  return extractedData;
};


module.exports = { flattenData, calculateRawData };
