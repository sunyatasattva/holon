class Tile {
  constructor(x, y, { pathable = true, costMultiplier = 1 } = {}) {
    this._children = new Set();
    
    this.x = x;
    this.y = y;
    
    this.pathable = pathable;
    this.costMultiplier = costMultiplier;
  }
  
  getChildren() {
    return Array.from( this._children.values() );
  }
  
  addChild(el) {
    this._children.add(el);
    
    return this;
  }
  
  removeChild(el) {
    this._children.delete(el);
  }
  
  isOccupied() {
    return this._children.size;
  }
  
  isOccupiedBy(el) {
    return this._children.has(el);
  }
}

module.exports = Tile;