export interface ActionInvocation {
  action: string;
  args: {name: string; value: unknown}[];
}
