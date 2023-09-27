//@ts-check
'use strict';

import consola from 'consola';
import minecraftData from 'minecraft-data';
import mineflayer from 'mineflayer';
import collectblock from 'mineflayer-collectblock';
import pathfinder from 'mineflayer-pathfinder';
import pvp from 'mineflayer-pvp';
import {Vec3} from 'vec3';
import {collectBlock, craftItem, explore, killEntity} from './actions.js';
import {Action, Sequence} from './programs.js';

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
     */
    this.bot_ = this.createMineflayerBot_(host, port, username, version);
    /**
     * @type {minecraftData.IndexedData}
     * @private
     */
    this.mcdata_ = this.createMinecraftData_(version);
    /**
     * @type {Object[]}
     * @private
     */
    this.evalResults = [];
  }

  /**
   * Evaluates a program.
   * @param {import('./programs.js').IProgram} program The program to evaluate.
   */
  async eval(program) {
    this.evalResults = [];
    await this.evalProgram_(this, program);
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

  /**
   * Creates the Minecraft data object.
   * @param {string} version The Minecraft version.
   * @returns {minecraftData.IndexedData} The Minecraft data object.
   * @private
   */
  createMinecraftData_(version) {
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
  createMineflayerBot_(host, port, username, version) {
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

  /**
   * Evaluates a program.
   * @param {Bot} bot The bot.
   * @param {import('./programs.js').IProgram} program The program to evaluate.
   */
  async evalProgram_(bot, program) {
    if (program instanceof Action) {
      this.evalActionProgram_(bot, program);
    } else if (program instanceof Sequence) {
      this.evalSequenceProgram_(bot, program);
    } else {
      throw new Error(`unknown program type: ${program.getType()}`);
    }
  }

  /**
   * Evaluates an action program.
   * @param {Bot} bot The bot.
   * @param {Action} program
   */
  async evalActionProgram_(bot, program) {
    const actionName = program.getName();
    const paramMap = program.getParamMap();

    let result;

    switch (actionName) {
      case 'collectBlock':
        result = await collectBlock(
            bot,
            paramMap['name'],
            paramMap['count'],
        );
        break;

      case 'craftItem':
        result = await craftItem(
            bot,
            paramMap['name'],
            paramMap['count'],
            paramMap['useCraftingTable'],
        );
        break;

      case 'explore':
        result = await explore(
            bot,
            new Vec3(
                paramMap['maxReplacement']['x'],
                paramMap['maxReplacement']['y'],
                paramMap['maxReplacement']['z'],
                ),
            paramMap['ignoreY'],
            paramMap['timeout'],
        );
        break;

      case 'killEntity':
        result = await killEntity(
            bot,
            paramMap['id'],
        );
        break;

      default:
        throw new Error(`unknown action name: ${actionName}`);
    }

    this.evalResults.push({
      action: {
        name: actionName,
        params: paramMap,
      },
      result: result,
    })
  }

  /**
   * Evaluates a sequence program.
   * @param {Bot} bot The bot.
   * @param {Sequence} program
   */
  async evalSequenceProgram_(bot, program) {
    for (const subprogram of program.getSequence()) {
      await this.evalProgram_(bot, subprogram);
    }
  }
}
