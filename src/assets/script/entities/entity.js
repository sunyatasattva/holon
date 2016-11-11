const fabric = require('fabric').fabric;
const extend = fabric.util.object.extend;
const Label = require('./label');

/**
 * Cover class
 * @class Entity
 * @extends fabric.Object
 */
const Entity = fabric.util.createClass(fabric.Object, {
  
  hasControls: false,
  
  /**
   * If other objects can move through this object.
   *
   * @type {Boolean}
   * @default
   */
  pathable: true,
  
  /**
   * Constructor
   * @param {Array} [points] Array of points
   * @param {Object} [options] Options object
   * @return {Entity} thisArg
   */
  initialize(options = {}) {
    this.callSuper('initialize', options);

    this.on('added', () => {
      this.updateGridCoordinates();
      
      this._onObjectAdded();
    });
    
    this.on('modified', () => {
      this.updateGridCoordinates();
    });
  },
  
  calculateRelativeDirectionTo(to, center = true) {
    return this.canvas
          .calculateRelativeDirection(this, to, center);
  },
  
  displayLabel(str, opts) {
    if(this.currentLabel)
      this.removeCurrentLabel();
    
    this.currentLabel = new Label(str, {
      icon: { icon: opts.icon },
      left: opts.left || this.left,
      top: opts.top || this.top
    });
    
    this.canvas.add(this.currentLabel);
    
    return this;
  },
  
  getAdjacentTilesOfObject(obj) {
    return obj.gridPosition.filter((tileA) => {
      return this.gridPosition.some((tileB) => {
        return this.canvas.calculateOctileDistance(
          tileA, tileB) === 1;
      });
    });
  },
  
  isAdjacentToObject(obj) {
    return !this.isOverlappingWithObject(obj) 
      && this.gridPosition.some((tileA) => {
        return obj.gridPosition.some((tileB) => {
          return this.canvas.calculateOctileDistance(
            tileA, tileB) === 1;
        });
      });
    
    // @todo Think how to make this prettier
    // it iterates twice. Maybe could do a normal `for`
    // loop with an external variable or could build
    // my own Array method for pretty functional programming
  },
  
  isOverlappingWithObject(obj) {
    return this.gridPosition.some((tileA) => {
      return obj.gridPosition.some((tileB) => {
        return tileA.x === tileB.x && tileA.y === tileB.y;
      });
    });
  },
  
  removeCurrentLabel() {
    if(this.currentLabel)
      this.canvas.remove(this.currentLabel);
    
    return this;
  },
  
  toObject: function(props = []) {
    props = props.concat([
      'gridPosition'
    ]);

    return this.callSuper('toObject', props);
  },
  
  updateGridCoordinates() {
    // fabric calculates widths a bit badly, with an error, should
    // dive into it
    let tileSize = this.canvas.tileSize + 1,
        startTile = this.canvas.getTileFromCoordinates(
                       this.left, this.top),
        size = {
          x: Math.round(this.getWidth() / tileSize),
          y: Math.round(this.getHeight() / tileSize)
        },
        occupiedTiles = [];
    
    for(let w = 0; w < size.x; w++) {
      occupiedTiles.push(
        { x: startTile.x + w, y: startTile.y });

      for(let h = 1; h < size.y; h++) {
        occupiedTiles.push(
          { x: startTile.x + w, y: startTile.y + h});
      }
    }

    this.gridPosition = occupiedTiles;
    
    return this.gridPosition;
  },
  
  _allowRotationOnly() {
    this.set('hasControls', true);
    this.set('centeredRotation', true);

    this.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        tr: false,
        tl: false,
        br: false,
        bl: false
    });
  },
  
  _calculateCenterCoordinates() {
    let averageX = this.gridPosition.reduce(
      (prev, curr) => prev + curr.x, 0) / this.gridPosition.length,
        averageY = this.gridPosition.reduce(
      (prev, curr) => prev + curr.y, 0) / this.gridPosition.length;
    
    return {
      x: averageX,
      y: averageY
    };
  },
  
  _onObjectAdded() {
    this.on('moving', () => {
      this._snapToPathableGrid();
    });
    
    this.on('scaling', () => {
      this._snapScalingToGrid();
    });
  },
  
  _snapScalingToGrid() {
    this.set( 'scaleX', Math.round(this.scaleX) );
    this.set( 'scaleY', Math.round(this.scaleY) );
    this.canvas.renderAll();
  },
  // @todo moving bigger objects is a bit unpretictable
  // possibly because of Math.floor
  _snapToPathableGrid() {
    let tileSize = this.canvas.tileSize,
        targetCoords = {
        x: Math.floor(this.left / tileSize) * tileSize,
        y: Math.floor(this.top / tileSize) * tileSize
      },
        targetTile = this.canvas.getTileFromCoordinates(
          targetCoords.x,
          targetCoords.y
        );

        if( this.canvas.isOccupied(targetTile) === this
            || this.canvas.isPathable(targetTile) ) {
          this.allowedLeft = targetCoords.x;
          this.allowedTop = targetCoords.y;
        }

      this.set({
        left: this.allowedLeft,
        top: this.allowedTop
      });
  }
});

Entity.fromObject = function(object) {
  return new Entity(object);
}

// Adding to fabric namespace to allow for enliven without
// specifying namespaces. Might want to have a custom namespace,
// but in that case will need to change the load function
fabric.Entity = Entity;

module.exports = Entity;