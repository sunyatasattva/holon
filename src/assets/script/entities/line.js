const fabric = require('fabric').fabric;

/**
 * Line class
 * @class Line
 * @extends fabric.Line
 */
const Line = fabric.util.createClass(fabric.Line, {
  intersectsWithLine(line) {
    let intersection = new fabric.Intersection.intersectLineLine({
      x: this.x1,
      y: this.y1
    }, {
      x: this.x2,
      y: this.y2
    }, {
      x: line.x1,
      y: line.y1
    }, {
      x: line.x2,
      y: line.y2
    });
    
    return intersection;
  }
});

module.exports = Line;