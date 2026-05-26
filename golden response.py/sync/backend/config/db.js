const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🔒 MongoDB Ecosystem online: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ DB Connection failure: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
