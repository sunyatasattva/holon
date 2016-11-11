const fabric = require('fabric').fabric;
const Entity = require('./entity');
const Line   = require('./line'); 

/**
 * Cover class
 * @class Cover
 * @extends Entity
 * @mixes fabric.Rect.prototype
 */
const Cover = fabric.util.createClass(Entity, fabric.Rect.prototype, {

  /**
   * Type of an object.
   *
   * @type {String}
   * @default
   */
  type: 'cover',

  /**
   * Type of the cover.
   *
   * @type {String} ['full','partial']
   * @default
   */
  coverType: 'full',
  
  // @todo ? Currently we don't want cover rotating, it's a bit
  // hard to calculate and we probably don't need it.
  hasRotatingPoint: false,
  includeDefaultValues: false,

  /**
   * When set to `false`, an object can not be selected for 
   * modification (using either point-click-based or group-based
   * selection). But events still fire on it.
   *
   * @type {Boolean}
   * @default
   */
  selectable: false,
  
  strokeWidth: 0,
  
  /**
   * If other objects can move through this object.
   *
   * @type {Boolean}
   * @default
   */
  pathable: false,

  /**
   * Constructor
   * @param {Object} [options] Options object
   * @return {Cover} thisArg
   */
  initialize: function(options = {}) {
    this.callSuper('initialize', options);

    this.set('fill', 
             this.coverType === 'full' ? 
             this._coverOpts.fullFill :
             this._coverOpts.partialFill
            );
    
    this.set('opacity', this.pathable ? 0.5 : 1);
    this.on('added', () => {
      // @todo removing this for now, as it probably does not
      // serve any real purpose... too bad a lot of work wasted.
      // this._createCoverLines();
    });
  },
  
  toObject: function(props = []) {
    props = props.concat([
      'coverType',
      'pathable'
    ]);
    
    return this.callSuper('toObject', props);
  },
  
  _coverOpts: {
    partialFill: '#f1cc16',
    fullFill: '#ff6868'
  },
  
  
  // @deprecated
  _coverPlaneOpts: {
    stroke: '#000',
    type: 'coverPlane',
    visible: false,
    parent: this
  },
  
  // @deprecated
  _coverSideOpts: {
    stroke: '#ffff00',
    strokeWidth: 2,
    type: 'coverSide',
    visible: false,
    parent: this
  },
  
  // @todo maybe group these with each other and cover
  // tried to do it but ruler lags
  // @deprecated
  _createCoverLines(options) {
    let coverPlaneTop,
        coverPlaneRight,
        coverPlaneBottom,
        coverPlaneLeft,
        coverSideTop,
        coverSideRight,
        coverSideBottom,
        coverSideLeft;
        
    coverPlaneTop = new Line(
      [0, this.top, this.canvas.getWidth(), this.top],
      this._coverPlaneOpts
    );

    coverPlaneLeft = new Line(
      [this.left, 0, this.left, this.canvas.getHeight()],
      this._coverPlaneOpts
    );

    coverPlaneBottom = new Line(
      [0, this.top + this.height, this.canvas.getWidth(),
      this.top + this.height], this._coverPlaneOpts
    );

    coverPlaneRight = new Line(
      [this.left + this.width, 0,
       this.left + this.width, this.canvas.getHeight()],
      this._coverPlaneOpts
    );

    // @todo for nice effect substitute these with shields paths
    coverSideTop = new Line(
      [this.left, this.top, this.left + this.width, this.top],
      this._coverSideOpts
    );

    coverSideLeft = new Line(
      [this.left, this.top, this.left, this.top + this.height], 
      this._coverSideOpts
    );

    coverSideBottom = new Line(
      [this.left, this.top + this.height,
       this.left + this.width, this.top + this.height],
      this._coverSideOpts
    );

    coverSideRight = new Line(
      [this.left + this.width, this.top,
       this.left + this.width, this.top + this.height],
      this._coverSideOpts
    );

    let coverLines = [
      { plane: coverPlaneTop, side:  coverSideTop },
      { plane: coverPlaneRight, side:  coverSideRight },
      { plane: coverPlaneBottom, side:  coverSideBottom },
      { plane: coverPlaneLeft, side:  coverSideLeft }
    ];

    coverLines.forEach((lines) => {
      this.canvas.add(lines.plane);
      this.canvas.add(lines.side);
    });

    this.covers = coverLines;
  }
});

Cover.fromObject = function(object) {
  return new Cover(object);
}

fabric.Cover = Cover;

module.exports = Cover;