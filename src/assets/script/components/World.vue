<template>
  <canvas id='c' width='600' height='600'></canvas>
</template>

<script>
import World from '../entities/world';

const component = {
  name: 'game-world',
  props: ['activeObjects', 'options'],
  watch: {
    // @todo implement custom watch for active objects so it can
    // be updated on canvas; useful when integrating network
    activeObjects(activeObjects) {
      this.canvas.activeObjects = activeObjects;
    }
  },
  mounted() {
    const world = new World('c', { activeObjects: this.activeObjects });
    
    this.canvas = world;
    
    world.on('object:addedAsActive', (objects) => {
      this.$emit('add', objects);
    });
    
    world.on('object:selected', (e) => {
      let newObject = e.target,
          oldObject = this.$parent.selectedObject;

      if(oldObject){
        oldObject.fire('deselected');
      }
      
      this.$emit('select', newObject);
    });
    
    world.on('selection:cleared', (e) => {
      this.$emit('select', false);
    });
    
    world.on('mouse:down', (opts) => {
      let addingObject = this.options.isAddingObject,
          e = opts.e,
          p = this.canvas.getPointer(e),
          coords;

      if(!addingObject)
        return;
      else {
        coords = this.canvas.getCoordinatesOfTile(
          this.canvas.getTileFromCoordinates(p.x, p.y)
        );
        
        addingObject.set({
          left: coords.topLeft[0],
          top: coords.topLeft[1]
        });
        
        this.canvas.addAsActiveObject(addingObject);
        
        this.$emit('toggle', 'isAddingObject');
      }
    });
    
    world.on('mouse:over', (e) => {
      let selectedObject = this.canvas.getActiveObject(),
          target = e.target;
      
      if(selectedObject
         && selectedObject.calculateChanceToHit
         && target.targetable 
         && selectedObject !== target){
        target.displayLabel(
          `${selectedObject.calculateChanceToHit(e.target)}%`
        );
      }
    });
    
    world.on('mouse:out', (e) => {
      if(e.target && e.target.currentLabel)
        e.target.removeCurrentLabel();
    });
    
    world.on('mouse:wheel', (opts) => {
      let e = opts.e,
          newZoom = this.canvas.getZoom() + e.deltaY / 300;
      
      e.preventDefault();
      
      if(newZoom > 2 || newZoom < 0.5)
        return;
      
      this.canvas.zoomToPoint(
        { x: e.offsetX, y: e.offsetY }, 
        newZoom
      );

      return false;
    });
    
    world.on('mouse:move', (opts) => {
      let e = opts.e;
      
      if(e.button === 2) {
        this.canvas.relativePan(
          { x: e.movementX, y: e.movementY }
        );
      }
    });
  }
};

export default component
</script>

<style scoped>

</style>
