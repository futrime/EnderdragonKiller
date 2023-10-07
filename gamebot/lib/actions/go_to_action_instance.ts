import {consola} from 'consola';
import pathfinderModule from 'mineflayer-pathfinder';

import {Arg} from '../arg.js';
import {Bot} from '../bot.js';
import {Parameter} from '../parameter.js';

import {ActionInstance} from './action_instance.js';
import {ActionInstanceState} from './action_instance_state.js';

const PARAMETERS: Record<string, Parameter> = {
  'x': {
    name: 'x',
    description: 'X coordinate',
    type: 'number',
  },
  'y': {
    name: 'y',
    description: 'Y coordinate',
    type: 'number',
  },
  'z': {
    name: 'z',
    description: 'Z coordinate',
    type: 'number',
  },
};

export class GoToActionInstance extends ActionInstance {
  private readonly x: number;
  private readonly y: number;
  private readonly z: number;

  constructor(id: number, args: ReadonlyArray<Arg>, bot: Bot) {
    super(id, 'goTo', args, bot);

    for (const parameter of Object.values(PARAMETERS)) {
      if (!(parameter.name in this.args)) {
        throw new Error(`missing argument ${parameter.name}`);
      }

      // Check types
      if (parameter.type !== typeof this.args[parameter.name].value) {
        throw new Error(`argument ${parameter.name} has wrong type`);
      }
    }

    this.x = this.args['x'].value as number;
    this.y = this.args['y'].value as number;
    this.z = this.args['z'].value as number;
  }

  override async cancel(): Promise<void> {
    if (this.wrappedState !== ActionInstanceState.RUNNING &&
        this.wrappedState !== ActionInstanceState.PAUSED) {
      throw new Error(
          `cannot cancel an action instance in state ${this.wrappedState}`);
    }

    await this.stopPathfinding();

    this.wrappedState = ActionInstanceState.CANCELED;
    this.eventEmitter.emit('cancel', this);
    consola.log(`GoTo#${this.id} canceled`);
  }

  override async pause(): Promise<void> {
    if (this.wrappedState !== ActionInstanceState.RUNNING) {
      throw new Error(
          `cannot pause an action instance in state ${this.wrappedState}`);
    }

    await this.stopPathfinding();

    this.wrappedState = ActionInstanceState.PAUSED;
    this.eventEmitter.emit('pause', this);
    consola.log(`GoTo#${this.id} paused`);
  }

  override async resume(): Promise<void> {
    if (this.wrappedState !== ActionInstanceState.PAUSED) {
      throw new Error(
          `cannot resume an action instance in state ${this.wrappedState}`);
    }

    await this.startPathfinding();

    this.wrappedState = ActionInstanceState.RUNNING;
    this.eventEmitter.emit('resume', this);
    consola.log(`GoTo#${this.id} resumed`);
  }

  override async start(): Promise<void> {
    if (this.wrappedState !== ActionInstanceState.READY) {
      throw new Error(
          `cannot start an action instance in state ${this.wrappedState}`);
    }

    await this.startPathfinding();

    this.wrappedState = ActionInstanceState.RUNNING;
    this.eventEmitter.emit('start', this);
    consola.log(`GoTo#${this.id} started`);
  }

  private async startPathfinding(): Promise<void> {
    const goal = new pathfinderModule.goals.GoalBlock(this.x, this.y, this.z);
    this.bot.mineflayerBot.pathfinder.setGoal(goal);

    this.bot.mineflayerBot.once('goal_reached', async () => {
      // Only handle goal reached if the action instance is still running.
      if (this.wrappedState !== ActionInstanceState.RUNNING) {
        return;
      }

      await this.stopPathfinding();

      this.wrappedState = ActionInstanceState.SUCCEEDED;
      this.eventEmitter.emit('succeed', this);

      consola.log(`GoTo#${this.id} succeeded`);
    });
    this.bot.mineflayerBot.once(
        'path_update', async (result: {status: string;}) => {
          // Only handle path updates if the action instance is still running.
          if (this.wrappedState !== ActionInstanceState.RUNNING) {
            return;
          }

          if (!['noPath', 'timeout'].includes(result.status)) {
            return;
          }

          await this.stopPathfinding();

          this.wrappedState = ActionInstanceState.FAILED;
          this.eventEmitter.emit('failed', this);

          consola.log(`GoTo#${this.id} failed`);
        });
  }

  private async stopPathfinding(): Promise<void> {
    const promiseToReturn = new Promise<void>((resolve) => {
      this.bot.mineflayerBot.once('path_stop', () => {
        resolve();
      });
    });

    this.bot.mineflayerBot.pathfinder.stop();

    return promiseToReturn;
  }
}
