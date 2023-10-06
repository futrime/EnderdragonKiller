import assert from 'assert';
import consola from 'consola';
import express from 'express';

import {Bot} from '../../lib/bot.js';
import {createMineflayerBotStatus} from '../../lib/mineflayer_serialization.js';

export const router = express.Router();

router.route('/').get((req, res) => {
  try {
    const currentTime = new Date();

    const bot: Bot = req.app.locals.bot;

    return res.status(200).send({
      apiVersion: '0.0.0',
      data: {
        mineflayerBot: createMineflayerBotStatus(bot.mineflayerBot),
        updated: currentTime.toISOString(),
      },
    });

  } catch (error) {
    assert(error instanceof Error);

    consola.error(`Error: ${error.message}`);
    return res.status(500).send({
      apiVersion: '0.0.0',
      error: {
        code: 500,
        message: `Internal server error occured.`,
      },
    });
  }
});
