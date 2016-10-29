<template>
  <div id='Game' ref='main' v-md-theme="'default'">
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
    <md-button 
       @click="toggleEditMode"
       class="md-fab md-mini md-fab-bottom-left md-primary">
      <md-icon>edit</md-icon>
      <md-tooltip md-direction="top">Toggle edit mode</md-tooltip>
    </md-button>
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
    },
    toggleEditMode() {
      this.$refs.sidebar.toggle();
    },
    toggleOption(option, val) {
      if(val)
        this.options[option] = val;
      else
        this.options[option] = !this.options[option];
      
      return this.options[option];
    }
  }
}
</script>
