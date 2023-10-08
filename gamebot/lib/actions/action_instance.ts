import EventEmitter from 'events';

import {Arg} from '../arg.js'
import {Bot} from '../bot.js';

import {ActionInstanceState} from './action_instance_state.js';

export abstract class ActionInstance {
  readonly args: Record<string, Arg>;
  readonly eventEmitter = new EventEmitter();

  protected wrappedState: ActionInstanceState = ActionInstanceState.READY;

  constructor(
      readonly id: string, readonly actionName: string,
      args: ReadonlyArray<Arg>, protected readonly bot: Bot) {
    this.args = {};

    // Check duplicate arguments
    for (const arg of args) {
      if (arg.name in this.args) {
        throw new Error(`duplicate argument ${arg.name}`);
      }

      this.args[arg.name] = arg;
    }
  }

  /**
   * Cancels the action instance.
   */
  abstract cancel(): Promise<void>;

  /**
   * Pauses the action instance.
   */
  abstract pause(): Promise<void>;

  /**
   * Resumes the action instance.
   */
  abstract resume(): Promise<void>;

  /**
   * Starts the action instance.
   */
  abstract start(): Promise<void>;

  get state(): ActionInstanceState {
    return this.wrappedState;
  }
}