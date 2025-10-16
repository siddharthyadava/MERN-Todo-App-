const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

//env config
dotenv.config();

//DB Connection
connectDB();

//rest object
const app = express();

//middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

//routes
app.use("/api/v1/test", require("./routes/testRouter"));

//port
const PORT = process.env.PORT;

//listen
app.listen(PORT, () => {
    console.log(`Node Server is running on ${process.env.DEV_MODE} mode on Port no ${PORT}`);
})