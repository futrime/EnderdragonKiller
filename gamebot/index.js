'use strict';
//@ts-check

import consola from 'consola';
import 'dotenv/config';
import process from 'process';
import {Bot} from './lib/bot.js';

try {
  // Read environment variables.
  const gateway_host = process.env.GATEWAY_HOST || 'localhost';
  const gateway_port = parseInt(process.env.GATEWAY_PORT || '8080');
  const log_level = parseInt(process.env.LOG_LEVEL || '3');
  const mcserver_host = process.env.MCSERVER_HOST || 'localhost';
  const mcserver_port = parseInt(process.env.MCSERVER_PORT || '25565');
  const mcserver_version = process.env.MCSERVER_VERSION || '1.20.1';

  // Set up logging.
  consola.level = log_level;

  const username = 'Alice';  // Temporary

  const bot = new Bot(
      mcserver_host,
      mcserver_port,
      username,
      mcserver_version,
  );

} catch (error) {
  consola.error(`process exited with error: ${error.message}`);
  process.exit(1);
}
