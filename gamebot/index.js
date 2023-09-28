//@ts-check
'use strict';

import consola from 'consola';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import process from 'process';
import {Bot} from './lib/bot.js';
import {router as routerApiStatus} from './routes/status/index.js';
import {router as routerApiProgram} from './routes/program/index.js';
import Ajv from 'ajv';

try {
  // Read environment variables.
  const gateway_host = process.env.GATEWAY_HOST || '127.0.0.1';
  const gateway_port = parseInt(process.env.GATEWAY_PORT || '8080');
  const listen_port = parseInt(process.env.LISTEN_PORT || '8080');
  const log_level = parseInt(process.env.LOG_LEVEL || '3');
  const mcserver_host = process.env.MCSERVER_HOST || '127.0.0.1';
  const mcserver_port = parseInt(process.env.MCSERVER_PORT || '25565');
  const mcserver_version = process.env.MCSERVER_VERSION || '1.20.1';

  // Set up logging.
  consola.level = log_level;

  // Register the bot on the gateway.
  consola.log('registering bot...');
  const {username} =
      await registerBot(
          listen_port,
          gateway_host,
          gateway_port,
          )
          .catch((error) => {
            throw new Error(`failed to register bot: ${error.message}`);
          });
  consola.log(`registered bot as ${username}`);

  // Create the bot.
  const bot = new Bot(
      mcserver_host,
      mcserver_port,
      username,
      mcserver_version,
  );

  // Set up express.
  await setupExpress(bot, listen_port);

} catch (error) {
  consola.error(`process exited with error: ${error.message}`);
  process.exit(1);
}

/**
 * Registers a bot on the gateway.
 * @param {number} listen_port The port of the gamebot.
 * @param {string} gateway_host The host of the gateway.
 * @param {number} gateway_port The port of the gateway.
 * @returns {Promise<{username: string}>} The username of the bot.
 */
async function registerBot(listen_port, gateway_host, gateway_port) {
  const response =
      await fetch(
          `http://${gateway_host}:${gateway_port}/api/bots`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apiVersion: '0.0.0',
              data: {
                port: listen_port,
              },
            }),
          },
          )
          .catch((error) => {
            throw new Error(`failed to fetch http://${gateway_host}:${
                gateway_port}/api/bots: ${error.message}`);
          });

  if ([201, 409].includes(response.status) === false) {
    throw new Error(`failed to fetch http://${gateway_host}:${
        gateway_port}/api/bots:  ${response.status} ${response.statusText}`);
  }
  if (response.status === 409) {
    consola.warn('bot already registered, restart gateway if necessary');
  }

  const responseJson = await response.json().catch((error) => {
    throw new Error(`failed to parse response: ${error.message}`);
  });

  // Validate response.
  const SCHEMA = {
    'type': 'object',
    'properties': {
      'apiVersion': {
        'type': 'string',
      },
      'data': {
        'type': 'object',
        'properties': {
          'username': {
            'type': 'string',
          },
        },
        'required': [
          'username',
        ],
      }
    },
    'required': [
      'apiVersion',
      'data',
    ],
  };
  const ajv = new Ajv();
  const validate = ajv.compile(SCHEMA);
  const valid = validate(responseJson);
  if (valid !== true) {
    throw new Error(`got invalid response fetching http://${gateway_host}:${
        gateway_port}/api/bots: ${JSON.stringify(validate.errors)}`);
  }

  return {
    username: responseJson.data.username,
  };
}

/**
 * Sets up express.
 * @param {Bot} bot The bot.
 * @param {number} listen_port The port of the gamebot.
 * @returns {Promise<express.Express>} The express app.
 */
async function setupExpress(bot, listen_port) {
  const app = express()
                  .use(morgan('tiny'))
                  .use(cors())
                  .use(express.json({
                    strict: true,
                  }))
                  // TODO: handle errors.
                  .use('/api/program', routerApiProgram)
                  .use('/api/status', routerApiStatus)
                  .use((_, res) => {
                    return res.status(404).send({
                      apiVersion: '0.0.0',
                      error: {
                        code: 404,
                        message: 'The requested resource was not found.',
                      },
                    });
                  });

  app.locals.bot = bot;

  app.listen(listen_port, '0.0.0.0', () => {
    consola.info(`listening on port ${listen_port}`);
  });

  return app;
}
