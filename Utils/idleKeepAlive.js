const http = require("http");

const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;
const KEEP_ALIVE_PATH = "/api/v1/test/keepalive";
const KEEP_ALIVE_HEADER = "x-internal-keepalive";

let lastExternalHitAt = Date.now();
let keepAliveRequestInFlight = false;
let keepAliveTimer = null;

const isInternalKeepAliveRequest = (req) =>
  req.originalUrl?.startsWith(KEEP_ALIVE_PATH) ||
  req.path === KEEP_ALIVE_PATH ||
  req.get(KEEP_ALIVE_HEADER) === "1";

const trackServerActivity = (req, res, next) => {
  if (!isInternalKeepAliveRequest(req)) {
    lastExternalHitAt = Date.now();
  }

  next();
};

const shouldSkipKeepAliveLogging = (req) => isInternalKeepAliveRequest(req);

const keepAliveController = (req, res) => {
  res.status(204).end();
};

const sendKeepAliveRequest = (port) =>
  new Promise((resolve) => {
    const request = http.request(
      {
        host: "127.0.0.1",
        port,
        path: KEEP_ALIVE_PATH,
        method: "GET",
        headers: {
          [KEEP_ALIVE_HEADER]: "1",
        },
      },
      (response) => {
        response.resume();
        response.on("end", resolve);
      }
    );

    request.on("error", resolve);
    request.end();
  });

const startIdleKeepAlive = (port, intervalMs = KEEP_ALIVE_INTERVAL_MS) => {
  if (!port || keepAliveTimer) {
    return;
  }

  keepAliveTimer = setInterval(async () => {
    const hasRecentExternalTraffic = Date.now() - lastExternalHitAt < intervalMs;

    if (hasRecentExternalTraffic || keepAliveRequestInFlight) {
      return;
    }

    keepAliveRequestInFlight = true;

    try {
      await sendKeepAliveRequest(port);
    } finally {
      keepAliveRequestInFlight = false;
    }
  }, intervalMs);

  if (typeof keepAliveTimer.unref === "function") {
    keepAliveTimer.unref();
  }
};

module.exports = {
  keepAliveController,
  shouldSkipKeepAliveLogging,
  startIdleKeepAlive,
  trackServerActivity,
};
