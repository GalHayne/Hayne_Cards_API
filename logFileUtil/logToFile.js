const fs = require("fs");
const path = require("path");

const logDirectory = 'logFileUtil/logs';
let logFileName = `log-${getCurrentDate()}.log`;
let logFilePath = path.join(logDirectory, logFileName);

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function logToFile(level, message) {

  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} [${level}] - ${message}\n`;

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error("Error writing to the log file:", err);
    }
  });
}

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

exports.logToFile = logToFile;
