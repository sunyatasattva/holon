<template>
  <canvas id='c' width='600' height='600'></canvas>
</template>

<script>
import World from '../entities/world';

const component = {
  name: 'game-world',
  props: ['activeObjects'],
  watch: {
    // @todo implement custom watch for active objects so it can
    // be updated on canvas; useful when integrating network
    activeObjects(activeObjects) {
      this.canvas.activeObjects = activeObjects;
    }
  },
  mounted() {
    const world = new World('c', { activeObjects: this.activeObjects });
    
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
    
    this.canvas = world;
  }
};

export default component
</script>

<style scoped>

</style>
