'use strict';

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
    /**
     * @type {mineflayer.Bot}
     * @private
     * @constant
     */
    this.bot_ = mineflayer.createBot({
      'auth': 'offline',
      'host': host,
      'port': port,
      'username': username,
      'version': version,
    });

    this.bot_.loadPlugin(pathfinder.pathfinder);
  }

  /**
   * Gets the Mineflayer bot.
   * @returns {mineflayer.Bot} The Mineflayer bot.
   */
  getMineflayerBot() {
    return this.bot_;
  }
}
