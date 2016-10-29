<template>
  <div id='Game' ref='main'>
    <keep-alive>
      <game-world
        ref='World'
        :activeObjects='activeObjects'
        v-on:add='addEntities'
        v-on:select='select'>
      </game-world>
    </keep-alive>
    <info-sidebar
      :activeObjects='activeObjects'
      :selectedObject='selectedObject'>
    </info-sidebar>
  </div>
</template>

<script>
import World from './components/World.vue';
import Sidebar from './components/Sidebar.vue';
  
export default {
  name: 'game',
  components: {
    'game-world': World,
    'info-sidebar': Sidebar
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
    },
    select(object) {
      this.selectedObject = object;
    }
  }
}
</script>
