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
     * @type {Action?}
     */
    this.evalCurrentAction_ = null;
    /**
     * @type {Object[]}
     * @private
     */
    this.evalResults = [];
    /**
     * @type {string}
     * @enum {'ready'|'running'|'error'}
     * @private
     */
    this.evalState_ = 'ready';
    /**
     * @type {string}
     * @private
     */
    this.username_ = username;
  }

  /**
   * Evaluates a program.
   * @param {import('./programs.js').IProgram} program The program to evaluate.
   */
  async eval(program) {
    if (this.evalState_ === 'running') {
      consola.error('the bot is already running a program');
      return;
    }

    this.evalCurrentAction_ = null;
    this.evalResults = [];
    this.evalState_ = 'running';

    try {
      await this.evalProgram_(this, program);

    } catch (error) {
      consola.error(`error while evaluating the program: ${error.message}`);
    }

    if (this.evalState_ === 'running') {
      this.evalState_ = 'ready';
    }
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
   * Gets the current evaluation action.
   * @returns {Action?} The current evaluation action.
   */
  getEvalCurrentAction() {
    return this.evalCurrentAction_;
  }

  /**
   * Gets the current evaluation results.
   * @returns {{type: string, message: string}[]} The current evaluation
   *     results.
   */
  getEvalResults() {
    return [...this.evalResults];
  }

  /**
   * Gets the current evaluation state.
   * @returns {string} The current evaluation state.
   */
  getEvalState() {
    return this.evalState_;
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
   * Gets the username.
   * @returns {string} The username.
   */
  getUsername() {
    return this.username_;
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

    bot.on('end', (async () => {
             consola.log(`bot ended, restarting in 5 seconds...`);
             await new Promise((resolve) => setTimeout(resolve, 5000));

             this.bot_ =
                 this.createMineflayerBot_(host, port, username, version);
           }));
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
      await this.evalActionProgram_(bot, program);

    } else if (program instanceof Sequence) {
      await this.evalSequenceProgram_(bot, program);

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
    if (this.evalState_ !== 'running') {
      return;
    }

    this.evalCurrentAction_ = program;

    const actionName = program.getName();
    const paramMap = program.getParamMap();

    /**
     * @type {{type: string, message?: string | undefined}}
     */
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

    this.evalCurrentAction_ = null;
    this.evalResults.push({
      action: {
        name: actionName,
        params: paramMap,
      },
      result: result,
    });
    if (result.type === 'error') {
      this.evalState_ = 'error';
    }
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
