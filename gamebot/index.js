'use strict';

import consola from 'consola';
import 'dotenv/config';
import process from 'process';
import {Bot} from './lib/bot.js';

try {
  initializeEnvironmentVariables();

  const username = 'Alice';  // Temporary

  const bot = new Bot(
      process.env.HOST,
      process.env.PORT,
      username,
      process.env.VERSION,
  );

} catch (error) {
  consola.error(`process exited with error: ${error.message}`);
}

function initializeEnvironmentVariables() {
  if (process.env.HOST === undefined) {
    throw new Error('environment variable HOST is not defined');
  }

  if (process.env.VERSION === undefined) {
    throw new Error('environment variable VERSION is not defined');
  }

  process.env.LOG_LEVEL = process.env.LOG_LEVEL || '3';
  process.env.PORT = process.env.PORT || 25565;
}
