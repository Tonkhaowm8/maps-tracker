const {connectDb, getData} = require('../components/dbManager')
let connected = false;

const retrieve = async (req, res) => {
    try {
        // Connect to DB if not connected
        if (!connected) {
            connected = await connectDb();
        }

        // req body
        const query = req.body;

        // Get data in raw-data
        const data = await getData("processed-data", query);

        // Send a success response
        res.status(200).json(data);

    } catch (error) {

        console.error('Error storing data:', error);
        res.status(500).json({ success: false, message: 'Error storing data', error });

    }
};

module.exports = { retrieve };