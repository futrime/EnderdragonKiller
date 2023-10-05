import {EventEmitter} from 'stream';

import {Bot} from '../bot';

export enum ActionStatus {
  STOPPED,
  RUNNING,
  PAUSED,
}

export abstract class Action {
  readonly eventEmitter = new EventEmitter();

  protected readonly bot: Bot;
  protected wrappedStatus: ActionStatus = ActionStatus.STOPPED;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  get status(): ActionStatus {
    return this.wrappedStatus;
  }

  abstract start(): Promise<void>;

  abstract pause(): Promise<void>;

  abstract resume(): Promise<void>;

  abstract stop(): Promise<void>;
}
