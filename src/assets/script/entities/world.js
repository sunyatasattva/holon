const fabric = require('fabric').fabric;
const Line   = require('./line');
const Ruler  = require('./ruler');
const Tile   = require('./tile');

/**
 * Cover class
 * @class World
 * @extends fabric.Canvas
 */
const World = fabric.util.createClass(fabric.Canvas, {

  activeObjects: [],
  customHighlights: [],
  
  size: {
    x: 50,
    y: 50
  },
  
  /**
   * Indicates whether objects should remain in current stack position when selected. When false objects are brought to top and rendered as part of the selection group.
   * @type Boolean
   * @default
   */
  preserveObjectStacking: true,
  
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
   * Constructor
   * @param {Array} [points] Array of points
   * @param {Object} [options] Options object
   * @return {fabric.Line} thisArg
   */
  initialize(options = {}) {
    this.callSuper('initialize', options);
    
    this._resizeToFullScreen();
    this._createGrid();
    this._createMatrix();
  },
  
  addAsActiveObject(...objects) {
    let save;
    
    if(typeof objects[0] === 'boolean') {
      save = objects[0];
      objects.shift();
    }

    this.add.apply(this, objects);
    this.fire('object:addedAsActive', {
      objects: objects,
      save: save
    });
    
    console.log('Added as active objects:', objects);
    
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
  
  calculateRange: function (from, range, min = 0, rangeType = 'all', repeat = 1) {
    console.group(`Calculating ${range} range from ${JSON.stringify(from)}`);
    
    let area = [],
        currentCost = 0,
        i = 1,
        search = this.searchAroundTile(
          { ...from, cost: 0 },
          rangeType
        ),
        currentValue,
        visitedTiles;
    
    while(repeat) {
      console.time(`Area ${i}`);
      
      visitedTiles = [];
      
      while(currentCost < range * i) {
        currentValue = search.next().value;
        visitedTiles = currentValue.visitedTiles;
        
        currentCost = currentValue.tilesCosts.get(
          visitedTiles[visitedTiles.length - 1]
        );
      }
      
      area.push(
        visitedTiles.filter(tile => {
          const cost = currentValue.tilesCosts.get(tile);
          
          return cost >= min && cost > range * (i - 1);
        })
      );
      
      console.log(`Area ${i}: `, area);
      console.timeEnd(`Area ${i}`);
      
      i++;
      repeat -= 1;
    }
    
    console.groupEnd(`Calculating ${range} range from ${JSON.stringify(from)}`);

    return area;
  },
  
  calculateRelativeDirection(from, to, center = true) {
    let tileA,
        tileB,
        direction;
    
    tileA = !from.gridPosition ? from : 
            !center ? from[0] : from._calculateCenterCoordinates();
    tileB = !to.gridPosition ? to :
            !center ? to[0] : to._calculateCenterCoordinates();
    
    direction =  tileA.y === tileB.y ? '' : 
                    tileA.y > tileB.y ? 'N' : 'S';
    direction += tileA.x === tileB.x ? '' : 
                    tileA.x > tileB.x ? 'W' : 'E';
    
    return direction;
  },

  createRuler(opts) {
    const p = this.getPointer();
      
    this.add( new Ruler([p.x,p.y,p.x,p.y], { e: opts.e }) );
  },
  
  getActiveObjects(type) {
    return type ? 
      this.activeObjects.filter((o) => o.type === type) :
      this.activeObjects;
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
  
  getTilesAdjacentTo(tile, diagonal = false) {
    const adjacentOffsets = [ [0, 1], [0, -1], [1, 0], [-1, 0] ],
          diagonalOffsets = [ [1, 1], [-1, -1], [1, -1], [-1, 1] ];
    
    let offsets = diagonal ? diagonalOffsets : adjacentOffsets;
    
    return offsets
      .map(([x,y]) => {
        
        return this.matrix[tile.x + x] ? this.matrix[tile.x + x][tile.y + y] : null;
      })
      .filter(_ => _);
  },
  
  getTilesDiagonalTo(tile) {
    return this.getTilesAdjacentTo(tile, true);
  },
  
  searchAroundTile: function* (originalTile, type = 'all') {
    let costStep = 0,
        diagonalTiles = [],
        frontier = new Set([originalTile]),
        tilesCosts = new Map([ [originalTile, costStep] ]),
        visitedTiles = new Set(),
        currentTile,
        currentTileCost;
    
    const addCostToTiles = function(map, tiles, cost) {
      tiles.forEach(tile => {
        if( !map.get(tile) )
          map.set(tile, cost * tile.costMultiplier);
      });
    };
    
    const canVisitTile = (tile) => {
      return !visitedTiles.has(tile)
        && (
          tile === originalTile
          || type === 'all'
          || this.isPathable(tile)
        )
    };
    
    while(frontier.size) {
      currentTile = frontier.values().next().value;
      currentTileCost = tilesCosts.get(currentTile);
      
      if(currentTileCost <= costStep) {
        frontier.delete(currentTile);
        
        if( canVisitTile(currentTile) ) {
          this.getTilesAdjacentTo(currentTile)
            .forEach(frontier.add, frontier);
          
          diagonalTiles.push( ...this.getTilesDiagonalTo(currentTile) );
          
          addCostToTiles(tilesCosts, frontier, currentTileCost + 1);
          addCostToTiles(tilesCosts, diagonalTiles, currentTileCost + 1.5);

          visitedTiles.add(currentTile);
        }
      }
      else {
        diagonalTiles.forEach(frontier.add, frontier);
        costStep += 1;
        
        yield { 
          tilesCosts, 
          visitedTiles: Array.from(visitedTiles)
        };
      }
    }
    
    yield { 
      tilesCosts, 
      visitedTiles: Array.from(visitedTiles)
    };
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
        opacity: 0.2,
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
    return this.matrix[tile.x][tile.y].getChildren();
  },
  
  isPathable(tile) {
    let objectsOccupyingTheTile = this.isOccupied(tile);

    return !this.matrix[tile.x][tile.y].pathable
           || !objectsOccupyingTheTile.length
           || objectsOccupyingTheTile.every(o => o.pathable);
  },
  
  remove(object) {
    object.fire('before:remove');
    this.callSuper('remove', object);
  },
  
  removeFromActiveObjects(object) {
    this.remove(object);
    this.renderAll();
  },
  
  updateActiveObjectsStatus() {
    this.activeObjects.forEach( (o) => o._onObjectAdded() );
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
    for (let i = 0; i <= this.size.x; i++) {
      cols.push(new Line(
        [i * this.tileSize, 0, i * this.tileSize, this.size.y * this.tileSize],
        opts
      ));
    }
      
    // Add rows
    for (let i = 0; i <= this.size.y; i++) {
      rows.push(new Line(
        [0, i * this.tileSize, this.size.x * this.tileSize, i * this.tileSize],
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
  
  _createMatrix() {
    this.matrix = [];
    
    for(let x = 0; x <= this.size.x; x++) {
      this.matrix[x] = new Array(this.size.y);
      
      for(let y = 0; y <= this.size.y; y++) {
        this.matrix[x][y] = new Tile(x, y);
      }
    }
  },
  
  _resizeToFullScreen() {
    this.setHeight(window.innerHeight);
    this.setWidth(window.innerWidth);
    
    this.renderAll()
  }

});

module.exports = World;