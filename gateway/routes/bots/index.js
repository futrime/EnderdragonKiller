//@ts-check
'use strict';

import consola from 'consola';
import express from 'express';
import httpErrors from 'http-errors';
import {faker} from '@faker-js/faker';
import {Bot} from '../../lib/bot.js';

export const router = express.Router();

router.route('/').get(async (req, res) => {
  try {
    /**
     * @type {import('../../lib/bot.js').Bot[]}
     */
    const bots = req.app.locals.bots;

    return res.status(200).send({
      apiVersion: '0.1.0',
      data: {
        items: bots.map((/** @type {Bot} */ bot) => {
          return {
            username: bot.getUsername(),
          };
        }),
      },
    });

  } catch (error) {
    if (httpErrors.isHttpError(error)) {
      return res.status(error.statusCode).send({
        apiVersion: '0.1.0',
        error: {
          code: error.statusCode,
          message: error.message,
        },
      });

    } else {
      consola.error(`Error: ${error.message}`);
      return res.status(500).send({
        apiVersion: '0.1.0',
        error: {
          code: 500,
          message: `Internal server error occured: ${error.message}`,
        },
      });
    }
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
    let ip = req.ip;
    bots.forEach((bot) => {
      if (bot.getIp() === ip) {
        throw new httpErrors.Conflict(
            `A bot with the same IP address (${ip}) already exists.`,
        );
      }
    });

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
            new URL(
                `/api/bots/${bot.getUsername()}`,
                req.protocol + '://' + req.get('host'),
                )
                .href,
            )
        .send({
          apiVersion: '0.1.0',
          data: {
            username: bot.getUsername(),
          },
        });

  } catch (error) {
    if (httpErrors.isHttpError(error)) {
      return res.status(error.statusCode).send({
        apiVersion: '0.1.0',
        error: {
          code: error.statusCode,
          message: error.message,
        },
      });

    } else {
      consola.error(`Error: ${error.message}`);
      return res.status(500).send({
        apiVersion: '0.1.0',
        error: {
          code: 500,
          message: `Internal server error occured: ${error.message}`,
        },
      });
    }
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
      throw new httpErrors.NotFound(
          `Bot with username ${req.params.username} not found.`,
      );
    }

    // Act as a reverse proxy.
    try {
      const requestHeaders = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        requestHeaders.set(key, value?.toString() ?? '');
      }

      const url =
          new URL(req.params[0], `http://${bot.getIp()}:${bot.getPort()}/api`)
              .href;

      const response = await fetch(url, {
        headers: requestHeaders,
        method: req.method,
        body: req.body,
      });

      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      res.send(await response.json());

    } catch (error) {
      throw new httpErrors.BadGateway(
          `Error occured while communicating with bot: ${error.message}`,
      );
    }

  } catch (error) {
    if (httpErrors.isHttpError(error)) {
      return res.status(error.statusCode).send({
        apiVersion: '0.1.0',
        error: {
          code: error.statusCode,
          message: error.message,
        },
      });

    } else {
      consola.error(`Error: ${error.message}`);
      return res.status(500).send({
        apiVersion: '0.1.0',
        error: {
          code: 500,
          message: `Internal server error occured: ${error.message}`,
        },
      });
    }
  }
});
