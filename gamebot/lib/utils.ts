export interface Arg {
  readonly name: string;
  readonly value: unknown;
}

export interface Parameter {
  readonly name: string;
  readonly description: string;
  readonly type: string;
}
