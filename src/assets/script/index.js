const fabric = require('fabric').fabric;
const World  = require('./entities/world');
const Cover  = require('./entities/cover');
const Walker = require('./entities/walker');

var world = new World('c');

// add objects
var cover = new Cover({
  left: 100,
  top: 100,
  width: world.tileSize,
  height: world.tileSize,
  fill: '#faa',
});

world.addAsActiveObject(cover);

var pg = new Walker({
  left: 200,
  top: 200,
  radius: world.tileSize / 2,
  fill: '#f1cc16',
  attributes: {
    movement: 3,
    name: 'Paperino'
  }
});

world.addAsActiveObject(pg);

console.log(world.activeObjects);