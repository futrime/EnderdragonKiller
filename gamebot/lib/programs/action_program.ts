import {ActionInvocation, Program} from './program';

export class ActionProgram extends Program {
  constructor(public readonly action: string, public readonly args: {
    name: string; value: boolean | number | string | null | object
  }[]) {
    super();
  }

  override[Symbol.iterator](): Iterator<ActionInvocation> {
    const action = this.action;
    const args = this.args;

    let visited = false;

    return {
      next(): IteratorResult<ActionInvocation> {
        if (visited) {
          return {done: true, value: null};

        } else {
          visited = true;
          return {done: false, value: {action: action, args: args}};
        }
      }
    }
  }
}
