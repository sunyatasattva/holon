import get from "lodash.get";
import set from "lodash.set";

import { CharacterAttributes, Modifiers, isNumber } from "../types";

// @fixme Typescript doesn't recognize `browser` in package.json
import Mechanics from "../../../../rulebook/rules/mechanics.json";

import { Item } from "./item";

type WeaponAttributes = CharacterAttributes |
  "ammo.capacity" |
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
    criticalHitChance: "new_releases",
    damage: "gps_not_fixed"
  });

export default class Weapon extends Item {
  readonly baseAttributes: {
    [attribute in WeaponAttributes]?: string | number | Modifiers
  };

  ammo: {
    capacity: number
  };
  criticalHitChance: number;
  damage: string;
  mods: Item[];
  range: string;

  constructor(opts: WeaponSchema) {
    super(opts);

    if(!this.mods)
      this.mods = [];

    this.baseAttributes = {
      //"ammo.capacity": get(opts, "ammo.capacity") || -1,
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

  private applyModifiers(modifiers: Modifiers) {
    let modifiedVal: string;
    
    for( const [attr, mod] of Object.entries(modifiers) ) {
      const baseAttribute: string | number = this[attr] 
        || this.modifiers[attr] 
        || 0;
      let separator: string;
      
      if(typeof baseAttribute === "string") {
        let attributeParts = baseAttribute.toString().split("+");

        if(attributeParts.length > 1) {
          modifiedVal = attributeParts
            .map(x => +x ? +x + mod : x)
            .reduce<string>((acc, curr) => {
              if( !isNumber(curr) )
                return curr;
              else if(curr === 0)
                return `${acc}`;
              else {
                separator = curr > 0 ? "+" : "-";

                return `${acc}${separator}${curr}`;
              }
            }, "");

          set(this, attr, modifiedVal);
        } else {
          separator = mod > 0 ? "+" : "";

          set(this, attr, `${baseAttribute[0]}${separator}${mod}`);
        }
      } else {
        const path = this[attr] ? attr : `modifiers.${attr}`;

        set(this, path, baseAttribute + mod);
      }
    }

    return this;
  }

  private calculateModifiedAttributes() {
    this.resetBaseAttributes();

    this.mods.forEach(mod => {
      const modifiers = mod.modifiers;

      if(modifiers)
        this.applyModifiers(modifiers);
    });

    return this;
  }

  private resetBaseAttributes() {
    const { 
      criticalHitChance, 
      damage,
      modifiers
    } = this.baseAttributes;
    
    //this.ammo.capacity = <number>this.baseAttributes["ammo.capacity"];
    this.criticalHitChance = <number>criticalHitChance;
    this.damage = <string>damage;
    this.modifiers = { ...<Modifiers>modifiers };

    return this;
  }
}