// Advanced logging utility for Flappy Pi Duels Server
import fs from 'fs';
import path from 'path';

class Logger {
  constructor(config) {
    this.config = config;
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    this.currentLevel = this.logLevels[config.logging.level] || 2;
    this.logFile = null;
    
    if (config.logging.enableFile) {
      this.setupFileLogging();
    }
  }

  setupFileLogging() {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logDir, `duels-server-${timestamp}.log`);
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  writeLog(level, message, meta = {}) {
    if (this.logLevels[level] > this.currentLevel) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    if (this.config.logging.enableConsole) {
      const colors = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m', // Cyan
        debug: '\x1b[90m', // Gray
        reset: '\x1b[0m'
      };
      
      console.log(`${colors[level]}${formattedMessage}${colors.reset}`);
    }

    if (this.logFile) {
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    }
  }

  error(message, meta = {}) {
    this.writeLog('error', message, meta);
  }

  warn(message, meta = {}) {
    this.writeLog('warn', message, meta);
  }

  info(message, meta = {}) {
    this.writeLog('info', message, meta);
  }

  debug(message, meta = {}) {
    this.writeLog('debug', message, meta);
  }

  // Game-specific logging methods
  gameEvent(event, data = {}) {
    this.info(`🎮 Game Event: ${event}`, data);
  }

  playerAction(playerId, action, data = {}) {
    this.debug(`👤 Player ${playerId}: ${action}`, data);
  }

  roomEvent(roomId, event, data = {}) {
    this.info(`🏠 Room ${roomId}: ${event}`, data);
  }

  connectionEvent(socketId, event, data = {}) {
    this.info(`🔌 Connection ${socketId}: ${event}`, data);
  }

  performance(metric, value, unit = 'ms') {
    this.debug(`⚡ Performance: ${metric} = ${value}${unit}`);
  }
}

export default Logger;
