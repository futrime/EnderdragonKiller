import {Arg} from '../arg.js';
import {Parameter} from '../parameter.js';

import {ActionInstance} from './action_instance.js';

export abstract class Action {
  readonly parameters: Record<string, Parameter>;

  constructor(
      readonly name: string, readonly description: string,
      parameters: ReadonlyArray<Parameter>) {
    this.parameters = {};

    for (const parameter of parameters) {
      if (parameter.name in this.parameters) {
        throw new Error(`duplicate parameter ${parameter.name}`);
      }

      this.parameters[parameter.name] = parameter;
    }
  }

  abstract instantiate(args: ReadonlyArray<Arg>): ActionInstance;
}
