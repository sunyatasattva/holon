export default {
  calculateChanceToHit(source, target) {
    let mod;
    
    mod = [
      this._hitModCover,
      this._hitModWounds
    ].reduce((sum, modifier) => {
      return sum + modifier.call(this, source, target);
    }, 0);
    
    return source.attributes.aim - target.attributes.reflexes + mod;
  },
  isTargetInCoverRelativeToSource(source, target) {
    let sourceDirection;
    
    if(!target.coveredSides)
      return false;
    else {
      sourceDirection = target.calculateRelativeDirectionTo(source);
      
      return sourceDirection.split('')
        .map( (direction) => target.coveredSides[direction] )
        .reduce( (p,c) => Math.max(p,c) );
    }
  },
  
  _adjustRelativeDirectionBySideStepping(source, target, direction) {
    // @todo --> if includes "N" see if |y| is within one tile etc.
  },
  
  _hitModCover(source, target) {
    let targetCover = this.isTargetInCoverRelativeToSource(
          source, target);
    
    return !targetCover ? 0 : targetCover === 1 ? -20 : -40;
  },
  _hitModWounds(source) {
    let wounds = source.attributes.wounds;
    
    return wounds ? wounds * -5 : 0;
  }
}