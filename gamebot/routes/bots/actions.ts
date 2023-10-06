import Ajv from 'ajv';
import assert from 'assert';
import consola from 'consola';
import express from 'express';

import {Bot} from '../../lib/bot.js';

export const router = express.Router();

router.route('/').post((req, res) => {
  try {
    const bot: Bot = req.app.locals.bot;

    let responseJson: unknown;
    try {
      responseJson = JSON.parse(req.body);

    } catch (error) {
      assert(error instanceof Error);

      return res.status(400).send({
        apiVersion: '0.0.0',
        error: {
          code: 400,
          message: `Request body is not valid JSON.`,
        },
      });
    }

    const SCHEMA = {
      'type': 'object',
      'properties': {
        'apiVersion': {'type': 'string'},
        'data': {
          'type': 'object',
          'properties': {
            'name': {'type': 'string'},
            'program': {'type': 'object', 'properties': {}},
            'description': {'type': 'string'},
            'params': {
              'type': 'array',
              'items': {
                'type': 'object',
                'properties': {
                  'name': {'type': 'string'},
                  'path': {'type': 'string'},
                  'type': {'type': 'string'},
                  'description': {'type': 'string'}
                },
                'required': ['name', 'path', 'type', 'description']
              }
            }
          },
          'required': ['name', 'params', 'program', 'description']
        }
      },
      'required': ['apiVersion', 'data']
    };
    const ajv = new Ajv();
    const validate = ajv.compile(SCHEMA);
    const valid = validate(responseJson);
    if (!valid) {
      return res.status(400).send({
        apiVersion: '0.0.0',
        error: {
          code: 400,
          message: `The request is invalid: ${ajv.errorsText(validate.errors)}`,
        },
      });
    }

    const data = responseJson as {
      apiVersion: string,
      data: {
        name: string,
        description: string,
        params: {
          name: string,
          path: string,
          type: string,
          description: string,
        }[],
        program: object,
      },
    };

    // TODO: Create a new program from the data.

    // TODO: Create an action.

    // TODO: Register the action with the bot.

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
