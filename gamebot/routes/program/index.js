//@ts-check
'use strict';

import consola from 'consola';
import express from 'express';
import {createProgram} from '../../lib/programs.js';

export const router = express.Router();

router.get('/', async (req, res) => {
  try {
    /**
     * @type {import('../../lib/bot.js').Bot}
     */
    const bot = req.app.locals.bot;
    const currentAction = bot.getEvalCurrentAction();

    const currentActionJson = currentAction ? {
      name: currentAction.getName(),
      params: currentAction.getParamMap(),
    } :
                                              null;

    return res.status(200).send({
      apiVersion: '0.0.0',
      data: {
        state: bot.getEvalState(),
        results: bot.getEvalResults(),
        currentAction: currentActionJson,
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

router.route('/').put(async (req, res) => {
  try {
    /**
     * @type {import('../../lib/bot.js').Bot}
     */
    const bot = req.app.locals.bot;

    // TODO: Validate request body

    const program = createProgram(req.body.data.program);

    bot.eval(program);

    return res.status(204).end();

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
