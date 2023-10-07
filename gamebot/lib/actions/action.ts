import {Arg, Parameter} from '../utils.js';

export abstract class Action {
  constructor(
      readonly name: string, readonly description: string,
      readonly parameters: ReadonlyArray<Parameter>) {}

  abstract instantiate(args: ReadonlyArray<Arg>): ActionInstance;
}

export abstract class ActionInstance {
  constructor(readonly action: Action, readonly args: ReadonlyArray<Arg>) {}

  abstract cancel(): void;

  abstract pause(): void;

  abstract resume(): void;

  abstract run(): void;
}

export enum ActionInstanceState {
  READY,
  RUNNING,
  PAUSED,
  CANCELED,
  DONE,
}
