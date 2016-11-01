export default {
  calculateChanceToHit(source, target) {
    let mod = 0;
    
    mod += this.isTargetInCoverRelativeToSource(source, target) ?
      -40 : 0;
    
    return source.attributes.aim - target.attributes.reflexes + mod;
  },
  isTargetInCoverRelativeToSource(source, target) {
    let sourceDirection;
    
    if(!target.coveredSides)
      return false;
    else {
      sourceDirection = target.calculateRelativeDirectionTo(source);
      
      return target.coveredSides.some((coverDirection) => {
        return sourceDirection.indexOf(coverDirection) !== -1;
      });
    }
  }
}