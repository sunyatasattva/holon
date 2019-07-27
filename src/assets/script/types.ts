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

export type Modifiers = {
  [attribute in CharacterAttributes]?: number
}

export function isNumber(x: any): x is number {
  return !isNaN(x);
}