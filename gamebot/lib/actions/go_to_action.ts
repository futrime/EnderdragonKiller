import {Arg} from '../arg.js';
import {Bot} from '../bot.js';
import {Parameter} from '../parameter.js';

import {ActionInstance} from './action_instance.js';
import {GoToActionInstance} from './go_to_action_instance.js';
import {PredefinedAction} from './predefined_action.js';

const NAME = 'GoTo';

const DESCRIPTION = 'Go to a specific location';

const PARAMETERS: Record<string, Parameter> = {
  'x': {
    name: 'x',
    description: 'X coordinate',
    type: 'number',
  },
  'y': {
    name: 'y',
    description: 'Y coordinate',
    type: 'number',
  },
  'z': {
    name: 'z',
    description: 'Z coordinate',
    type: 'number',
  },
};

export class GoToAction extends PredefinedAction {
  constructor() {
    super(NAME, DESCRIPTION, Object.values(PARAMETERS));
  }

  override instantiate(id: string, args: ReadonlyArray<Arg>, bot: Bot):
      ActionInstance {
    return new GoToActionInstance(id, args, bot);
  }
}
