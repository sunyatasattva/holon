export default {
  calculateChanceToHit(source, target) {
    let mod = 0,
        targetCover = this.isTargetInCoverRelativeToSource(
          source, target);
    
    mod += !targetCover ? 0 : targetCover === 1 ? -20 : -40;
    
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
  }
}