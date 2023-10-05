export interface ActionInvocation {
  action: string;
  args: {name: string; value: boolean | number | string | null | object}[];
}

export abstract class Program {
  abstract[Symbol.iterator](): Iterator<ActionInvocation>;
}
