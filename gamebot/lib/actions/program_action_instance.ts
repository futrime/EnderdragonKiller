import assert from 'assert';
import consola from 'consola';

import {Arg} from '../arg.js';
import {Bot} from '../bot.js';
import {Program} from '../programs/program.js';

import {ActionInstance} from './action_instance.js';
import {ActionInstanceState} from './action_instance_state.js';
import {ParameterWithVariable} from './parameter_with_variable.js';

export class ProgramActionInstance extends ActionInstance {
  private currentActionInstance?: ActionInstance = undefined;
  private shouldPause: boolean = false;
  private shouldRun: boolean = true;
  private readonly variables: Record<string, unknown> = {};

  constructor(
      id: string, args: ReadonlyArray<Arg>, bot: Bot, actionName: string,
      parameters: ReadonlyArray<ParameterWithVariable>,
      private readonly program: Program) {
    super(id, actionName, args, bot);

    // Check duplicate parameters
    const parameterNames = new Set<string>();
    for (const parameter of parameters) {
      if (parameterNames.has(parameter.name)) {
        throw new Error(`duplicate parameter ${parameter.name}`);
      }
      parameterNames.add(parameter.name);
    }

    // The number of arguments must match the number of parameters.
    if (Object.entries(parameters).length !==
        Object.entries(this.args).length) {
      throw new Error('wrong number of arguments');
    }

    // Every parameter must match an argument.
    for (const parameter of Object.values(parameters)) {
      if (!(parameter.name in this.args)) {
        throw new Error(`missing argument ${parameter.name}`);
      }

      // Check types
      if (parameter.type !== typeof this.args[parameter.name].value) {
        throw new Error(`argument ${parameter.name} has wrong type`);
      }
    }

    // Set variables
    for (const parameter of Object.values(parameters)) {
      // Variable should start with $
      if (!parameter.variable.startsWith('$')) {
        throw new Error(`variable ${parameter.variable} should start with $`);
      }

      this.variables[parameter.variable] = this.args[parameter.name].value;
    }
  }

  override async cancel(): Promise<void> {
    if (this.wrappedState !== ActionInstanceState.RUNNING &&
        this.wrappedState !== ActionInstanceState.PAUSED) {
      throw new Error(
          `cannot cancel an action instance in state ${this.wrappedState}`);
    }

    this.shouldRun = false;

    // Wait till the current action instance becomes undefined.
    await (() => {
      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (this.currentActionInstance === undefined) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    })();

    this.wrappedState = ActionInstanceState.CANCELED;
    this.eventEmitter.emit('cancel', this);
    consola.log(`${this.actionName}#${this.id} canceled`);
  }

  override async pause(): Promise<void> {
    if (this.wrappedState !== ActionInstanceState.RUNNING) {
      throw new Error(
          `cannot pause an action instance in state ${this.wrappedState}`);
    }

    this.shouldPause = true;
    await this.currentActionInstance?.pause();

    this.wrappedState = ActionInstanceState.PAUSED;
    this.eventEmitter.emit('pause', this);
    consola.log(`${this.actionName}#${this.id} paused`);
  }

  override async resume(): Promise<void> {
    if (this.wrappedState !== ActionInstanceState.PAUSED) {
      throw new Error(
          `cannot resume an action instance in state ${this.wrappedState}`);
    }

    this.shouldPause = false;
    await this.currentActionInstance?.resume();

    this.wrappedState = ActionInstanceState.RUNNING;
    this.eventEmitter.emit('resume', this);
    consola.log(`${this.actionName}#${this.id} resumed`);
  }

  override async start(): Promise<void> {
    if (this.wrappedState !== ActionInstanceState.READY) {
      throw new Error(
          `cannot start an action instance in state ${this.wrappedState}`);
    }

    this.evaluate().catch(async (error) => {
      assert(error instanceof Error);

      this.shouldRun = false;

      try {
        await this.currentActionInstance?.cancel();

      } catch (error) {
        assert(error instanceof Error);

        consola.fatal(
            `failed to cancel ${this.currentActionInstance?.actionName}#${
                this.currentActionInstance?.id}: ${
                error.message}. The program is malfunctioning`);

        // Exit the process.
        process.exit(1);
      }

      this.wrappedState = ActionInstanceState.FAILED;
      this.eventEmitter.emit('fail', this, error.message);
      consola.error(`${this.actionName}#${this.id} failed: ${error.message}`);
    });

    this.wrappedState = ActionInstanceState.RUNNING;
    this.eventEmitter.emit('start', this);
    consola.log(`${this.actionName}#${this.id} started`);
  }

  // TODO: simplify this function.
  private async evaluate() {
    for (const actionInvocation of this.program) {
      // Check if the action instance has been canceled.
      if (!this.shouldRun) {
        return;
      }

      // Check if the action instance has been paused.
      if (this.shouldPause) {
        // Wait till the action instance is resumed.
        await (() => {
          return new Promise<void>((resolve) => {
            const interval = setInterval(() => {
              if (!this.shouldPause) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });
        })();
      }

      const action = this.bot.getAction(actionInvocation.action);
      const args = actionInvocation.args.map((arg) => {
        if (typeof arg.value === 'string' && arg.value.startsWith('$')) {
          const value = this.variables[arg.value];
          if (value === undefined) {
            throw new Error(`variable ${arg.value} is undefined`);
          }

          return {
            ...arg,
            value,
          };
        }

        return arg;
      });

      const actionInstance = action.instantiate('', args, this.bot);

      await actionInstance.start();

      if (this.currentActionInstance !== undefined) {
        // This should never happen.
        throw new Error(`trying to start ${action.name} while ${
            this.currentActionInstance.actionName} is running`);
      }

      this.currentActionInstance = actionInstance;

      await (() => {
        return new Promise<void>((resolve, reject) => {
          actionInstance.eventEmitter.once('succeed', () => {
            resolve();
          });

          actionInstance.eventEmitter.once('fail', (_, reason: string) => {
            reject(new Error(`action ${action.name} failed: ${reason}`));
          });
        });
      })();

      this.currentActionInstance = undefined;
    }

    // Now, shouldRun must be true.

    this.wrappedState = ActionInstanceState.SUCCEEDED;
    this.eventEmitter.emit('succeed', this);
    consola.log(`${this.actionName}#${this.id} succeeded`);
  }
}
