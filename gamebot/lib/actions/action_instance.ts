import EventEmitter from 'events';

import {Arg} from '../arg.js'
import {Bot} from '../bot.js';

import {ActionInstanceState} from './action_instance_state.js';

export abstract class ActionInstance {
  readonly args: Record<string, Arg>;
  readonly eventEmitter = new EventEmitter();

  protected wrappedState: ActionInstanceState = ActionInstanceState.READY;

  constructor(
      readonly id: number, readonly actionName: string,
      args: ReadonlyArray<Arg>, protected readonly bot: Bot) {
    this.args = {};

    for (const arg of args) {
      if (arg.name in this.args) {
        throw new Error(`duplicate argument ${arg.name}`);
      }

      this.args[arg.name] = arg;
    }
  }

  abstract cancel(): Promise<void>;

  abstract pause(): Promise<void>;

  abstract resume(): Promise<void>;

  abstract start(): Promise<void>;

  get state(): ActionInstanceState {
    return this.wrappedState;
  }
}
