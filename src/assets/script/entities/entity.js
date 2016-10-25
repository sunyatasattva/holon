const fabric = require('fabric').fabric;

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
  
  isAdjacentToObject(obj) {
    return this.canvas.calculateOctileDistance(
      this.gridPosition, obj.gridPosition) === 1;
  },
  
  updateGridCoordinates() {
    // @todo for larger entities, see if width/height > tileSize
    // and if that's the case add gridPositionEnd or maybe array
    // of tiles occupied.
    return this.gridPosition = this.canvas.getTileFromCoordinates(
      this.left, this.top);
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
  
  _onObjectAdded() {}
});

module.exports = Entity;