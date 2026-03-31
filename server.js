const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");
const connectDB = require("./config/db");

//env config
dotenv.config();

//DB CONNECTION
connectDB();

// rest object
const app = express();

// Keep-alive "Null" endpoint
app.get("/ping", (req, res) => {
  res.status(200).end(); 
});

// Existing routes
app.use("/api/v1/user", require("./routes/userRoute"));


//middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

//routes
app.use("/api/v1/user", require("./routes/userRoute"));
app.use("/api/v1/todo", require("./routes/todoRoute"));
app.use("/api/v1/test", require("./routes/testRouter"));

//port
const PORT = process.env.PORT || 8000;

//listen
app.listen(PORT, () => {
  console.log(
    `Node Server Running on ${process.env.DEV_MODE} mode on Port no ${PORT}`
      .bgMagenta
  );
});


const https = require("https");

// Replace with your actual Render URL
const SERVER_URL = "https://onrender.com";

setInterval(() => {
  https.get(SERVER_URL, (res) => {
    // Zero output logic: do nothing with the response
  }).on("error", (err) => {
    // Only logs if the network fails
    console.error("Keep-alive error:", err.message);
  });
}, 600000); // 10 minutes
