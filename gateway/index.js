//@ts-check
'use strict';

import consola from 'consola';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import process from 'process';
import GameBotRouter from './routes/gamebot.js';

try {
  // Read environment variables.
  const listen_port = parseInt(process.env.LISTEN_PORT || '80');
  const log_level = parseInt(process.env.LOG_LEVEL || '3');

  // Set up logging.
  consola.level = log_level

  // Set up express.
  const app = express();
  app.use(morgan('tiny'));
  app.use(cors());
  app.use('/gamebot', GameBotRouter);
  app.use((_, res) => {
    res.status(403).send({
      code: 403,
      message: 'Forbidden',
    });
  });
  app.listen(listen_port, () => {
    consola.info(`listening on port ${listen_port}`);
  });

} catch (error) {
  consola.error(`process exited with error: ${error.message}`);
  process.exit(1);
}
