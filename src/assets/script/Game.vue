<template>
  <div id='Game' ref='main'>
    <keep-alive>
      <game-world
        ref='World'
        :activeObjects='activeObjects'
        v-on:add='addEntities'>
      </game-world>
    </keep-alive>
  </div>
</template>

<script>
import World from './components/World.vue'
  
export default {
  name: 'game',
  components: {
    'game-world': World
  },
  data() {
    return {
      activeObjects: [],
      selectedObject: false
    }
  },
  methods: {
    addEntities(entities) {
      this.activeObjects.push.apply(this.activeObjects, entities);
    }
  }
}
</script>
