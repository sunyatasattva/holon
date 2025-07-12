import { fabric } from 'fabric';
import Entity from './entity';
import Line from './line'; 

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
  
  /**
   * Mode of the cover.
   *
   * @type {String} ['block','edge']
   * @default
   */
  coverMode: 'block',
  
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
    // Handle edge mode setup before calling super
    if (options.coverMode === 'edge') {
      this._convertLinePointsToRect(options);
    }
    
    this.callSuper('initialize', options);

    this.set('fill', 
             this.coverType === 'full' ? 
             this._coverOpts.fullFill :
             this._coverOpts.partialFill
            );
    
    this.set('opacity', this.pathable ? 0.5 : 1);
    this.set('strokeWidth', 0);
    
    if (this.coverMode === 'edge')
      this._setupEdgeControls();
  },
  
  toObject: function(props = []) {
    props = props.concat([
      'coverType',
      'pathable',
      'coverMode'
    ]);
    
    return this.callSuper('toObject', props);
  },
  
  _coverOpts: {
    edgeThickness: 12,
    partialFill: '#f1cc16',
    fullFill: '#ff6868'
  },
  
  /**
   * Convert line coordinates to rectangle dimensions
   * @param {Object} options Configuration options
   * @private
   */
  _convertLinePointsToRect: function(options) {
    if (options.points) {
      const [x1, y1, x2, y2] = options.points;
      const isHorizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
      const thickness = this._coverOpts.edgeThickness;
      
      if (isHorizontal) {
        // Horizontal line -> horizontal rectangle
        options.left = Math.min(x1, x2);
        options.top = Math.min(y1, y2) - thickness / 2;
        options.width = Math.abs(x2 - x1);
        options.height = thickness;
      } else {
        // Vertical line -> vertical rectangle
        options.left = Math.min(x1, x2) - thickness / 2;
        options.top = Math.min(y1, y2);
        options.width = thickness;
        options.height = Math.abs(y2 - y1);
      }
      
      // Remove points from options since we're using rect properties now
      delete options.points;
    }
  },
  
  
  /**
   * Set up appropriate resize controls for edge covers
   * @private
   */
  _setupEdgeControls: function() {
    if (this.coverMode !== 'edge') return;
    
    const isHorizontal = this.width > this.height;
    
    // Configure control visibility based on orientation
    this.setControlsVisibility({
      // Always hide corner controls for edge covers
      tl: false,
      tr: false,
      bl: false,
      br: false,
      mtr: false,
      mt: !isHorizontal,
      mb: !isHorizontal,
      ml: isHorizontal,
      mr: isHorizontal
    });
  },
  
  /**
   * Override updateGridCoordinates to handle edge positioning
   * @override
   */
  updateGridCoordinates: function() {
    if (this.coverMode === 'edge') {
      if(this.gridPosition?.length) {
        this.gridPosition.forEach(({ x, y }) => {
          this.canvas.matrix[x][y].removeChild(this);
        });
      }

      if(this.edgePositions?.length) {
        this.edgePositions.forEach(edgeKey => {
          const edge = this.canvas.edges.get(edgeKey);
          if (edge) {
            edge.removeChild(this);
          }
        });
      }

      this.edgePositions = this._getEdgeKeysSpanned();
      this.edgePositions.forEach(edgeKey => {
        const edge = this.canvas.edges.get(edgeKey);
        if (edge) {
          edge.addChild(this);
        }
      });
      
      // Edge covers occupy no tiles
      this.gridPosition = [];
      return this.gridPosition;
    } else {
      return this.callSuper('updateGridCoordinates');
    }
  },
  
  /**
   * Get all edge keys that this cover spans
   * @returns {Array} Array of edge keys
   * @private
   */
  _getEdgeKeysSpanned: function() {
    if (!this.canvas?.edges) return [];
    
    const isHorizontal = this.getWidth() > this.getHeight();
    
    const center = isHorizontal 
      ? { x: this.left, y: this.top + this.getHeight() / 2 }
      : { x: this.left + this.getWidth() / 2, y: this.top };
      
    const end = isHorizontal
      ? { x: this.left + this.getWidth(), y: center.y }
      : { x: center.x, y: this.top + this.getHeight() };
    
    const startTile = this.canvas.getTileFromCoordinates(center.x, center.y);
    const endTile = this.canvas.getTileFromCoordinates(end.x, end.y);
    
    // Generate edge keys based on orientation
    const edgeKeys = [];
    if (isHorizontal) {
      const minX = Math.min(startTile.x, endTile.x);
      const maxX = Math.max(startTile.x, endTile.x);
      
      for (let x = minX; x < maxX; x++) {
        edgeKeys.push(`${x},${startTile.y}_N`);
      }
    } else {
      const minY = Math.min(startTile.y, endTile.y); 
      const maxY = Math.max(startTile.y, endTile.y);
      
      for (let y = minY; y < maxY; y++) {
        edgeKeys.push(`${startTile.x},${y}_W`);
      }
    }

    console.log({edgeKeys});
    
    return edgeKeys;
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

export default Cover;