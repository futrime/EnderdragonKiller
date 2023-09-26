//@ts-check
'use strict';

import consola from 'consola';
import express from 'express';
import {faker} from '@faker-js/faker';
import {Bot} from '../../lib/bot.js';
import path from 'path';

export const router = express.Router();

router.route('/').get(async (req, res) => {
  try {
    /**
     * @type {Bot[]}
     */
    const bots = req.app.locals.bots;

    return res.status(200).send({
      apiVersion: '0.0.0',
      data: {
        items: bots.map((/** @type {Bot} */ bot) => {
          return {
            username: bot.getUsername(),
          };
        }),
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

router.route('/').post(async (req, res) => {
  try {
    /**
     * @type {Bot[]}
     */
    const bots = req.app.locals.bots;

    /**
     * @type {string}
     */
    const ip = req.ip;
    for (const bot of bots) {
      if (bot.getIp() === ip) {
        return res.status(409).send({
          apiVersion: '0.0.0',
          data: {
            username: bot.getUsername(),
          },
          error: {
            code: 409,
            message: `A bot with the same IP address (${ip}) already exists.`,
          },
        });
      }
    }

    // TODO: Validate with JSON schema.
    /**
     * @type {number}
     */
    const port = req.body.data.port;

    const username =
        bots.length === 0 ? 'Commander' : faker.person.firstName('female');

    const bot = new Bot(ip, port, username);
    bots.push(bot);

    // HTTP 201 Created requires a Location header.

    return res.status(201)
        .set(
            'Location',
            `${req.protocol}://${req.get('host')}/api/bots/${
                bot.getUsername()}`,
            )
        .send({
          apiVersion: '0.0.0',
          data: {
            username: bot.getUsername(),
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

router.route('/:username/*').all(async (req, res) => {
  try {
    /**
     * @type {Bot[]}
     */
    const bots = req.app.locals.bots;

    /**
     * @type {Bot | undefined}
     */
    const bot = bots.find((bot) => {
      return bot.getUsername() === req.params.username;
    });

    if (bot === undefined) {
      res.status(404);
      res.send({
        apiVersion: '0.0.0',
        error: {
          code: 404,
          message: `Bot with username ${req.params.username} not found.`,
        },
      });
      return;
    }

    // Act as a reverse proxy.
    try {
      const requestHeaders = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        requestHeaders.set(key, value?.toString() ?? '');
      }

      const url = path.join(
          `http://${bot.getIp()}:${bot.getPort()}/api`, req.params[0]);

      const response = await fetch(url, {
        headers: requestHeaders,
        method: req.method,
        body: (req.method === 'GET' || req.method === 'HEAD') ? undefined :
                                                                req.body,
      });

      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      res.send(await response.json());

    } catch (error) {
      res.status(502);
      res.send({
        apiVersion: '0.0.0',
        error: {
          code: 502,
          message: ` Error occured while communicating with bot: $ {
        error.message
      }
      `,
        },
      });
    }

  } catch (error) {
    consola.error(` Error: $ {
        error.message
      }
      `);
    return res.status(500).send({
      apiVersion: '0.0.0',
      error: {
        code: 500,
        message: ` Internal server error occured: $ {
        error.message
      }
    `,
      },
    });
  }
});
