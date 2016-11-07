<template>
  <div id='Game' ref='main' v-md-theme="'default'">
    <keep-alive>
      <game-world
        ref='World'
        :activeObjects='activeObjects'
        :options='options'
        v-on:add='addEntities'
        v-on:select='select'
        v-on:toggle='toggleOption'>
      </game-world>
    </keep-alive>
    <md-sidenav class="md-right" ref="sidebar">
      <md-tabs md-fixed>
        <md-tab md-label="Create" md-icon="add_box">
          <create-object 
            :isAddingObject='options.isAddingObject'
            v-on:add='toggleOption'
            v-on:cancel='toggleOption("isAddingObject")'
          />
        </md-tab>

        <md-tab md-label="Details" md-icon="gps_fixed">
          <template v-if='selectedObject'>
            <h2>Selected object</h2>
            <p>
              {{selectedObject.attributes.name}}
            </p>
          </template>
          <span v-else>No object selected.</span>
        </md-tab>
        
        <md-tab md-label="Options" md-icon="settings">
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt dolorum quas amet cum vitae, omnis! Illum quas voluptatem, expedita iste, dicta ipsum ea veniam dolore in, quod saepe reiciendis nihil.</p>
        </md-tab>
      </md-tabs>
    </md-sidenav>
    
    <md-button 
       @click="toggleEditMode"
       class="md-fab md-mini md-fab-bottom-left md-primary">
      <md-icon>edit</md-icon>
      <md-tooltip md-direction="top">Toggle edit mode</md-tooltip>
    </md-button>
  </div>
</template>

<script>
import { fabric } from 'fabric';
import World from './components/World.vue';
import Sidebar from './components/Sidebar.vue';
import CreateObject from './components/CreateObject.vue';
import Network from './modules/networking';
  
const db = Network.database();

export default {
  name: 'game',
  components: {
    'game-world': World,
    'info-sidebar': Sidebar,
    CreateObject
  },
  data() {
    return {
      activeObjects: [],
      selectedObject: false,
      options: {
        isAddingObject: false
      },
      // @todo maybe generate a better unique ID, 
      // doesn't matter so much
      _clientID: (new Date).getTime()
      }
  },
  firebase: {
    savedState: {
      source: db.ref('savedState'),
      asObject: true
    }
  },
  methods: {
    addEntities(entities, save = true) {
      this.activeObjects.push.apply(this.activeObjects, entities);
      
      if(save)
        this.saveGame();
    },
    saveGame() {
      let savedState = this.$firebaseRefs.savedState,
          objs = this.activeObjects.map( (o) => o.toObject() );
      
      savedState.update({ 
        clientID: this.$data._clientID,
        gameObjects: objs
      });
      
      console.log("State saved:", savedState);
      
      return this;
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

<style>
  #Game {
    overflow: hidden;
    position: relative;
  }
  
  .md-sidenav.md-active .md-backdrop {
    opacity: 0;
    pointer-events: none;
  }
</style>