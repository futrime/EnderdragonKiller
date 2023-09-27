//@ts-check
'use strict';

import consola from 'consola';
import express from 'express';
import {createProgram} from '../../lib/programs.js';

export const router = express.Router();

router.route('/').put(async (req, res) => {
  try {
    /**
     * @type {import('../../lib/bot.js').Bot}
     */
    const bot = req.app.locals.bot;

    // TODO: Validate request body

    const program = createProgram(req.body.program);

    bot.eval(program);

    return res.status(204);

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
