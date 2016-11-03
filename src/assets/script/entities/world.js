const fabric = require('fabric').fabric;
const Line   = require('./line');
const Ruler  = require('./ruler');

/**
 * Cover class
 * @class World
 * @extends fabric.Canvas
 */
const World = fabric.util.createClass(fabric.Canvas, {

  activeObjects: [],
  
  size: {
    x: 20,
    y: 20
  },
  
  /**
   * Indicates whether group selection should be enabled.
   * @type Boolean
   * @default
   */
  selection: false,
  
  /**
   * Indicates if the right click on canvas can output the context
   * menu or not.
   * @type Boolean
   * @default
   */
  stopContextMenu: true,

  /**
   * Size of the grid tile
   *
   * @type {Number}
   * @default
   */
  tileSize: 50,

  /**
   * When set to `false`, an object can not be selected for 
   * modification (using either point-click-based or group-based
   * selection). But events still fire on it.
   *
   * @type {Boolean}
   * @default
   */
  selectable: false,
  
  /**
   * If other objects can move through this object.
   *
   * @type {Boolean}
   * @default
   */
  pathable: false,
  
  /**
   * Size of the world X axis in tiles
   *
   * @type {Number}
   * @default
   */
  worldSizeX: 50,
  
  /**
   * Size of the world Y axis in tiles
   *
   * @type {Number}
   * @default
   */
  worldSizeY: 50,

  /**
   * Constructor
   * @param {Array} [points] Array of points
   * @param {Object} [options] Options object
   * @return {fabric.Line} thisArg
   */
  initialize(options = {}) {
    this.callSuper('initialize', options);
    
    this._resizeToFullScreen();
    this._createGrid();
    this._setupRuler();
  },
  
  addAsActiveObject() {
    this.add.apply(this, arguments);
    this.fire('object:addedAsActive', arguments);
    
    return this;
  },
  
  calculateManhattanDistance(from, to) {
    return Math.abs(to.x - from.x)
           + Math.abs(to.y - from.y);
  },
  
  calculateOctileDistance(from, to, round) {
    let xDiff = Math.abs(to.x - from.x);
    let yDiff = Math.abs(to.y - from.y);
    let octileDistance = 0.5 * Math.min(xDiff, yDiff) + 1 * Math.max(xDiff, yDiff);
    
    return round ? Math[round](octileDistance) : octileDistance;
  },
  
  calculateRange(from, range, min = 0) {
    let tiles = [];
    
    for (let row = 0; row < this.size.y; row++) {
      for (let col = 0; col < this.size.x; col++) {
        let diff = Math.abs(row - from.y) + Math.abs(col - from.x);
        
        if (diff <= range && diff >= min)
          tiles.push({
            x: col,
            y: row
          });
      }
    }
    
    return tiles;
  },
  
  calculateRelativeDirection(from, to) {
    let direction;

    direction =  from.gridPosition.y === to.gridPosition.y ? '' : from.gridPosition.y > to.gridPosition.y ? 'N' : 'S';
    direction += from.gridPosition.x === to.gridPosition.x ? '' : from.gridPosition.x > to.gridPosition.x ? 'W' : 'E';
    
    return direction;
  },
  
  getCoordinatesOfTile(tile) {
    let coordinates; 
    // If an array is passed instead of an object,
    // convert the coordinates to object notation.
    if (tile.x === undefined)
      tile.x = tile[0];
    if (tile.y === undefined)
      tile.y = tile[1];

    // Coordinates are ordered according to the usual CSS order
    coordinates = {
      topLeft: [tile.x * this.tileSize, tile.y * this.tileSize],
      topRight: [tile.x * this.tileSize + this.tileSize, tile.y * this.tileSize],
      bottomRight: [tile.x * this.tileSize + this.tileSize, tile.y * this.tileSize + this.tileSize],
      bottomLeft: [tile.x * this.tileSize, tile.y * this.tileSize + this.tileSize]
    };

    return coordinates;
  },
  
  getTileFromCoordinates(x, y) {
    return {
      x: Math.floor( x / this.tileSize ),
      y: Math.floor( y / this.tileSize )
    }
  },
  
  highlightTiles(tiles, {
    color = '#0000ff',
    highlightType = 'all'
  } = {}) {
    let highlightedTiles,
        group;
    
    highlightedTiles = tiles.reduce((acc, tile) => {
      let coo = this.getCoordinatesOfTile(tile),
          highlightedTile;

      if (highlightType === 'pathableOnly') {
        if (!this.isPathable(tile))
          return acc;
      }
      
      highlightedTile = new fabric.Rect({
        left: coo.topLeft[0],
        top: coo.topLeft[1],
        width: this.tileSize,
        height: this.tileSize,
        fill: color,
        opacity: 0.1,
        originX: 'left',
        originY: 'top',
        centeredRotation: true,
        selectable: false,
      });

      return acc.concat(highlightedTile);
    }, []);
    
    group = new fabric.Group(highlightedTiles, {
      selectable: false,
      hasControls: false,
      type: 'highlight'
    });

    this.add(group);
    group.moveTo(1);

    return group;
  },
  
  isOccupied(tile) {
    return this.activeObjects.find( (obj) => {
        return obj.gridPosition.x === tile.x 
               && obj.gridPosition.y === tile.y
    });
  },
  
  isPathable(tile) {
    let objectOccupyingTheTile = this.isOccupied(tile);

    return (!objectOccupyingTheTile
            || objectOccupyingTheTile.pathable) ? true : false;
  },
  
  _createGrid({ stroke = '#ccc' } = {}) {
    let opts = {
      selectable: false,
      stroke: stroke,
      type: 'grid'
    },
        cols = [],
        rows = [],
        lines,
        gridGroup;
    
    // Add columns
    for (let i = 0; i <= this.worldSizeX; i++) {
      cols.push(new Line(
        [i * this.tileSize, 0, i * this.tileSize, this.worldSizeY * this.tileSize],
        opts
      ));
    }
      
    // Add rows
    for (let i = 0; i <= this.worldSizeY; i++) {
      rows.push(new Line(
        [0, i * this.tileSize, this.worldSizeX * this.tileSize, i * this.tileSize],
        opts
      ));
    }
    
    lines = cols.concat(rows);
    
    gridGroup = new fabric.Group(lines, {
      selectable: false,
      hasControls: false,
      type: 'grid'
    });
    
    this.add(gridGroup);
    gridGroup.moveTo(0);
    
    return gridGroup;
  },
  
  _resizeToFullScreen() {
    this.setHeight(window.innerHeight);
    this.setWidth(window.innerWidth);
    
    this.renderAll()
  },
  
  _setupRuler() {
    this.on('mouse:down', (opts) => {
      let rulerKey = Ruler.prototype.rulerKey,
          p = this.getPointer();

      if(!opts.e[rulerKey])
        return;
      
      this.add( new Ruler([p.x,p.y,p.x,p.y], { e: opts.e }) );
    });
    
    this.on('mouse:move', (opts) => {
      let rulerKey = Ruler.prototype.rulerKey;
      
      if(!opts.e.which || !opts.e[rulerKey] || !this.activeRuler)
        return;
      
      this.activeRuler._update(opts.e);
    });
    
    this.on('mouse:up', () => {
      if (!this.activeRuler)
        return;
      
      this.activeRuler._removeAndUnlock();
    });
  }

});

module.exports = World;