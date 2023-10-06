import {Bot} from '../bot.js';
import {Program} from '../programs/program.js';

import {Action, ActionStatus} from './action.js';

export class ProgramAction extends Action {
  constructor(bot: Bot, readonly program: Program) {
    super(bot);
  }

  override async start() {
    if (this.wrappedStatus !== ActionStatus.STOPPED) {
      throw new Error('cannot start a non-stopped action');
    }

    this.eventEmitter.emit('started', this);
  }

  override async pause() {
    if (this.wrappedStatus !== ActionStatus.RUNNING) {
      throw new Error('cannot pause a non-running action');
    }

    this.eventEmitter.emit('paused', this);
  }

  override async resume() {
    if (this.wrappedStatus !== ActionStatus.PAUSED) {
      throw new Error('cannot resume a non-paused action');
    }

    this.eventEmitter.emit('resumed', this);
  }

  override async stop() {
    if (this.wrappedStatus === ActionStatus.STOPPED) {
      throw new Error('cannot stop a stopped action');
    }

    this.eventEmitter.emit('stopped', this);
  }
}
