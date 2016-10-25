const fabric = require('fabric').fabric;
const Entity = require('./entity');

/**
 * Walker class
 * @class Walker
 * @extends Entity
 * @mixes fabric.Circle.prototype
 */
const Walker = fabric.util.createClass(Entity, fabric.Circle.prototype, {
  attributes: {
    movement: 1
  },
  
  coveredColor: '#43de5d',
  coveredSides: {},
  exposedColor: '#f1cc16',
  originX: 'center',
  originY: 'center',
  
  showRangeOnSelected: 'movement',
  
  /**
   * Constructor
   * @param {Array} [points] Array of points
   * @param {Object} [options] Options object
   * @return {Entity} thisArg
   */
  initialize(options = {}) {
    this.callSuper('initialize', options);

    this._allowRotationOnly();
    this.set('allowedLeft', this.left);
    this.set('allowedTop', this.top);
    
    if(this.showRangeOnSelected) {
      this.on('selected', () => {
        if(this.showRangeOnSelected === 'movement')
          this.showMovementRange();
      });
    }
    
    this.on('deselected', () => {
      this.destroyTilesHighlightedByThis();
    });
    
    this.on('added', () => {
      this._updateCoverStatus();
    });
    
    this.on('modified', () => {
      this._updateCoverStatus();
    });
  },
  
  calculateMovementRange() {
    return {
      movementRange: this.canvas.calculateRange(
        this.gridPosition,
        this.attributes.movement,
        1
      ),
      dashingRange: this.canvas.calculateRange(
        this.gridPosition,
        this.attributes.movement * 2,
        this.attributes.movement + 1
      )
    };
  },
  
  destroyTilesHighlightedByThis() {
    let highlightedTiles = this.highlightedTiles;

    if(highlightedTiles.length) {
      highlightedTiles.forEach((o) => {
        this.canvas.remove(o);
      });

      this.canvas.renderAll();
    }
  },
  
  showMovementRange(showDashing = true) {
    let range = this.calculateMovementRange(),
        movementTiles,
        dashingTiles;
    
    movementTiles = this.canvas.highlightTiles(range.movementRange, {
      highlightType: 'pathableOnly'
    });
    
    if(showDashing) {
      dashingTiles = this.canvas.highlightTiles(range.dashingRange, {
        // @todo colors shouldn't be hardcoded
        color: '#ffff00',
        highlightType: 'pathableOnly'
      });
    };
    
    return this.highlightedTiles = [movementTiles, dashingTiles];
  },
  
  _onObjectAdded() {
    this.on('moving', () => {
      this._snapToPathableGrid();
    });
  },
  
  _snapToPathableGrid() {
    let tileSize = this.canvas.tileSize,
        targetCoords = {
        x: Math.floor(this.left / tileSize) * tileSize + tileSize * 0.5,
        y: Math.floor(this.top / tileSize) * tileSize + tileSize * 0.5
      },
        targetTile = this.canvas.getTileFromCoordinates(
          targetCoords.x,
          targetCoords.y
        );

      if ( this.canvas.isPathable(targetTile) ) {
        this.allowedLeft = targetCoords.x;
        this.allowedTop = targetCoords.y;
      }

      this.set({
        left: this.allowedLeft,
        top: this.allowedTop
      });
  },
  
  _updateCoverStatus() {
    let covers = this.canvas.activeObjects.filter(
      (obj) => obj.type === 'cover'
    ),
        covering = covers.filter((cover) => this.isAdjacentToObject(cover));
    
    if (covering.length)
      this.set('fill', this.coveredColor);
    else
      this.set('fill', this.exposedColor);
  }
});

module.exports = Walker;