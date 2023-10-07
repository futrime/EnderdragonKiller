import {Program} from '../programs/program.js';
import {Arg, Parameter} from '../utils.js';

import {Action, ActionInstance} from './action.js';

export interface ParameterWithVariable extends Parameter {
  variable: string;
}

export class ProgramAction extends Action {
  constructor(
      name: string, description: string,
      private readonly parametersWithVariable:
          ReadonlyArray<ParameterWithVariable>,
      private readonly program: Program) {
    super(name, description, parametersWithVariable);
  }

  override instantiate(args: readonly Arg[]): ActionInstance {
    // Convert parametersWithVariable to a map from parameter name to variable.
    // TODO

    return new ProgramActionInstance(this, args, this.program);
  }
}

export class ProgramActionInstance extends ActionInstance {
  constructor(
      readonly action: Action, readonly args: ReadonlyArray<Arg>,
      private readonly program: Program) {
    super(action, args);
  }

  override cancel(): void {}

  override pause(): void {}

  override resume(): void {}

  override run(): void {}
}
