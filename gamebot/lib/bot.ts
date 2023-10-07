import consola from 'consola';
import minecraftData from 'minecraft-data';
import mineflayer from 'mineflayer';
import collectblock from 'mineflayer-collectblock';
import pathfinder from 'mineflayer-pathfinder';
import pvp from 'mineflayer-pvp';

import {Action} from './actions_legacy/action.js';

export class Bot {
  readonly mcdata: minecraftData.IndexedData;

  private actions: Record<string, Action> = {};
  private wrappedMineflayerBot: mineflayer.Bot;

  /**
   * @param host The server host.
   * @param port The server port.
   * @param username The username.
   * @param version The Minecraft version.
   */
  constructor(
      readonly host: string, readonly port: number, readonly username: string,
      readonly version: string) {
    this.mcdata = minecraftData(version);
    this.wrappedMineflayerBot =
        this.createMineflayerBot(host, port, username, version);
  }

  get mineflayerBot(): mineflayer.Bot {
    return this.wrappedMineflayerBot;
  }

  get name(): string {
    return this.username;
  }

  /**
   * Adds or updates an action in the bot.
   * @param action The action to add or update.
   */
  addOrUpdateAction(action: Action) {
    this.actions[action.name] = action;
  }

  /**
   * Gets an action from the bot.
   * @param name The name of the action.
   * @returns The action.
   */
  getAction(name: string): Action {
    if (!(name in this.actions)) {
      throw new Error(`action ${name} does not exist`);
    }

    return this.actions[name];
  }

  /**
   * Gets all actions from the bot.
   * @returns All actions.
   */
  getAllActions(): Action[] {
    return Object.values(this.actions);
  }

  /**
   * Removes an action from the bot.
   * @param action The action to remove.
   */
  removeAction(action: Action) {
    if (!(action.name in this.actions)) {
      throw new Error(`action ${action.name} does not exist`);
    }

    delete this.actions[action.name];
  }

  private createMineflayerBot(
      host: string, port: number, username: string,
      version: string): mineflayer.Bot {
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

             this.wrappedMineflayerBot =
                 this.createMineflayerBot(host, port, username, version);
           }));
    bot.on('error', (error) => {
      consola.error(`bot error: ${error.message}`);
    });
    bot.on('login', () => {
      consola.success('bot logged in');
    });

    return bot;
  }
}
