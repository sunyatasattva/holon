import get from "lodash.get";
import set from "lodash.set";

import { CharacterAttributes, Modifiers, isNumber } from "../types";

// @fixme Typescript doesn't recognize `browser` in package.json
import Mechanics from "../../../../rulebook/rules/mechanics.json";

import { Item } from "./item";
import { Rules } from "../modules/rules";

type WeaponAttributes = CharacterAttributes |
  "ammoCapacity" |
  "criticalHitChance" |
  "damage" |
  "modifiers"

type WeaponSchema = {
  [k in keyof Weapon]: Weapon[k]
}

const attributesIcons = Mechanics.attributes
  .reduce((acc, curr) => {
    acc[curr.id] = curr.icon;

    return acc;
  }, {
    "ammo/capacity": "settings_input_component",
    criticalHitChance: "new_releases",
    damage: "gps_not_fixed"
  });

export default class Weapon extends Item {
  readonly baseAttributes: {
    [attribute in WeaponAttributes]?: string | number | Modifiers
  };

  ammo: {
    capacity: number,
    current: Item
  };
  criticalHitChance: number;
  damage: string;
  mods: Item[];
  range: string;

  constructor(opts: WeaponSchema) {
    super(opts);

    if(!this.mods)
      this.mods = [];

    if(this.baseAttributes)
      this.resetBaseAttributes();
    else
      this.baseAttributes = {
        ammoCapacity: get(opts, "ammo.capacity") || -1,
        criticalHitChance: this.criticalHitChance,
        damage: this.damage,
        modifiers: { ...this.modifiers }
      }

    this.calculateModifiedAttributes();
  }

  static getIconFor(attribute: string) {
    return attributesIcons[attribute];
  }

  attachMod(mod: Item) {
    if( this.mods.some(oldMod => mod.type === oldMod.type) ) {
      console.error(`Weapon ${this.type} already has ${mod.type}`);
      return;
    }

    this.mods.push(mod);

    this.calculateModifiedAttributes();
  }

  private calculateModifiedAttributes() {
    const currentAmmo = get(this, 'ammo.current');

    this.resetBaseAttributes();

    this.mods.forEach(mod => {
      const modifiers = mod.modifiers;

      if(modifiers)
        Rules.applyModifiers(modifiers, this);
    });

    if(currentAmmo && currentAmmo.modifiers)
      Rules.applyModifiers(currentAmmo.modifiers, this);

    return this;
  }

  private resetBaseAttributes() {
    const { 
      criticalHitChance, 
      damage,
      modifiers
    } = this.baseAttributes;
    
    set(this, 'ammo.capacity', <number>this.baseAttributes.ammoCapacity);
    this.criticalHitChance = <number>criticalHitChance;
    this.damage = <string>damage;
    this.modifiers = { ...<Modifiers>modifiers };

    return this;
  }
}