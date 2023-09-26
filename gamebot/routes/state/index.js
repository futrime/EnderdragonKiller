//@ts-check
'use strict';

import consola from 'consola';
import express from 'express';

export const router = express.Router();

router.route('/').get(async (req, res) => {
  try {
    /**
     * @type {import('../../lib/bot.js').Bot}
     */
    const bot = req.app.locals.bot;
    const mineflayerBot = bot.getMineflayerBot();

    return res.status(200).send({
      apiVersion: '0.1.0',
      data: {
        player: {
          uuid: mineflayerBot.player.uuid,
          username: mineflayerBot.player.username,
          gamemode: mineflayerBot.player.gamemode,
          ping: mineflayerBot.player.ping,
        },
      },
    });

  } catch (error) {
    consola.error(`Error: ${error.message}`);
    return res.status(500).send({
      apiVersion: '0.1.0',
      error: {
        code: 500,
        message: `Internal server error occured: ${error.message}`,
      },
    });
  }
});
