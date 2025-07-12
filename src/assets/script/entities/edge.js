import Tile from './tile';

/**
 * Edge class - represents tile edges that can contain covers and block movement
 * Follows the same interface as Tile for consistency
 * 
 * @class Edge
 * @extends Tile
 */
class Edge extends Tile {
  /**
   * @param {number} x - X coordinate in grid
   * @param {number} y - Y coordinate in grid  
   * @param {string} orientation - 'horizontal' or 'vertical'
   * @param {object} options - Additional options (pathable, costMultiplier)
   */
  constructor(x, y, orientation, options = {}) {
    super(x, y, options);
    
    /** @type {'horizontal' | 'vertical'} */
    this.orientation = orientation;
  }
  
  /**
   * Get the compass direction this edge blocks movement from
   * @param {object} fromTile - The tile coordinates {x, y} we're moving from
   * @returns {string|null} Compass direction ('N', 'S', 'E', 'W') or null
   */
  getDirectionFrom(fromTile) {
    if (this.orientation === 'horizontal') {
      // Horizontal edges block North/South movement
      if (this.y === fromTile.y) {
        return 'N'; // Moving south across this edge
      } else if (this.y === fromTile.y + 1) {
        return 'S'; // Moving north across this edge
      }
    } else if (this.orientation === 'vertical') {
      // Vertical edges block East/West movement
      if (this.x === fromTile.x) {
        return 'W'; // Moving east across this edge
      } else if (this.x === fromTile.x + 1) {
        return 'E'; // Moving west across this edge
      }
    }
    
    return null;
  }
}

export default Edge;