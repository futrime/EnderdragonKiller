//@ts-check
'use strict';

import Ajv from 'ajv';

/**
 * The interface for a program.
 */
export class IProgram {
  /**
   * Gets the type of the program.
   * @returns {string} The type of the program.
   */
  getType() {
    throw new Error('Method not implemented.');
  }
}

/**
 * Represents an action that can be directly executed by a bot.
 */
export class Action extends IProgram {
  /**
   * @param {Object} json The JSON representation of the program.
   */
  constructor(json) {
    super();

    // Validate the JSON representation.
    const SCHEMA = {
      'type': 'object',
      'properties': {
        'type': {
          'type': 'string',
        },
        'action': {
          'type': 'object',
          'properties': {
            'name': {
              'type': 'string',
            },
            'paramMap': {
              'type': 'object',
              'patternProperties': {
                '^[a-zA-Z0-9_]$': {
                  'type': 'string',
                },
              },
            },
          },
          'required': [
            'name',
            'paramMap',
          ],
        },
      },
      'required': [
        'type',
        'action',
      ],
    };
    const ajv = new Ajv();
    const validate = ajv.compile(SCHEMA);
    const valid = validate(json);
    if (valid !== true) {
      throw new Error(
          `invalid action JSON: ${JSON.stringify(validate.errors)}`);
    }

    /**
     * @type {string}
     */
    this.name_ = json.action.name;
    /**
     * @type {{[k: string]: any}}
     */
    this.paramMap_ = json.action.paramMap;
  }

  getType() {
    return 'action';
  }

  /**
   * Gets the name of the action.
   * @returns {string} The name of the action.
   */
  getName() {
    return this.name_;
  }

  /**
   * Gets the parameter map.
   * @returns {{[k: string]: any}} The parameter map.
   */
  getParamMap() {
    return this.paramMap_;
  }
}

/**
 * Represents a sequence of subprograms.
 */
export class Sequence extends IProgram {
  /**
   * @param {Object} json The JSON representation of the program.
   */
  constructor(json) {
    super();

    // Validate the JSON representation.
    const SCHEMA = {
      'type': 'object',
      'properties': {
        'type': {
          'type': 'string',
        },
        'sequence': {
          'type': 'array',
          'items': {
            'type': 'object',
          },
        },
      },
      'required': [
        'type',
        'sequence',
      ],
    };
    const ajv = new Ajv();
    const validate = ajv.compile(SCHEMA);
    const valid = validate(json);
    if (valid !== true) {
      throw new Error(
          `invalid sequence JSON: ${JSON.stringify(validate.errors)}`);
    }

    try {
      /**
       * @type {(IProgram)[]}
       */
      this.sequence_ = json.sequence.map(
          (/** @type {Object} */ item) => createProgram(item));

    } catch (error) {
      throw new Error(`failed to create subprogram: ${error.message}`);
    }
  }

  getType() {
    return 'sequence';
  }

  /**
   * Gets the subprograms.
   * @returns {(IProgram)[]} The subprograms.
   */
  getSequence() {
    return this.sequence_;
  }
}

/**
 * Creates a program from the JSON representation.
 * @param {Object} json The JSON representation of the program.
 * @returns {IProgram} The program.
 */
export function createProgram(json) {
  // Validate the JSON representation.
  const SCHEMA = {
    'type': 'object',
    'properties': {
      'type': {
        'type': 'string',
      },
    },
    'required': [
      'type',
    ],
  };
  const ajv = new Ajv();
  const validate = ajv.compile(SCHEMA);
  const valid = validate(json);
  if (valid !== true) {
    throw new Error(`invalid program JSON: ${JSON.stringify(validate.errors)}`);
  }

  switch (json.type) {
    case 'action':
      return new Action(json);

    case 'sequence':
      return new Sequence(json);

    default:
      throw new Error(
          `unknown program type ${json.type} of ${JSON.stringify(json)}`);
  }
}
