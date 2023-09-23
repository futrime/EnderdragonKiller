'use strict';

import consola from 'consola';
import 'dotenv/config';
import process from 'process';

try {
  initializeEnvironmentVariables();

} catch (error) {
  consola.log(error);
}

function initializeEnvironmentVariables() {
  if (process.env.HOST === undefined) {
    throw new Error('environment variable HOST is not defined');
  }

  process.env.LOG_LEVEL = process.env.LOG_LEVEL || '3';
  process.env.PORT = process.env.PORT || 25565;
}
