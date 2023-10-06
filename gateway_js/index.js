//@ts-check
'use strict';

import {faker} from '@faker-js/faker';
import consola from 'consola';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import process from 'process';
import {router as routerApiBots} from './routes/bots/index.js';

try {
  // Read environment variables.
  const listen_port = parseInt(process.env.LISTEN_PORT || '8080');
  const log_level = parseInt(process.env.LOG_LEVEL || '3');
  const faker_seed = parseInt(process.env.FAKER_SEED || '114514');

  // Set up logging.
  consola.level = log_level

  // Setup Faker.
  faker.seed(faker_seed);

  // Set up shared data.
  /**
   * @type {import('./lib/bot').Bot[]}
   */
  const bots = [];

  // Set up express.
  setupExpress(bots, listen_port);

} catch (error) {
  consola.error(`process exited with error: ${error.message}`);
  process.exit(1);
}

/**
 * Sets up express.
 * @param {import('./lib/bot').Bot[]} bots The bots.
 * @param {number} listen_port The port of the gateway.
 * @returns {express.Express} The express app.
 */
function setupExpress(bots, listen_port) {
  const app = express()
                  .use(morgan('tiny'))
                  .use(cors())
                  .use(express.raw({type: '*/*'}))
                  .use('/api/bots', routerApiBots)
                  .use((_, res) => {
                    res.status(404).send({
                      apiVersion: '0.0.0',
                      error: {
                        code: 404,
                        message: 'The requested resource was not found.',
                      }
                    });
                  });

  app.locals.bots = bots;

  app.listen(listen_port, '0.0.0.0', () => {
    consola.info(`listening on port ${listen_port}`);
  });

  return app;
}
