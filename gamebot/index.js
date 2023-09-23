'use strict';

import consola from 'consola';
import 'dotenv/config';
import process from 'process';
import {Bot} from './lib/bot.js';

try {
  initializeEnvironmentVariables();

  const username = 'Alice';  // Temporary

  const bot = new Bot(
      process.env.MCSERVER_HOST,
      process.env.MCSERVER_PORT,
      username,
      process.env.MCSERVER_VERSION,
  );

} catch (error) {
  consola.error(`process exited with error: ${error.message}`);
}

function initializeEnvironmentVariables() {
  if (process.env.GATEWAY_HOST === undefined) {
    throw new Error('environment variable GATEWAY_HOST is not defined');
  }

  process.env.GATEWAY_PORT = parseInt(process.env.GATEWAY_PORT) || 14514;

  process.env.LOG_LEVEL = process.env.LOG_LEVEL || '3';

  if (process.env.MCSERVER_HOST === undefined) {
    throw new Error('environment variable MCSERVER_HOST is not defined');
  }

  process.env.MCSERVER_PORT = parseInt(process.env.MCSERVER_PORT) || 25565;

  if (process.env.MCSERVER_VERSION === undefined) {
    throw new Error('environment variable MCSERVER_VERSION is not defined');
  }
}
