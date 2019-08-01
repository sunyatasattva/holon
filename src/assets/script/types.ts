export type CharacterAttributes =
  "action" |
  "aim" |
  "focus" |
  "movement" |
  "reflexes" |
  "resistance" |
  "resources" |
  "vision" |
  "toughness";

export type Condition = {
  args?: any[],
  type: string
}

export type ConditionalModifier = {
  bonus: number,
  conditions: Condition[],
  max: number
}

export type Modifier = number
  | ConditionalModifier

export type Modifiers = {
  [attribute in CharacterAttributes]?: Modifier
}

export function isConditionalModifier(
  modifier: Modifier
): modifier is ConditionalModifier {
  return !isNumber(modifier) && !!modifier.conditions;
}

export function isNumber(x: any): x is number {
  return !isNaN(x);
}