const { createLogger, transports, format } = require("winston");
const path = require("path");

function formatTimestamp(timestamp) {
  return `${timestamp}`.replace("T", " ").replace("Z", "");
}

const customFormat = format.combine(
  format.timestamp(),
  format.printf(
    (info) =>
      `${formatTimestamp(info.timestamp)} - [${info.level.toUpperCase()}] - ${
        info.message
      }`
  )
);

const logger = createLogger({
  format: customFormat,
  transports: [
    new transports.Console({ level: "debug" }),
    new transports.File({
      filename: path.join("logs", "app.log"),
      level: "error",
    }),
  ],
});

module.exports = { logger };
