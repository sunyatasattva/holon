import { fabric } from 'fabric';
import Edge from './edge';
import Line from './line';
import Ruler from './ruler';
import Tile from './tile';

/**
 * EdgeInfo
 * @typedef {Object} EdgeInfo
 * @property {Object} tile Tile object {x, y}
 * @property {String} edgeType Type of edge (top, bottom, left, right)
 * @property {Number} distance Distance from the edge to the pointer
 */

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

  style: {
    edgeHighlight: {
      stroke: '#00ff00',
      strokeWidth: 2
    }
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

  /**
   * Calculate the coordinates of an edge
   * @param {EdgeInfo} edgeInfo 
   * @returns {Object|null} Object with x1, y1, x2, y2 coordinates or null if edge type is invalid
   */
  calculateEdgeCoordinates(edgeInfo) {
    const { tile, edgeType } = edgeInfo;
    
    const tileSize = this.tileSize;
    const tileX = tile.x * tileSize;
    const tileY = tile.y * tileSize;
    
    const coordinateMap = {
      top: {
        x1: tileX,
        y1: tileY,
        x2: tileX + tileSize,
        y2: tileY
      },
      bottom: {
        x1: tileX,
        y1: tileY + tileSize,
        x2: tileX + tileSize,
        y2: tileY + tileSize
      },
      left: {
        x1: tileX,
        y1: tileY,
        x2: tileX,
        y2: tileY + tileSize
      },
      right: {
        x1: tileX + tileSize,
        y1: tileY,
        x2: tileX + tileSize,
        y2: tileY + tileSize
      }
    };
    
    return coordinateMap[edgeType] || null;
  },
  
  calculateManhattanDistance(from, to) {
    return Math.abs(to.x - from.x)
           + Math.abs(to.y - from.y);
  },
  
  /**
   * Calculate the octile distance between two tiles.
   * 
   * Note that this is not the “true” octile distance, but a modified version
   * that uses 0.5 instead √2 (0.4142) for diagonal movement. This is slightly
   * inexact, but it's much more intuitive (i.e. “every diagonal step is 1.5
   * steps”).
   * 
   * @param {Tile} from - The starting tile {x, y}
   * @param {Tile} to - The ending tile {x, y}
   * @param {String} round - The rounding method to use ('round', 'floor', 'ceil')
   * @returns {Number} The octile distance between the two tiles
   */
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
        visitedTiles,
        searchResult;
    
    while(repeat) {
      console.time(`Area ${i}`);
      
      visitedTiles = [];
      
      while(currentCost < range * i) {
        searchResult = search.next();

        if (searchResult.done) {
          break;
        }
        
        currentValue = searchResult.value;
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

  createEdgeHighlight(edgeInfo, opts = {}) {
    const { 
      stroke = this.style.edgeHighlight.stroke,
      strokeWidth = this.style.edgeHighlight.strokeWidth
    } = opts;
    
    const { x1, y1, x2, y2 } = this.calculateEdgeCoordinates(edgeInfo);
      
    const highlight = new fabric.Line([x1, y1, x2, y2], {
      stroke,
      strokeWidth,
      selectable: false,
      evented: false,
      type: 'edgeHighlight'
    });
      
    this.add(highlight);
    this.renderAll();

    return highlight;
  },

  /**
   * Find the nearest edge to a pointer position
   * @param {Object} pointer Pointer coordinates {x, y}
   * @returns {Object} Object with tile and edge type information
   */
  findNearestEdge(pointer) {
    const tile = this.getTileFromCoordinates(pointer.x, pointer.y);
    
    // Bounds checking
    if (tile.x < 0 || tile.y < 0 || tile.x >= this.size.x || tile.y >= this.size.y) {
      return null;
    }
    
    // Calculate relative position within tile
    const tileLeft = tile.x * this.tileSize;
    const tileTop = tile.y * this.tileSize;
    const relativeX = Math.max(0, Math.min(this.tileSize, pointer.x - tileLeft));
    const relativeY = Math.max(0, Math.min(this.tileSize, pointer.y - tileTop));
    
    // Determine which edge is closest
    const edges = [
      { type: 'top', distance: relativeY },
      { type: 'bottom', distance: this.tileSize - relativeY },
      { type: 'left', distance: relativeX },
      { type: 'right', distance: this.tileSize - relativeX }
    ];
    
    const closestEdge = edges.reduce((min, edge) => 
      edge.distance < min.distance ? edge : min
    );
    
    return {
      tile,
      edgeType: closestEdge.type,
      distance: closestEdge.distance
    };
  },

  /**
   * Highlight the nearest edge to a pointer position
   * @param {Object} pointer Pointer coordinates {x, y}
   * @param {Object} opts Options for highlight appearance
   * @returns {Object|null} The created highlight object or null if invalid
   */
  highlightNearestEdge(pointer, opts = {}) {
    const edgeInfo = this.findNearestEdge(pointer);
    if (!edgeInfo) {
      return null;
    }

    return this.createEdgeHighlight(edgeInfo, opts);
  },

  /**
   * Remove edge highlights from the canvas
   */
  removeEdgeHighlights() {
    const highlights = this.getObjects('edgeHighlight');

    highlights.forEach(highlight => {
      this.remove(highlight);
    });

    this.renderAll();
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
    return this.matrix
      [Math.floor( x / this.tileSize )]
      [Math.floor( y / this.tileSize )];
  },
  
  getTilesAdjacentTo(tile, { diagonal = false, type = 'all' } = {}) {
    const adjacentOffsets = [ [0, 1], [0, -1], [1, 0], [-1, 0] ],
          diagonalOffsets = [ [1, 1], [-1, -1], [1, -1], [-1, 1] ];
    
    let offsets = diagonal ? diagonalOffsets : adjacentOffsets;
    
    return offsets
      .map(([x,y]) => {
        const targetTile = this.matrix[tile.x + x] ? this.matrix[tile.x + x][tile.y + y] : null;
        
        if (!targetTile) return null;

        if (type === 'pathableOnly') {
          if (diagonal) {
            return this._validateDiagonalMovement(tile, targetTile, x, y);
          }
  
          return !this.isEdgeBlocked(tile, targetTile) ? targetTile : null;
        }

        return targetTile;
      })
      .filter(Boolean);
  },
  
  getTilesDiagonalTo(tile, type = 'all') {
    return this.getTilesAdjacentTo(tile, { diagonal: true, type });
  },
  
  /**
   * Generator function that explores tiles around a starting position using breadth-first search
   * Handles edge blocking and ensures enclosed walkers always yield at least their current position
   * 
   * @param {Object} originalTile Starting tile {x, y, cost?}
   * @param {String} type Search type: 'all' for any tile, 'pathableOnly' for pathable tiles only
   * @yields {Object} {tilesCosts: Map, visitedTiles: Array} Current search state
   */
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
          this.getTilesAdjacentTo(currentTile, { type })
            .forEach(frontier.add, frontier);
          
          diagonalTiles.push( ...this.getTilesDiagonalTo(currentTile, type) );
          
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

    if (visitedTiles.size === 0) {
      visitedTiles.add(originalTile);
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
  
  /**
   * Check if a tile or edge is pathable.
   *
   * @param {Tile|Edge} location 
   * @returns {Boolean}
   */
  isPathable(location) {
    return location.isPathable();
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
    
    this.edges = new Map();
    
    // Create horizontal edges (between tiles vertically)
    for(let x = 0; x < this.size.x; x++) {
      for(let y = 0; y <= this.size.y; y++) {
        const edgeKey = `${x},${y}_N`;
        this.edges.set(edgeKey, new Edge(x, y, 'horizontal'));
      }
    }
    
    // Create vertical edges (between tiles horizontally)  
    for(let x = 0; x <= this.size.x; x++) {
      for(let y = 0; y < this.size.y; y++) {
        const edgeKey = `${x},${y}_W`;
        this.edges.set(edgeKey, new Edge(x, y, 'vertical'));
      }
    }
  },
  
  /**
   * Get edge between two adjacent tiles
   * Returns the same edge regardless of movement direction (A→B vs B→A)
   * Uses consistent coordinate mapping: larger Y for vertical edges, larger X for horizontal edges
   * 
   * @param {Object} tile1 First tile {x, y}
   * @param {Object} tile2 Second tile {x, y}
   * @return {Edge|null} Edge object or null if not adjacent
   */
  getEdgeBetween(tile1, tile2) {
    const dx = tile2.x - tile1.x;
    const dy = tile2.y - tile1.y;
    
    // Check if tiles are adjacent
    if (Math.abs(dx) + Math.abs(dy) !== 1) {
      return null;
    }
    
    // Bounds checking
    if (tile1.x < 0 || tile1.y < 0 || tile2.x < 0 || tile2.y < 0 ||
        tile1.x >= this.size.x || tile1.y >= this.size.y ||
        tile2.x >= this.size.x || tile2.y >= this.size.y) {
      return null;
    }
    
    let edgeKey;
    
    if (dx === 0) {
      // Vertical movement (north/south)
      // Use the larger Y coordinate (southern tile's north edge) for direction-independent lookup
      const edgeY = Math.max(tile1.y, tile2.y);
      edgeKey = `${tile1.x},${edgeY}_N`;
    } else {
      // Horizontal movement (east/west)  
      // Use the larger X coordinate (eastern tile's west edge) for direction-independent lookup
      const edgeX = Math.max(tile1.x, tile2.x);
      edgeKey = `${edgeX},${tile1.y}_W`;
    }
    
    return this.edges.get(edgeKey) || null;
  },
  
  /**
   * Get all edges adjacent to a tile
   * @param {Object} tile Tile object {x, y}
   * @return {Array} Array of edge objects with direction info
   */
  getEdgesOfTile(tile) {
    const edgeConfigs = [
      { key: `${tile.x},${tile.y}_N`, direction: 'N' },        // North edge of this tile
      { key: `${tile.x},${tile.y + 1}_N`, direction: 'S' },    // North edge of tile below (= south edge of this tile)
      { key: `${tile.x},${tile.y}_W`, direction: 'W' },        // West edge of this tile  
      { key: `${tile.x + 1},${tile.y}_W`, direction: 'E' }     // West edge of tile to right (= east edge of this tile)
    ];

    return edgeConfigs
      .map(({ key, direction }) => {
        const edge = this.edges.get(key);
        return edge ? { edge, direction } : null;
      })
      .filter(Boolean);
  },
  
  /**
   * Check if an edge is blocked by covers
   * @param {Object} fromTile Source tile {x, y}
   * @param {Object} toTile Target tile {x, y}
   * @return {Boolean} Whether the edge is blocked
   */
  isEdgeBlocked(fromTile, toTile) {
    const edge = this.getEdgeBetween(fromTile, toTile);
    return edge ? !edge.isPathable() : false;
  },

  /**
   * Validate diagonal movement with bi-directional checking to ensure symmetry.
   * 
   * Diagonal movement is challenging because the grid only has orthogonal edges (N/E/S/W),
   * not diagonal ones. To move diagonally, a character must traverse through a "corner" 
   * formed by two orthogonal edges. This method prevents "corner cutting" by ensuring
   * both orthogonal paths are clear in both directions.
   * 
   * For example, to move NE diagonally, we check:
   * - Forward: Can move North AND East from source
   * - Reverse: Can move South AND West from destination
   * 
   * Movement is only allowed if both directions are valid, ensuring symmetric pathfinding.
   * 
   * @param {Object} fromTile Source tile {x, y}
   * @param {Object} toTile Target tile {x, y}
   * @param {Number} deltaX X offset (-1, 0, 1)
   * @param {Number} deltaY Y offset (-1, 0, 1)
   * @return {Object|null} Target tile if movement allowed, null if blocked
   */
  _validateDiagonalMovement(fromTile, toTile, deltaX, deltaY) {
    const orthogonalPaths = this._getOrthogonalPaths(fromTile, deltaX, deltaY);
    
    if (!this._arePositionsInBounds([...orthogonalPaths, toTile])) {
      return null;
    }
    
    const forwardAllowed = this._canMoveViaBothPaths(fromTile, orthogonalPaths);
    const reverseAllowed = this._canMoveViaBothPaths(toTile, orthogonalPaths);
    
    return forwardAllowed && reverseAllowed ? toTile : null;
  },

  /**
   * Get the two orthogonal intermediate positions for diagonal movement
   * @param {Object} fromTile Source tile {x, y}
   * @param {Number} deltaX X offset (-1, 0, 1)
   * @param {Number} deltaY Y offset (-1, 0, 1)
   * @return {Array} Array of two intermediate positions
   * @private
   */
  _getOrthogonalPaths(fromTile, deltaX, deltaY) {
    return [
      { x: fromTile.x + deltaX, y: fromTile.y },  // Horizontal path
      { x: fromTile.x, y: fromTile.y + deltaY }   // Vertical path
    ];
  },

  /**
   * Check if movement is possible via both orthogonal paths
   * @param {Object} fromTile Source tile {x, y}
   * @param {Array} paths Array of two intermediate positions
   * @return {Boolean} True if both paths are clear
   * @private
   */
  _canMoveViaBothPaths(fromTile, paths) {
    return paths.every(path => !this.isEdgeBlocked(fromTile, path));
  },

  /**
   * Check if all positions are within grid bounds
   * @param {Array} positions Array of tile positions {x, y}
   * @return {Boolean} True if all positions are valid
   * @private
   */
  _arePositionsInBounds(positions) {
    return positions.every(pos => 
      this.matrix[pos.x] && this.matrix[pos.x][pos.y]
    );
  },
  
  _resizeToFullScreen() {
    this.setHeight(window.innerHeight);
    this.setWidth(window.innerWidth);
    
    this.renderAll()
  }

});

export default World;