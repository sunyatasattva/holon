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
    // activeObjects(activeObjects) {}
  },
  mounted() {
    const world = new World('c', { activeObjects: this.activeObjects });
    
    world.on('object:addedAsActive', (objects) => {
      this.$emit('add', objects);
    });
    
    this.canvas = world;
  }
};

export default component
</script>

<style scoped>

</style>
