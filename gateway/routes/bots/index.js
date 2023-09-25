//@ts-check
'use strict';

import consola from 'consola';
import express from 'express';
import httpErrors from 'http-errors';

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
            items: bots.map(
                (/** @type {import('../../lib/bot.js').Bot} */ bot) => {
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
