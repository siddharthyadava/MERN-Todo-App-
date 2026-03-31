const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");
const connectDB = require("./config/db");
const {
  shouldSkipKeepAliveLogging,
  startIdleKeepAlive,
  trackServerActivity,
} = require("./Utils/idleKeepAlive");

//env config
dotenv.config();

//DB CONNECTION
connectDB();

// rest object
const app = express();

//middlewares
app.use(trackServerActivity);
app.use(morgan("dev", { skip: shouldSkipKeepAliveLogging }));
app.use(express.json());
app.use(cors());

//routes
app.use("/api/v1/user", require("./routes/userRoute"));
app.use("/api/v1/todo", require("./routes/todoRoute"));
app.use("/api/v1/test", require("./routes/testRouter"));

//port
const PORT = process.env.PORT || 8000;

//listen
app.listen(PORT, () => {
  startIdleKeepAlive(PORT);
  console.log(
    `Node Server Running on ${process.env.DEV_MODE} mode on Port no ${PORT}`
      .bgMagenta
  );
});
