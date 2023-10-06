import Ajv from 'ajv';
import assert from 'assert';
import consola from 'consola';
import express from 'express';

import {ProgramAction} from '../../lib/actions/program_action.js';
import {Bot} from '../../lib/bot.js';
import {createProgram} from '../../lib/programs/program_creation.js';

export const router = express.Router();

let updated = new Date();

router.route('/').post((req, res) => {
  try {
    const currentTime = new Date();

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
        program: unknown,
      },
    };

    const program = createProgram(data.data.program);

    const action = new ProgramAction(
        bot, data.data.name, data.data.description, currentTime,
        program);  // TODO: params

    bot.addOrUpdateAction(action);

    updated = currentTime;

    return res.status(201).end();

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

router.route('/').get((req, res) => {
  try {
    const bot: Bot = req.app.locals.bot;

    const actions = bot.getAllActions();

    return res.status(200).send({
      apiVersion: '0.0.0',
      data: {
        updated: updated.toISOString(),
        items: actions.map((action) => {
          return {
            name: action.name,
            description: action.description,
            // TODO: params
            updated: action.created,
          };
        }),
      }
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
})