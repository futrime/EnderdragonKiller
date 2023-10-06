export interface ActionInvocation {
  action: string;
  args: {name: string; value: boolean | number | string | null | object}[];
}
