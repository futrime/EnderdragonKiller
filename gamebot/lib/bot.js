//@ts-check
'use strict';

import consola from 'consola';
import mineflayer from 'mineflayer';
import pathfinder from 'mineflayer-pathfinder';
import collectblock from 'mineflayer-collectblock';
import minecraftData from 'minecraft-data';
import pvp from 'mineflayer-pvp';

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
     * @type {minecraftData.IndexedData}
     * @private
     */
    this.mcdata_ = createMinecraftData(version);
    /**
     * @type {mineflayer.Bot}
     * @private
     */
    this.bot_ = createMineflayerBot(host, port, username, version);
  }

  /**
   * Gets the collect block object.
   * @returns {collectblock.CollectBlock} The collect block
   *     object.
   */
  getCollectBlock() {
    // @ts-expect-error
    return this.bot_.collectBlock;
  }

  /**
   * Gets the Minecraft data object.
   * @returns {minecraftData.IndexedData} The Minecraft data object.
   */
  getMcdata() {
    return this.mcdata_;
  }

  /**
   * Gets the Mineflayer bot.
   * @returns {mineflayer.Bot} The Mineflayer bot.
   */
  getMineflayerBot() {
    return this.bot_;
  }

  /**
   * Gets the pathfinder object.
   * @returns {pathfinder.Pathfinder} The pathfinder
   *    object.
   */
  getPathfinder() {
    return this.bot_.pathfinder;
  }

  /**
   * Gets the PvP object.
   * @returns {import('mineflayer-pvp/lib/PVP').PVP} The PvP object.
   */
  getPvp() {
    return this.bot_.pvp;
  }
}

/**
 * Creates the Minecraft data object.
 * @param {string} version The Minecraft version.
 * @returns {minecraftData.IndexedData} The Minecraft data object.
 * @private
 */
function createMinecraftData(version) {
  const mcdata = minecraftData(version);

  return mcdata;
}

/**
 * Creates a Mineflayer bot.
 * @param {string} host The server host.
 * @param {number} port The server port.
 * @param {string} username The username.
 * @param {string} version The Minecraft version.
 * @returns {mineflayer.Bot} The Mineflayer bot.
 * @private
 */
function createMineflayerBot(host, port, username, version) {
  const bot = mineflayer.createBot({
    auth: 'offline',
    host: host,
    port: port,
    username: username,
    version: version,
  });

  bot.loadPlugin(collectblock.plugin);
  bot.loadPlugin(pathfinder.pathfinder);
  bot.loadPlugin(pvp.plugin);

  bot.on('end', this.createMineflayerBot_.bind(this));
  bot.on('error', (error) => {
    consola.error(`bot error: ${error.message}`);
  });
  bot.on('login', () => {
    consola.success('bot logged in');
  });

  return bot;
}
