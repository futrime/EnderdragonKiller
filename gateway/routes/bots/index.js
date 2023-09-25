//@ts-check
'use strict';

import consola from 'consola';
import express from 'express';
import httpErrors from 'http-errors';
import {faker} from '@faker-js/faker';
import {Bot} from '../../lib/bot.js';

export const router = express.Router();

router.get(
    '/',
    async (req, res) => {
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
    },
);

router.post(
    '/',
    express.json(),
    async (req, res) => {
      try {
        /**
         * @type {Bot[]}
         */
        const bots = req.app.locals.bots;

        /**
         * @type {string}
         */
        const ip = req.ip;
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

        return res.status(201).send({
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
    },
);
