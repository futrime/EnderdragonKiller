//@ts-check
'use strict';

import consola from 'consola';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import process from 'process';
import {Bot} from './lib/bot.js';
import {router as routerApiState} from './routes/state/index.js';

try {
  // Read environment variables.
  const gateway_host = process.env.GATEWAY_HOST || '127.0.0.1';
  const gateway_port = parseInt(process.env.GATEWAY_PORT || '80');
  const listen_port = parseInt(process.env.LISTEN_PORT || '8080');
  const log_level = parseInt(process.env.LOG_LEVEL || '3');
  const mcserver_host = process.env.MCSERVER_HOST || '127.0.0.1';
  const mcserver_port = parseInt(process.env.MCSERVER_PORT || '25565');
  const mcserver_version = process.env.MCSERVER_VERSION || '1.20.1';

  // Set up logging.
  consola.level = log_level;

  // Register the bot on the gateway.
  const username = await registerBot(
      listen_port,
      gateway_host,
      gateway_port,
  );

  // Create the bot.
  const bot = new Bot(
      mcserver_host,
      mcserver_port,
      username,
      mcserver_version,
  );

  // Set up express.
  const app = express();

  app.locals.bot = bot;

  app.use(morgan('tiny'));
  app.use(cors());
  app.use(express.json());

  app.use('/api/state', routerApiState);

  app.use((_, res) => {
    res.status(404).send({
      apiVersion: '0.1.0',
      error: {
        code: 404,
        message: 'The requested resource was not found.',
      },
    });
  });

  app.listen(listen_port, '0.0.0.0', () => {
    consola.info(`listening on port ${listen_port}`);
  });

} catch (error) {
  consola.error(`process exited with error: ${error.message}`);
  process.exit(1);
}

/**
 * Registers a bot on the gateway.
 * @param {number} listen_port The port of the gamebot.
 * @param {string} gateway_host The host of the gateway.
 * @param {number} gateway_port The port of the gateway.
 * @returns {Promise<string>} The username of the bot.
 */
async function registerBot(listen_port, gateway_host, gateway_port) {
  consola.debug(`fetch('http://${gateway_host}:${gateway_port}/api/bots')`);
  const res = await fetch(
      `http://${gateway_host}:${gateway_port}/api/bots`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiVersion: '0.1.0',
          data: {
            port: listen_port,
          },
        }),
      },
  );

  const json = await res.json();

  return json.data.username;
}
