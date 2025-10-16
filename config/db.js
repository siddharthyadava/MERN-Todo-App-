const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected to Mongodb ${mongoose.connection.host}`)
    } catch (error) {
        console.log(`Mongodb Error ${error}`)
    }
}

module.exports = connectDB;