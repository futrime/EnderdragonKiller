'use strict';
//@ts-check

import consola from 'consola';
import express from 'express';
import httpErrors from 'http-errors';

const router = express.Router();

router.use(async (ws, req) => {
  try {
    // TODO: Implement.

  } catch (error) {
    if (error instanceof httpErrors.HttpError) {
      ws.close(error.statusCode, error.message);

    } else {
      ws.close(500, `Internal Server Error: ${error.message}`);
      consola.error(`internal server error: ${error.message}`);
    }
  }
});

export default router;
