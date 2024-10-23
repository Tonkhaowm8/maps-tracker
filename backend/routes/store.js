const {connectDb, storeData, getData} = require('../components/dbManager')
const { flattenData } = require('../components/dataManipulation');
let connected = false;

const store = async (req, res) => {
    try {
        // Connect to DB if not connected
        if (!connected) {
            connected = await connectDb();
        }

        // Flatten the incoming data from the request body
        const flattenedData = flattenData(req.body);
        // console.log(flattenedData);

        // Store the flattened data into the database
        const result = await storeData(flattenedData, "raw-data");

        // Send a success response
        res.status(200).json({ success: true, message: 'Data stored successfully', data: result });
    } catch (error) {
        console.error('Error storing data:', error);
        res.status(500).json({ success: false, message: 'Error storing data', error });
    }
};

module.exports = { store };