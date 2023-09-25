//@ts-check
'use strict';

import consola from 'consola';
import mineflayer from 'mineflayer';
import pathfinder from 'mineflayer-pathfinder';

/**
 * Represents a bot that can play Minecraft.
 */
export class Bot {
  /**
   * @param {string} host The server host.
   * @param {number} port The server port.
   * @param {string} username The username.
   * @param {string} version The Minecraft version.
   */
  constructor(host, port, username, version) {
    this.createMineflayerBot_(host, port, username, version);
  }

  /**
   * Gets the Mineflayer bot.
   * @returns {mineflayer.Bot} The Mineflayer bot.
   */
  getMineflayerBot() {
    if (this.bot_ === undefined) {
      throw new Error('bot is undefined');
    }
    return this.bot_;
  }

  /**
   * Creates a Mineflayer bot.
   * @param {string} host The server host.
   * @param {number} port The server port.
   * @param {string} username The username.
   * @param {string} version The Minecraft version.
   * @private
   */
  createMineflayerBot_(host, port, username, version) {
    this.bot_ = mineflayer.createBot({
      auth: 'offline',
      host: host,
      port: port,
      username: username,
      version: version,
    });

    this.bot_.loadPlugin(pathfinder.pathfinder);

    this.bot_.on('end', this.createMineflayerBot_.bind(this));
    this.bot_.on('error', (error) => {
      consola.error(`bot error: ${error.message}`);
    });
    this.bot_.on('login', () => {
      consola.success('bot logged in');
    });
  }
}
