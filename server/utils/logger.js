const fs = require('fs');
const path = require('path');

// Logger utility class
class Logger {
  constructor() {
    this.isLocal = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging';
    this.logFile = path.join(process.cwd(), 'stderr.log');
  }

  log(message, data = null) {
    if (!this.isLocal) return; // Skip logging in production/staging

    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${message}`;
    
    if (data !== null) {
      if (typeof data === 'object') {
        logMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        logMessage += ` ${data}`;
      }
    }
    logMessage += '\n';

    try {
      // Append to stderr.log file
      fs.appendFileSync(this.logFile, logMessage);
      
      // Also log to console for immediate feedback
      console.log(message, data || '');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  error(message, error = null) {
    if (!this.isLocal) return;
    
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ERROR: ${message}`;
    
    if (error) {
      logMessage += `\nError: ${error.message}`;
      if (error.stack) {
        logMessage += `\nStack: ${error.stack}`;
      }
    }
    logMessage += '\n';

    try {
      fs.appendFileSync(this.logFile, logMessage);
      console.error(message, error || '');
    } catch (writeError) {
      console.error('Failed to write error to log file:', writeError);
    }
  }
}

const logger = new Logger();
module.exports = logger;