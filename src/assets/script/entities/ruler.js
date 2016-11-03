const fabric = require('fabric').fabric;
const Line   = require('./line'); 

/**
 * Ruler class
 * @class Ruler
 * @extends Line
 */
const Ruler = fabric.util.createClass(Line, {

  /**
   * Type of an object.
   *
   * @type {String}
   * @default
   */
  type: 'ruler',
  
  label: null,
  
  rulerKey: 'shiftKey',
  showLabel: true,

  stroke: '#000',
  strokeWidth: 5,

  /**
   * Constructor
   * @param {Array} [points] Array of points
   * @param {Object} [options] Options object
   * @return {Line} thisArg
   */
  initialize: function(points, options = {}) {
    this.callSuper('initialize', points, options);

    this.on('added', () => {
      this._onObjectAdded();
    });
    
    this.on('modified', () => {
      this._updateGridPosition();
    });
  },
  
  calculateLength() {
    return Math.sqrt(
             Math.pow(this.x2 - this.x1, 2)
             + Math.pow(this.y2 - this.y1, 2)
    );
  },
  
  calculateManhattanLength() {
    return this.canvas.calculateManhattanDistance(
      this.gridPosition.start,
      this.gridPosition.end
    );
  },
  
  calculateOctileLength() {
    return this.canvas.calculateOctileDistance(
      this.gridPosition.start,
      this.gridPosition.end,
      'ceil'
    );
  },
  
  highlightCovers() {
    let covers = this.canvas.getObjects('cover');
    
    covers.forEach((cover) => {
      cover.covers.forEach((line, i) => {
        let intersection = line.plane.intersectsWithLine(this)

        if (intersection.status === 'Intersection')
          cover.covers[i].side.set('visible', true);
        else {
          cover.covers[i].side.set('visible', false);
        }
      });
    });
    
    this.canvas.renderAll();
  },
  
  _deselectAndLockActiveObject(e) {
    let target = this.canvas.findTarget(e);
    
    this.canvas.discardActiveObject();
    
    if(target) {
      target.lockMovementX = true;
      target.lockMovementY = true;
    }
    
    this.lockedTarget = target;
  },
  
  _onObjectAdded() {
    let boundingRect = this.canvas.wrapperEl.getBoundingClientRect();

    this._deselectAndLockActiveObject(this.e);

    this.set({
      x1: this.x1 - boundingRect.left,
      y1: this.y1 - boundingRect.top,
      x2: this.x1 - boundingRect.left,
      y2: this.y1 - boundingRect.top
    });
    
    this._updateGridPosition();

    this.canvas.activeRuler = this;
  },
  
  _removeAndUnlock() {
    this._unlockLockedTarget();
    this._unHighlightAllCoverLines();
    this.label.remove();
    this.canvas.activeRuler = null;
    this.remove();
  },
  
  _unHighlightAllCoverLines() {
    this.canvas.getObjects('coverSide').forEach((o) => {
      o.set('visible', false);
    });
  },
  
  _unlockLockedTarget() {
    if (this.lockedTarget) {
      this.lockedTarget.lockMovementX = false;
      this.lockedTarget.lockMovementY = false;
    }
  },
  
  _updateGridPosition() {
    let tileStart = this.canvas.getTileFromCoordinates(this.x1, this.y1),
        tileEnd = this.canvas.getTileFromCoordinates(this.x2, this.y2);
    
    return this.gridPosition = {
      start: tileStart,
      end:   tileEnd
    }
  },
  
  _update(e) {
    this._updateCoords(e);
    this._updateLabel();
    this.highlightCovers();
    
    return this;
  },
  
  _updateCoords(e) {
    let pointer = this.canvas.getPointer(e);
    
    this.canvas.discardActiveObject(e);
    
    this
      .set({ x2: pointer.x, y2: pointer.y })
      .fire('modified');
    
    return pointer;
  },
  
  _updateLabel() {
    let length = this.calculateOctileLength();
    
    if(this.label){
      if(+this.label.text === length){
        return this.label.set({
          left: this.x2 + 10,
          top: this.y2 + 10
        });
      } else {
        this.canvas.remove(this.label);
      }
    }
    
    this.label = new fabric.Text(length.toString(), {
      left: this.x2 + 10,
      top: this.y2 + 10,
      fontSize: 12
    });
    
    return this.canvas.add(this.label);
  }
});

module.exports = Ruler;