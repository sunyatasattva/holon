const fabric = require('fabric').fabric;
const extend = fabric.util.object.extend;
const Entity = require('./entity');
const Label  = require('./label');

import Vue from 'vue';

import get from 'lodash.get';
import xorBy from 'lodash.xorby';

import Mechanics from '_mechanics';
import Rules from '../modules/rules';
import { prototype as Cover } from './cover'; 
import Weapon from './weapon';

/**
 * Walker class
 * @class Walker
 * @extends Entity
 * @mixes fabric.Circle.prototype
 */
const Walker = fabric.util.createClass(Entity, fabric.Circle.prototype, {
  attributes: {
    skills: [],
    status: []
  },
  equipment: {
    activeWeapon: {},
    armor: {},
    items: [],
    weapons: []
  },
  
  coveredSides: {},
  fullyCoveredColor: Cover._coverOpts.fullFill,
  partiallyCoveredColor: Cover._coverOpts.partialFill,
  includeDefaultValues: false,
  originX: 'left',
  originY: 'top',
  teamFills: [
    '#43de5d',
    '#43a2de'
  ],
  
  hasActed: false,
  isDelaying: false,
  // @todo this entity is technically pathable (i.e. other objects)
  // can take a path through it), but currently pathing is not really
  // implemented and this object should block stopping movement on
  // itself, which is what this is about for now
  pathable: false,
  showRangeOnSelected: 'movement',
  snapToMovementRange: true,
  targetable: true,
  team: 0,
  type: 'walker',
  
  /**
   * Constructor
   * @param {Array} [points] Array of points
   * @param {Object} [options] Options object
   * @return {Entity} thisArg
   */
  initialize(options = {}) {
    this.callSuper('initialize', options);

    this.attributes.skills = this.attributes.skills || [];
    this.attributes.status = this.attributes.status || [];
    this.attributes.wounds = this.attributes.wounds || 0;
    this.calculateModifiedAttributes();
    this.set('defaultFill', this.teamFills[this.team]);
    this.set('fill', this.defaultFill);
    this._allowRotationOnly();
    this.set('allowedLeft', this.left);
    this.set('allowedTop', this.top);
    
    if(this.attributes.skills.length)
      this.attributes.skills = this.attributes.skills
        .map((skill) => {
          if(skill.cooldown && !skill.currentCooldown)
            return { ...skill, currentCooldown: false }
          else
            return skill;
        });

    if(this.equipment.weapons.length) {
      this.equipment.weapons = this.equipment.weapons
        .map(weapon => new Weapon(weapon));

      this.equipment.activeWeapon = new Weapon(this.equipment.activeWeapon);
    }
    
    if(this.showRangeOnSelected) {
      this.on('selected', () => {
        if(this.showRangeOnSelected === 'movement')
          this.showMovementRange();
      });
    }

    this.calculateModifiedAttributes();
    
    this.on('deselected', () => {
      this.destroyTilesHighlightedByThis();
    });
    
    this.on('added', () => {
      this._updateCoverStatus();
    });
    
    this.on('modified', () => {
      // @todo implement "moved" event
      this._updateCoverStatus();
      // @todo labels should be grouped
      this.displayStatus();
    });
  },
  
  // @todo refactor this in a mixin
  calculateChanceToHit(target) {
    return Rules.calculateChanceToHit(this, target);
  },
  
  calculateModifiedAttributes() {
    let equipment = [
      this.equipment.armor,
      this.equipment.activeWeapon
    ];
    
    this.resetBaseAttributes();

    equipment
      .filter(x => x)
      .forEach( this._applyModifiers.bind(this) );
    
    this.attributes.status
      .map(characterStatus => {
        return Mechanics.statii.find(
          status => status.id === characterStatus.id
        );
      })
      .forEach( this._applyModifiers.bind(this) );
    
    return this;
  },
  
  calculateMovementRange() {    
    return this.canvas.calculateRange(
      this.gridPosition[0],
      this.attributes.movement,
      0,
      'pathableOnly',
      this.attributes.action
    );
  },
  
  calculateVisionRange() {
    return this.canvas.calculateRange(
      this.gridPosition[0],
      this.attributes.vision,
      3
    );
  },
  
  destroyTilesHighlightedByThis() {
    let highlightedTiles = this.highlightedTiles;
    
    if(highlightedTiles && highlightedTiles.length) {
      highlightedTiles.forEach((o) => {
        this.canvas.remove(o);
      });

      this.canvas.renderAll();
    }
    
    return this;
  },
  
  displayNameLabel() {
    return this.displayLabel(this.attributes.name, {
      icon: 'person',
      top: this.top + this.height
    });
  },
  
  displayStatus() {
    let statii = this.attributes.status,
        icons;
    
    if(this.statusLabel)
      this.canvas.remove(this.statusLabel);
    
    if(!statii || !statii.length)
      return;
    
    icons = statii.map((status) => {
      let icon;

      try {
        icon = Mechanics.statii
          .find( _ => _.id === status.id )
          .icon;
        
        return icon;
      } catch (e) {
        console.error(`Status ${status} is invalid.`);
      }
    });

    this.statusLabel = new Label('', {
      icon: { icon: icons.join(' ') },
      left: this.left,
      top: this.top
    });
    
    this.canvas.add(this.statusLabel);
    
    return this;
  },
  
  executeCommand(command, ...options) {
    console.log(`${this.attributes.name} is executing ${command.name}.`, options);
    
    try {
      command.effects.forEach((effect) => {
        this[effect.type](...effect.arguments, ...options);
      });
    } catch(e) {
      console.warn(`Couldn't execute effects for ${command.name}`, e);
    }
  },
  
  getDistanceFrom(target) {
    let thisCenter = this._calculateCenterCoordinates(),
        targetCenter;
    
    if(target.gridPosition) {
      targetCenter = target._calculateCenterCoordinates();
    }
    else if(target.x && target.y) {
      targetCenter = target;
    }
    else {
      console.error("Invalid target:", target);
      
      return false;
    }
    
    return this.canvas
        .calculateOctileDistance(thisCenter, targetCenter);
  },
  
  getValidTargets() {
    return this.canvas.getActiveObjects('walker')
      .filter(this.isValidTarget.bind(this));
  },
  
  hasStatus(statusId) {
    return this.attributes.status && this.attributes.status.some(
      (status) => status.id === statusId
    )
  },
  
  highlightAllHitChances() {
    let possibleTargets = this.getValidTargets();
    
    this.showVisionRange();

    possibleTargets.forEach((target) => {
      target._highlightChanceToBeHitBy(this);
    });
  },
  
  isValidTarget(target) {
    return target.targetable
           && target !== this
           && target.team !== this.team
           && this.isWithinVisionRange(target);
  },
  
  isWithinMovementRange(targetTile) {
    return [].concat(...this.maxMovementRange)
      .some((tile) => {
        return tile.x === targetTile.x && tile.y === targetTile.y;
      });
  },
  
  isWithinVisionRange(target) {
    return this.getDistanceFrom(target) <= this.attributes.vision;
  },
  
  reduceCountdowns() {
    this.attributes.skills
      .forEach(skill => skill.currentCooldown && skill.currentCooldown--);
    
    this.attributes.status
      .forEach((status) => {
        if(status.duration > 0) {
          status.duration--;
          
          if(status.duration === 0)
            this.toggleStatus(status);
        }
      });
    
    
    this._update();
    
    return this;
  },
  
  reloadWeapon(ammo) {
    const activeWeapon = this.equipment.activeWeapon;
    
    if(activeWeapon.ammo.capacity) {
      // @todo Currently doesn't support two weapons of the same type
      Vue.set(
        this.equipment,
        'weapons',
        this.equipment.weapons.map(weapon => {
          if(weapon.type !== activeWeapon.type)
            return weapon;
          else {
            return {
              ...weapon,
              ammo: {
                ...weapon.ammo,
                current: ammo
              },
              currentAmmo: weapon.ammo.capacity
            }
          }
        })
      );
      
      this._applyAmmoModifiers();
    } else {
      console.warn('Cannot reload current weapon');
    }
  },
  
  resetBaseAttributes() {
    this.attributes = {
      ...this.attributes,
      ...this.baseAttributes
    };
  },
  
  resetVisualStatus() {
    try {
      this
        .removeCurrentLabel()
        ._resetDefaultColor();
      
      this.canvas.renderAll();
    }
    catch(ok) {}
    
    return this;
  },
  
  setAttribute(attr, val) {
    this.attributes[attr] = val;
    
    this._update();
    
    return this;
  },
  
  setProp(prop, val) {
    this[prop] = val;
    
    this._update();
    
    return this;
  },
  
  showMovementRange(showDashing = true) {
    console.time(`Calculating movement range for ${this.attributes.name}`);
    let range = this.calculateMovementRange(),
        movementTiles = [];
    
    console.timeEnd(`Calculating movement range for ${this.attributes.name}`);
    
    console.time(`Visualizing movement range for ${this.attributes.name}`);
    
    range.forEach((area, i) => {
      let opacity = (1 - i * 0.25);
      
      movementTiles.push(
        this.canvas.highlightTiles(
          area, 
          {
            color: `rgba(0, 0, 255, ${opacity})`,
            highlightType: 'pathableOnly'
          }
        )
      )
    });
    
    this.destroyTilesHighlightedByThis();
    this.highlightedTiles = movementTiles;
    
    console.timeEnd(`Visualizing movement range for ${this.attributes.name}`);
    
    return this.highlightedTiles;
  },
  
  showVisionRange() {
    let range = this.calculateVisionRange(),
        visionTiles;
    
    visionTiles = this.canvas.highlightTiles(range[0], {
      color: '#000',
      opacity: 0.1
    });
    
    this.destroyTilesHighlightedByThis();
    this.highlightedTiles = [visionTiles];
    
    return this.highlightedTiles;
  },
  
  toggleStatus(status) {
    return this.setAttribute(
      'status',
      xorBy( this.attributes.status, [{...status}], 'id' )
    ).calculateModifiedAttributes();
  },
  
  toObject: function(props = []) {
    props = props.concat([
      'attributes',
      'baseAttributes',
      'equipment',
      'hasActed',
      'isDelaying',
      'showRangeOnSelected',
      'radius',
      'team'
    ]);
    
    return this.callSuper('toObject', props);
  },

  useItem(item) {
    let itemIndex;
    const ownItem = this.equipment.items
      .find((ownItem, idx) => {
        const id = item.id || item;
        
        if(id === ownItem.id) {
          itemIndex = idx;

          return true;
        }
      });

    if(!ownItem) {
      console.error(`${this.attributes.name} can't use ${item.type}`);
      return;
    }

    if(--ownItem.value <= 0)
      this.equipment.items.splice(itemIndex, 1);

    // @todo implement actual item effect

    console.log(`${this.attributes.name} used ${item.type}`);

    return this;
  },
  
  _applyAmmoModifiers() {
    this.equipment.weapons = this.equipment.weapons
      .map(weapon => {
        const base = weapon.baseAttributes || { ...weapon },
              modifiedAttributes = {},
              modifiers = get(weapon, 'ammo.current.modifiers') || {};

        for( let [attr, mod] of Object.entries(modifiers) ) {
            let baseAttribute = base[attr].toString().split('+'),
                separator;

            if(baseAttribute.length > 1) {
              modifiedAttributes[attr] = baseAttribute
                .map(x => +x ? +x + mod : x)
                .reduce((acc, curr) => {
                  if( isNaN(curr) )
                    return curr;
                  else if(curr === 0)
                    return `${acc}`;
                  else {
                    separator = curr > 0 ? '+' : '-';

                    return `${acc}${separator}${curr}`
                  }
                }, '');
            } else {
              separator = mod > 0 ? '+' : '';

              modifiedAttributes[attr] = `${baseAttribute[0]}${separator}${mod}`;
            }
          }

        return {
          ...base,
          ...modifiedAttributes,
          ammo: weapon.ammo,
          baseAttributes: base
        }
      });
  },
  
  _applyModifiers(source) {
    let modifiers = source.modifiers;
    
    if(modifiers) {
      for( let [attr, mod] of Object.entries(modifiers) ) {
        if(!this.attributes[attr])
          continue;
        
        if(typeof mod === 'number')
          this.attributes[attr] += mod;
        else {
          if(mod[0] === 'x')
            this.attributes[attr] *= mod[1];
          if(mod[1] === '½') {
            this.attributes[attr] = Math.floor(
              this.attributes[attr] / 2
            );
          }
        }
      }
    }
  },
  
  _highlightChanceToBeHitBy(source) {
    let chanceToHit = source.calculateChanceToHit(this),
        cover = Rules.isTargetInCoverRelativeToSource(source, this);
    
    this.displayLabel(
      `${chanceToHit}%`,
      { 
        icon: 'gps_fixed',
        top: this.top + this.height
      }
    );
    
    if(cover > 0) {
      this.set(
        'fill',
        cover === 1 ?
          this.partiallyCoveredColor :
          this.fullyCoveredColor
      );
      
      this.canvas.renderAll();
    }
  },
  
  _onObjectAdded() {
    this.callSuper('_onObjectAdded');
    this._updateCoverStatus();
    this.maxMovementRange = this.calculateMovementRange();
    
    // @todo refactor to _updateMaxMovementRange
    this.on('deselected', () => {
      this.maxMovementRange = this.calculateMovementRange();
    });
    
    this.displayStatus();
  },
  
  _resetDefaultColor() {
    return this.set('fill', this.defaultFill);
  },
  
  // @todo this method is copied to Entity as well, refactor
  // this to include only movement range
  _snapToPathableGrid() {
    let tileSize = this.canvas.tileSize,
        targetCoords = {
        x: Math.floor((this.left + tileSize / 2) / tileSize) * tileSize,
        y: Math.floor((this.top + tileSize / 2) / tileSize) * tileSize
      },
        targetTile = this.canvas.getTileFromCoordinates(
          targetCoords.x,
          targetCoords.y
        );

    if(
        ( this.snapToMovementRange
        && this.isWithinMovementRange(targetTile) )
        || !this.snapToMovementRange
      ){
        if( this.canvas.isOccupied(targetTile) === this
            || this.canvas.isPathable(targetTile) ) {
          this.allowedLeft = targetCoords.x;
          this.allowedTop = targetCoords.y;
        }
      }

      this.set({
        left: this.allowedLeft,
        top: this.allowedTop
      });
  },
  
  _update() {
    this.fire('modified');
    this.canvas.fire('object:modified');
  },
  
  _updateCoverStatus() {
    let covers = this.canvas.activeObjects.filter(
      (obj) => obj.type === 'cover'
    ),
        covering = covers.filter((cover) => {
          return this.isAdjacentToObject(cover);
        })
        .map((cover) => {
          // @todo refactor this [0] feels like an hack
          // introduced it because I am thinking of covers
          // for characters larger than a tile...
          return {
            cover: cover,
            tiles: this.getAdjacentTilesOfObject(cover)[0]
          }
        })
        .map((cover) => {
          return {
            cover: cover.cover,
            side: this.calculateRelativeDirectionTo(cover.tiles)
          }
        });
    
    this.set('coveredSides', { N: 0, E: 0, S: 0, W: 0 });
    
    covering.forEach((cover) => {
      // @todo this is a bit of a hack that is going to work
      // only as long as walkers are not bigger than one
      // tile: it makes sure that two partial covers stacked
      // on top of one another will give full cover
      this.coveredSides[cover.side] += 
        cover.cover.coverType === 'partial' ? 1 : 2;
    });
    
    console.log('Cover status updated:', this.coveredSides);
  }
});

Walker.fromObject = function(object) {
  return new Walker(object);
}

fabric.Walker = Walker;

module.exports = Walker;