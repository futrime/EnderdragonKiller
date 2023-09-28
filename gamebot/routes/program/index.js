//@ts-check
'use strict';

import consola from 'consola';
import express from 'express';
import {createProgram} from '../../lib/programs.js';
import Ajv from 'ajv';

export const router = express.Router();

router.get('/', async (req, res) => {
  try {
    /**
     * @type {import('../../lib/bot.js').Bot}
     */
    const bot = req.app.locals.bot;

    const currentAction = bot.getEvalCurrentAction();

    return res.status(200).send({
      apiVersion: '0.0.0',
      data: {
        state: bot.getEvalState(),
        results: bot.getEvalResults(),
        currentAction: currentAction ? {
          name: currentAction.getName(),
          params: currentAction.getParamMap(),
        } :
                                       null,
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

    const responseJson = req.body;

    // validate response.
    const SCHEMA = {
      'type': 'object',
      'properties': {
        'apiVersion': {
          'type': 'string',
        },
        'data': {
          'type': 'object',
          'properties': {
            'program': {
              'type': 'object',
            }
          },
          'required': [
            'program',
          ]
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
      return res.status(400).send({
        apiVersion: '0.0.0',
        error: {
          code: 400,
          message: `The request is invalid: ${JSON.stringify(validate.errors)}`,
        },
      });
    }

    /**
     * @type {import('../../lib/programs.js').IProgram}
     */
    let program;
    try {
      program = createProgram(responseJson.data.program);

    } catch (error) {
      return res.status(400).send({
        apiVersion: '0.0.0',
        error: {
          code: 400,
          message: `The request is invalid: ${error.message}`,
        },
      });
    }

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
