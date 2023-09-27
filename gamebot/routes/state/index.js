//@ts-check
'use strict';

import consola from 'consola';
import express from 'express';
import {botToJson} from '../../lib/serializer.js';

export const router = express.Router();

router.route('/').get((req, res) => {
  try {
    /**
     * @type {import('../../lib/bot.js').Bot}
     */
    const bot = req.app.locals.bot;
    const mineflayerBot = bot.getMineflayerBot();

    return res.status(200).send({
      apiVersion: '0.0.0',
      data: {
        bot: botToJson(mineflayerBot),
      },
    });

  } catch (error) {
    consola.error(`Error: ${error.message}`);
    return res.status(500).send({
      apiVersion: '0.0.0',
      error: {
        code: 500,
        message: `Internal server error occured: ${error.message}`,
      },
    });
  }
});
