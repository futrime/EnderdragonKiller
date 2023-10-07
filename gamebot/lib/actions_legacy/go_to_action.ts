import consola from 'consola';
import mineflayerPathfinder from 'mineflayer-pathfinder';

import {Bot} from '../bot.js';

import {ActionStatus} from './action_status.js';
import {PredefinedAction} from './predefined_action.js';

export class GoToAction extends PredefinedAction {
  constructor(
      bot: Bot, name: string, description: string, created: Date,
      readonly x: number, readonly y: number, readonly z: number) {
    super(bot, name, description, created);
  }

  override async start() {
    if (this.wrappedStatus !== ActionStatus.STOPPED) {
      throw new Error('cannot start a non-stopped action');
    }

    this.startPathfinding();

    this.wrappedStatus = ActionStatus.RUNNING;
    this.eventEmitter.emit('started', this);

    consola.log(`GoToAction started`);
  }

  override async pause() {
    if (this.wrappedStatus !== ActionStatus.RUNNING) {
      throw new Error('cannot pause a non-running action');
    }

    this.stopPathfinding();

    this.wrappedStatus = ActionStatus.PAUSED;
    this.eventEmitter.emit('paused', this);

    consola.log(`GoToAction paused`);
  }

  override async resume() {
    if (this.wrappedStatus !== ActionStatus.PAUSED) {
      throw new Error('cannot resume a non-paused action');
    }

    this.startPathfinding();

    this.wrappedStatus = ActionStatus.RUNNING;
    this.eventEmitter.emit('resumed', this);

    consola.log(`GoToAction resumed`);
  }

  override async stop() {
    if (this.wrappedStatus === ActionStatus.STOPPED) {
      throw new Error('cannot stop a stopped action');
    }

    this.stopPathfinding();

    this.wrappedStatus = ActionStatus.STOPPED;
    this.eventEmitter.emit('stopped', this);

    consola.log(`GoToAction stopped`);
  }

  private startPathfinding() {
    const goal =
        new mineflayerPathfinder.goals.GoalBlock(this.x, this.y, this.z);
    this.bot.mineflayerBot.pathfinder.setGoal(goal);

    this.bot.mineflayerBot.once('goal_reached', () => {
      this.stopPathfinding();

      this.wrappedStatus = ActionStatus.STOPPED;
      this.eventEmitter.emit('stopped', this);
      this.eventEmitter.emit('finished', this);

      consola.log(`GoToAction finished`);
    });
    this.bot.mineflayerBot.once('path_update', (result: {status: string}) => {
      if (!['noPath', 'timeout'].includes(result.status)) {
        return;
      }

      this.stopPathfinding();

      this.wrappedStatus = ActionStatus.STOPPED;
      this.eventEmitter.emit('stopped', this);
      this.eventEmitter.emit('error', this);

      consola.log(`GoToAction error`);
    });
  }

  private stopPathfinding() {
    this.bot.mineflayerBot.pathfinder.stop();
  }
}
