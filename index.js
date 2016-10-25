var canvas = new fabric.Canvas('c', {
  selection: false,
  stopContextMenu: true
});
var tileSize = 50;
var objectsList = function() {};
objectsList.prototype = new Array;
objectsList.prototype.add = function() {
  var objs = Array.prototype.slice.call(arguments);
  objs.forEach((obj) => {
    obj.gridPosition = getTileFromCoordinates(obj.left, obj.top)
  });

  this.push.apply(this, objs);
}

var activeObjects = new objectsList;

// create grid

for (var i = 0; i < (600 / tileSize); i++) {
  canvas.add(new fabric.Line([i * tileSize, 0, i * tileSize, 600], {
    stroke: '#ccc',
    selectable: false
  }));
  canvas.add(new fabric.Line([0, i * tileSize, 600, i * tileSize], {
    stroke: '#ccc',
    selectable: false
  }))
}

// add objects
var cover = new fabric.Rect({
  left: 100,
  top: 100,
  width: 50,
  height: 50,
  fill: '#faa',
  originX: 'left',
  originY: 'top',
  centeredRotation: true,
  selectable: false,
  type: 'cover',
  attributes: {
    unpathable: true
  }
});

canvas.add(cover);

var pg = new fabric.Circle({
  left: 200,
  top: 200,
  radius: 25,
  fill: '#f1cc16',
  originX: 'left',
  originY: 'top',
  centeredRotation: true,
  hasControls: false,
  attributes: {
    movement: 3,
    name: 'Paperino'
  },
  allowedLeft: 200,
  allowedTop: 200
});

canvas.add(pg);

activeObjects.add(pg, cover);
console.log(activeObjects);

pg.isAdjacentToObject = function(obj) {
  return calculateOctileDistance(this.gridPosition, obj.gridPosition) === 1;
}

pg.updateCoordinates = function() {
  return this.gridPosition = getTileFromCoordinates(this.left, this.top);
}

pg.on('modified', function() {
  this.updateCoordinates();

  var covers = activeObjects.filter((obj) => obj.type === 'cover');

  var inCover = covers.some((cover) => this.isAdjacentToObject(cover));

  if (inCover)
    this.set('fill', '#43de5d');
  else
    this.set('fill', '#f1cc16');
});

pg.on('selected', function(e) {
  var selectedTile = getTileFromCoordinates(this.get('left'), this.get('top'));
  console.log(selectedTile, this)
  var inMovementRange = findRange(selectedTile, this.attributes.movement, 1);
  var inDashingRange = findRange(selectedTile, this.attributes.movement * 2, this.attributes.movement + 1)
  var movementTiles = highlightTiles(inMovementRange, {
    highlightType: 'pathableOnly'
  });
  var dashingTiles = highlightTiles(inDashingRange, {
    color: '#ffff00',
    highlightType: 'pathableOnly'
  })

  this.attributes.highlightedTiles = [movementTiles, dashingTiles];
});

pg.on('deselected', function() {
  let highlightedTiles = this.attributes.highlightedTiles;

  canvas.getObjects('highlight').forEach(function(o) {
    canvas.remove(o);
  });
  canvas.renderAll();
  console.log(canvas.getObjects().length);
});
// snap to grid

canvas.on('object:moving', function(options) {
  var targetTile = getTileFromCoordinates(
    Math.round(options.target.left / tileSize) * tileSize,
    Math.round(options.target.top / tileSize) * tileSize
  );

  if (isPathable(targetTile)) {
    this.allowedLeft = Math.round(options.target.left / tileSize) * tileSize;
    this.allowedTop = Math.round(options.target.top / tileSize) * tileSize
  }

  options.target.set({
    left: this.allowedLeft,
    top: this.allowedTop
  });

  //canvas.forEachObject(function(obj) {
  //options.target.setCoords();
  //if (obj === options.target) return;
  //if (options.target.intersectsWithObject(obj) && obj.isCover)
  //obj.setOpacity(0.5);
  //else
  //obj.setOpacity(1);
  //});
});

