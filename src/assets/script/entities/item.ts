import { Modifiers } from "../types";

type ItemSchema = {
  [k in keyof Item]: Item[k]
};

export class Item {
  readonly category?: string;
  readonly cost: number;
  readonly description?: string;
  readonly effects?: any[];
  readonly id: string;
  readonly kind: string;
  readonly type: string;

  modifiers?: Modifiers = {};

  constructor(opts: ItemSchema) {
    Object.assign(this, opts);
  }
}