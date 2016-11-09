<template>
  <div id='Game' ref='main' v-md-theme="'default'">
    <keep-alive>
      <game-world
        ref='World'
        :activeObjects='activeObjects'
        :options='options'
        v-on:add='addEntities'
        v-on:remove='removeEntity'
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
          <object-details
            :object='selectedObject'
            v-on:wound='addWound'
            v-on:heal='removeWound'
          />
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
import ObjectDetails from './components/ObjectDetails.vue';
import CreateObject from './components/CreateObject.vue';
import Network from './modules/networking';
  
const db = Network.database();

export default {
  name: 'game',
  components: {
    'game-world': World,
    ObjectDetails,
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
    addWound(target) {
      target.setAttribute('wounds', target.attributes.wounds + 1);
    },
    loadGame(state) {
      const world = this.$refs.World.canvas;
      this.removeAllActiveObjects();
      
      try {
        fabric.util.enlivenObjects(
          state.gameObjects, 
          (objs) => {
            world.addAsActiveObject.apply(
              world,
              [false, ...objs]
            );
          }
        );
      }
      catch(e) {
        console.error("There was an error loading the game", 
                      e, state);
      }
      
      console.log("Saved state loaded:", state);
      
      return this;
    },
    removeAllActiveObjects() {
      if(this.activeObjects.length) {
        this.activeObjects.forEach((o) => {
          o.remove();
          this.$refs.World.canvas.remove(o);
        });
        
        this.activeObjects.length = 0;
      }
    },
    removeEntity(obj) {
      let idx = this.activeObjects.indexOf(obj);
      
      this.$refs.World.canvas
        .removeFromActiveObjects(obj);
      
      this.activeObjects.splice(idx, 1);

      console.log('Object removed:', obj);
      
      return this.saveGame();
    },
    removeWound(target) {
      target.setAttribute('wounds', target.attributes.wounds - 1);
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
      this.$refs.World.toggleEditMode();
      this.$refs.sidebar.toggle();
    },
    toggleOption(option, val) {
      if(val)
        this.options[option] = val;
      else
        this.options[option] = !this.options[option];
      
      return this.options[option];
    }
  },
  watch: {
    savedState(state) {
      if(state.clientID === this.$data._clientID)
        return;
      else
        this.loadGame(state);
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