canvas.on('mouse:down', function(opts) {
  if (!opts.e.shiftKey)
    return;

  canvas.discardActiveObject();
  var target = canvas.findTarget(opts.e);
  var boundingRect = opts.e.target.getBoundingClientRect();
  var ruler = new fabric.Line(
    [
      opts.e.x - boundingRect.left,
      opts.e.y - boundingRect.top,
      opts.e.x - boundingRect.left,
      opts.e.y - boundingRect.top
    ], {
      stroke: '#000',
      strokeWidth: 5,
      type: 'ruler'
    });

  ruler.calculateLength = function() {
    return Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2));
  }

  ruler.calculateManhattan = function() {
    var tileStart = getTileFromCoordinates(this.x1, this.y1);
    var tileEnd = getTileFromCoordinates(this.x2, this.y2);

    console.log(tileStart, tileEnd);

    return Math.abs(tileEnd.x - tileStart.x) + Math.abs(tileEnd.y - tileStart.y);
  }

  ruler.calculateOctileDistance = function() {
    var tileStart = getTileFromCoordinates(this.x1, this.y1);
    var tileEnd = getTileFromCoordinates(this.x2, this.y2);
    var xDiff = Math.abs(tileEnd.x - tileStart.x);
    var yDiff = Math.abs(tileEnd.y - tileStart.y);

    return Math.ceil(0.5 * Math.min(xDiff, yDiff) + 1 * Math.max(xDiff, yDiff));
  }

  canvas.add(ruler);

  if (target) {
    target.lockMovementX = true;
    target.lockMovementY = true;
  }
  ruler.lockedTarget = target;

  canvas.activeRuler = ruler;
});

canvas.on('mouse:move', function(opts) {
  if (!opts.e.which || !opts.e.shiftKey)
    return;

  canvas.discardActiveObject(opts.e);
  var pointer = canvas.getPointer(opts.e);
  var length, label;
  canvas.activeRuler.set('x2', pointer.x);
  canvas.activeRuler.set('y2', pointer.y);
  length = canvas.activeRuler.calculateOctileDistance();
  label = new fabric.Text(length.toString(), {
    left: pointer.x + 10,
    top: pointer.y + 10,
    fontSize: 12
  });

  if (canvas.activeRuler.label)
    canvas.remove(canvas.activeRuler.label);

  canvas.activeRuler.label = label;
  canvas.add(label);

  var covers = canvas.getObjects('cover');

  covers.forEach((cover) => {
    cover.covers.forEach((line, i) => {
      let intersection = new fabric.Intersection.intersectLineLine({
        x: line.plane.x1,
        y: line.plane.y1
      }, {
        x: line.plane.x2,
        y: line.plane.y2
      }, {
        x: canvas.activeRuler.x1,
        y: canvas.activeRuler.y1
      }, {
        x: canvas.activeRuler.x2,
        y: canvas.activeRuler.y2
      });

      if (intersection.status === 'Intersection')
        cover.covers[i].side.set('visible', true);
      else {
        cover.covers[i].side.set('visible', false);
      }
    });
  });

  canvas.renderAll();
});

canvas.on('mouse:up', function(opts) {
  if (!canvas.activeRuler)
    return;

  if (canvas.activeRuler.lockedTarget) {
    canvas.activeRuler.lockedTarget.lockMovementX = false;
    canvas.activeRuler.lockedTarget.lockMovementY = false;
  }
  canvas.activeRuler.label.remove();
  canvas.activeRuler.remove();
});

function getCoordinatesOfTile(tile) {
  // If an array is passed instead of an object,
  // convert the coordinates to object notation.
  if (tile.x === undefined)
    tile.x = tile[0];
  if (tile.y === undefined)
    tile.y = tile[1];

  // Coordinates are ordered according to the usual CSS order
  var coordinates = {
    topLeft: [tile.x * tileSize, tile.y * tileSize],
    topRight: [tile.x * tileSize + tileSize, tile.y * tileSize],
    bottomRight: [tile.x * tileSize + tileSize, tile.y * tileSize + tileSize],
    bottomLeft: [tile.x * tileSize, tile.y * tileSize + tileSize]
  };

  return coordinates;
}

