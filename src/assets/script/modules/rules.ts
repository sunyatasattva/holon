import get from "lodash.get";
import { statii } from "../../../../rulebook/rules/mechanics.json";
import { Modifiers, isNumber, Modifier, isConditionalModifier, ConditionalModifier } from "../types";
import { set } from "lodash";

/*
 * These are to be called bound.
 */
export const Conditionals = {
  forEachEnemyWithinVision(modifier: ConditionalModifier) {
    return Math.min(
      modifier.bonus * this.getValidTargets().length, 
      modifier.max
    );
  },
  hasStatus(statusId: string, modifier: ConditionalModifier) {
    return this.hasStatus(statusId) ? modifier.bonus : 0;
  },
  isActiveWeaponCategory(category: string, modifier: ConditionalModifier) {
    return this.equipment.activeWeapon
      && this.equipment.activeWeapon.category === category ? 
      modifier.bonus : 0;
  }
}

export class Rules {
  static applyModifiers(modifiers: Modifiers, target) {
    let modifiedVal: string;
    
    for( let [attr, mod] of Object.entries(modifiers) ) {
      // Need to convert `path|to|prop` to `path.to.prop` because
      // it is not possible to save dotted keys in Firebase
      // (also not possible to have slashed keys)
      attr = attr.split("|").join(".");
      mod = this._parseModifier(mod, target);

      const basePath = get(target, ['attributes', 'attr']) ?
        target.attributes : target;
      
      const baseAttribute: string | number = get(basePath, attr)
        || 0;
      let separator: string;
      
      // For example, damage: 1d4
      if(typeof baseAttribute === "string") {
        let attributeParts = baseAttribute.toString().split("+");

        // e.g. 1d4+1
        if(attributeParts.length > 1) {
          modifiedVal = attributeParts
            .map(x => +x ? +x + <number>mod : x)
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

          set(basePath, attr, modifiedVal);
        } else {
          separator = mod > 0 ? "+" : "";

          set(basePath, attr, `${attributeParts[0]}${separator}${mod}`);
        }
      } else {
        set(basePath, attr, baseAttribute + mod);
      }
    }

    return this;
  }

  static calculateChanceToHit(source, target) {
    target.calculateModifiedAttributes();

    const mod = [
      this._hitModCover,
      this._hitModWeapons,
      this._hitModWounds
    ].reduce((sum, modifier) => {
      return sum + modifier.call(this, source, target);
    }, 0);
    
    return source.attributes.aim - target.attributes.defense + mod;
  }
  
  static isTargetInCoverRelativeToSource(source, target) {
    let sourceDirection;
    
    if(!target.coveredSides)
      return false;
    else {
      sourceDirection = this._adjustRelativeDirectionBySideStepping(
        source,
        target,
        target.calculateRelativeDirectionTo(source)
      )
      
      return sourceDirection.split('')
        .map( (direction) => target.coveredSides[direction] )
        .reduce( (p,c) => Math.max(p,c) );
    }
  }
  
  private static _adjustRelativeDirectionBySideStepping(source, target, direction) {
    let dirs = direction.split(''),
        northOrSouth = dirs.includes('N') || dirs.includes('S'),
        eastOrWest = dirs.includes('E') || dirs.includes('W'),
        sourcePos = source.gridPosition[0],
        targetPos = target.gridPosition[0];
        
    if(northOrSouth && Math.abs(sourcePos.y - targetPos.y) === 1)
      dirs.splice(0,1);
    if(eastOrWest && Math.abs(sourcePos.x - targetPos.x) === 1) {
      dirs.splice(1,1);
    }
      
    return dirs.join('');
  }
  
  private static _hitModCover(source, target) {
    let targetCover = this.isTargetInCoverRelativeToSource(
          source, target),
        mod = !targetCover ? 0 : targetCover === 1 ? -20 : -40;
    
    return target.hasStatus('_hunkerDown') ? mod * 2 : mod;
  }

  private static _hitModWeapons(source, target) {
    let activeWeapon = get(source, 'equipment.activeWeapon'),
        // @todo integrate this with standard modifiers i.e. aim mod
        baseHitChanceModifier = get(activeWeapon, 'hitChanceModifier', 0),
        distance = source.getDistanceFrom(target),
        falloffPoint = get(activeWeapon, 'falloffPoint', 0);
    
    if( get(activeWeapon, 'range') === 'short' )
      return Math.max(
        -50,
        baseHitChanceModifier - Math.max(0, distance - falloffPoint) * 10
      );
    else if( get(activeWeapon, 'range') === 'long')
      return Math.min(
        50,
        baseHitChanceModifier + Math.max(0, distance - falloffPoint) * 5
      );
    else
      return baseHitChanceModifier;
  }

  private static _hitModWounds(source) {
    let wounds = source.attributes.wounds;
    
    return wounds ? wounds * -5 : 0;
  }

  private static _parseModifier(modifier: Modifier, target): number {
    if( isNumber(modifier) )
      return modifier;

    if( isConditionalModifier(modifier) ) {
      return modifier.conditions.reduce((sum, condition) => {
        const conditional = Conditionals[condition.type],
              args = condition.args || [];

        if(typeof conditional !== "function")
          return sum + modifier.bonus;

        return sum + conditional.apply(target, [...args, modifier]);
      }, 0);
    }
  }
};