const express = require("express");
const http = require("http");
const https = require("https");
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

const PORT = process.env.PORT || 8000;
const KEEP_ALIVE_PATH = "/api/v1/test";
const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
const INACTIVITY_CHECK_MS = 60 * 1000;
const SELF_PING_ENABLED = process.env.ENABLE_SELF_PING !== "false";

let lastActivityAt = Date.now();
let isSelfPingInFlight = false;

const buildSelfPingUrl = () => {
  const configuredUrl =
    process.env.SELF_PING_URL || process.env.RENDER_EXTERNAL_URL;

  if (configuredUrl) {
    return configuredUrl.endsWith(KEEP_ALIVE_PATH)
      ? configuredUrl
      : `${configuredUrl.replace(/\/$/, "")}${KEEP_ALIVE_PATH}`;
  }

  return `http://127.0.0.1:${PORT}${KEEP_ALIVE_PATH}`;
};

const startInactivityWatcher = () => {
  if (!SELF_PING_ENABLED) {
    return;
  }

  const selfPingUrl = buildSelfPingUrl();

  setInterval(() => {
    const inactiveForMs = Date.now() - lastActivityAt;

    if (inactiveForMs < INACTIVITY_LIMIT_MS || isSelfPingInFlight) {
      return;
    }

    isSelfPingInFlight = true;

    const requestClient = selfPingUrl.startsWith("https") ? https : http;
    const request = requestClient.get(selfPingUrl, (response) => {
      response.resume();
      lastActivityAt = Date.now();
      isSelfPingInFlight = false;

      if (response.statusCode >= 400) {
        console.error(
          `Self-ping failed with status code ${response.statusCode}`.red
        );
      }
    });

    request.setTimeout(15000, () => {
      request.destroy(new Error("Self-ping request timed out"));
    });

    request.on("error", (error) => {
      isSelfPingInFlight = false;
      console.error(`Self-ping error: ${error.message}`.red);
    });
  }, INACTIVITY_CHECK_MS);

  console.log(
    `Self-ping watcher enabled for ${selfPingUrl} after 10 minutes of inactivity`
      .bgBlue.white
  );
};

//middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use((req, res, next) => {
  lastActivityAt = Date.now();
  next();
});

//routes
app.use("/api/v1/user", require("./routes/userRoute"));
app.use("/api/v1/todo", require("./routes/todoRoute"));
app.use("/api/v1/test", require("./routes/testRouter"));

//listen
app.listen(PORT, () => {
  console.log(
    `Node Server Running on ${process.env.DEV_MODE} mode on Port no ${PORT}`
      .bgMagenta
  );
  startInactivityWatcher();
});