function getTileFromCoordinates(x, y) {
  var tile = {};
  tile.x = Math.floor(x / tileSize);
  tile.y = Math.floor(y / tileSize);
  return tile;
}

function findRange(tile, range, min) {
  var min = min || 0;
  var tiles = [];
  var rows = 12;
  var cols = 12;
  for (row = 0; row < rows; row++) {
    for (col = 0; col < cols; col++) {
      let diff = Math.abs(row - tile.y) + Math.abs(col - tile.x);
      if (diff <= range && diff >= min)
        tiles.push({
          x: col,
          y: row
        });
    }
  }
  return tiles;
}

function highlightTiles(tiles, opts = {}) {
  var opts = fabric.util.object.extend({
    color: '#0000ff',
    highlightType: 'all'
  }, opts);
  var highlightedTiles = [];
  tiles.forEach(function(tile) {
    if (opts.highlightType === 'pathableOnly') {
      if (!isPathable(tile))
        return;
    }
    var coo = getCoordinatesOfTile(tile);
    var newTile = new fabric.Rect({
      left: coo.topLeft[0],
      top: coo.topLeft[1],
      width: tileSize,
      height: tileSize,
      fill: opts.color,
      opacity: 0.1,
      originX: 'left',
      originY: 'top',
      centeredRotation: true,
      selectable: false,
    });
    highlightedTiles.push(newTile);
  });

  var group = new fabric.Group(highlightedTiles, {
    selectable: false,
    hasControls: false,
    type: 'highlight'
  });
  canvas.add(group);
  group.sendBackwards();

  return group;
}

function calculateOctileDistance(from, to) {
  var xDiff = Math.abs(to.x - from.x);
  var yDiff = Math.abs(to.y - from.y);

  return 0.5 * Math.min(xDiff, yDiff) + 1 * Math.max(xDiff, yDiff);
}

function isPathable(tile) {
  var objectOccupyingTheTile = activeObjects.find((obj) => obj.gridPosition.x === tile.x && obj.gridPosition.y === tile.y);

  return (!objectOccupyingTheTile || !objectOccupyingTheTile.attributes.unpathable) ? true : false;
}

function createCoverLines(cover) {
  let planeOpts = {
    stroke: '#000',
    type: 'coverPlane',
    visible: false,
    parent: cover
  };
  
  let sideOpts = {
    stroke: '#ffff00',
    strokeWidth: 2,
    type: 'coverSide',
    visible: false,
    parent: cover
  };
  
  let coverPlaneTop = new fabric.Line([0, cover.top, canvas.getWidth(), cover.top], planeOpts);
  let coverPlaneLeft = new fabric.Line([cover.left, 0, cover.left, canvas.getHeight()], planeOpts);
  let coverPlaneBottom = new fabric.Line([0, cover.top + cover.height, canvas.getWidth(), cover.top + cover.height], planeOpts);
  let coverPlaneRight = new fabric.Line([cover.left + cover.width, 0, cover.left + cover.width, canvas.getHeight()], planeOpts);
  
  // @todo for nice effect substitute these with shields paths
	let coverSideTop = new fabric.Line([cover.left, cover.top, cover.left + cover.width, cover.top], sideOpts);
  let coverSideLeft = new fabric.Line([cover.left, cover.top, cover.left, cover.top + cover.height], sideOpts);
  let coverSideBottom = new fabric.Line([cover.left, cover.top + cover.height, cover.left + cover.width, cover.top + cover.height], sideOpts);
  let coverSideRight = new fabric.Line([cover.left + cover.width, cover.top, cover.left + cover.width, cover.top + cover.height], sideOpts);
  
  let coverLines = [
  	{ plane: coverPlaneTop, side:  coverSideTop },
    { plane: coverPlaneRight, side:  coverSideRight },
    { plane: coverPlaneBottom, side:  coverSideBottom },
    { plane: coverPlaneLeft, side:  coverSideLeft }
  ];
  
  coverLines.forEach((lines) => {
  	canvas.add(lines.plane);
    canvas.add(lines.side);
  });
  
  cover.covers = coverLines;
}

createCoverLines(cover);
