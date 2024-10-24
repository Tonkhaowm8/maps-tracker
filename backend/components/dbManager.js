const mongoose = require("mongoose");

// MongoDB Connection URI
const mongoURI = "mongodb://localhost:27017/data";

// Function to connect to MongoDB
const connectDb = async (req, res) => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");

        return true;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        res.status(500).json({ message: "Database connection error" });
    }
};

// Store Data to raw-data DB (bypassing model)
const storeData = async (dataArray, collectionName ) => {
    try {
        // Check if the input is an array
        if (!Array.isArray(dataArray)) {
            throw new Error('Input must be an array');
        }

        // Get the 'maps' collection directly from the connected MongoDB instance
        const collection = await mongoose.connection.collection(collectionName);

        // Insert the JSON array into the collection
        const result = await collection.insertMany(dataArray);

        console.log(`Successfully stored ${result.insertedCount} items.`);
        return result; // Return the result for additional handling if needed
    } catch (error) {
        console.error('Error storing data:', error.message);
        throw error; // Re-throw for handling in calling function
    }
};

const getData = async (collectionName, query = {}) => {
    try {
        // Access the collection dynamically using collectionName
        const collection = mongoose.connection.collection(collectionName);

        // Find documents based on the query
        const data = await collection.find(query).toArray();

        // Log the retrieved data (optional)
        console.log(`Found ${data.length} documents in collection: ${collectionName}`);

        return data; // Return the found data
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error; // Re-throw the error for handling in calling function
    }
};

// Export the functions
module.exports = {
    connectDb,
    storeData,
    getData
};