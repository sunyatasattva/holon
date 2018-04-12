<template>
  <div id='Game' ref='main'>
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
    <md-drawer class="md-right" ref="sidebar" :md-active.sync="editMode">
      <md-tabs md-alignment="fixed">
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
          />
        </md-tab>
        
        <md-tab md-label="Options" md-icon="settings">
          <section class="vision-options">
            <h2>Vision options</h2>
            <md-switch
               class="md-primary"
               v-model="options.showHitChance"
             >
              Show hit chance
            </md-switch>
          </section>
          <section class="turn-options">
            <h2>Turn control options</h2>
            <md-switch
               class="md-primary"
               v-model="options.autoPan"
             >
              Automatically center current character
            </md-switch>
          </section>
          <section class="save-options">
            <h2>Save options</h2>
            <md-switch
               class="md-primary"
               v-model="options.autoSync"
             >
              Automatically syncronize the state
            </md-switch>
            <md-button
             class="md-primary md-raised"
             @click="exportCurrentState"
             >
              <md-icon>file_download</md-icon>
              Export current state
            </md-button>
            <md-field class="state-upload">
              <label>
                Import state
              </label>
              <md-file 
                v-model="options.uploadedState"
                accept="application/json"
                @md-change="importStateFromJSON"
              />
            </md-field>
          </section>
        </md-tab>
      </md-tabs>
    </md-drawer>
    
    <md-button 
       @click="toggleEditMode"
       class="md-fab md-mini md-fab-bottom-left md-primary">
      <md-icon>edit</md-icon>
      <md-tooltip md-direction="top">Toggle edit mode</md-tooltip>
    </md-button>
    
    <turn-controls
      ref="turnControls"
      :autoPan="options.autoPan"
      :characters="activeObjects.filter(x => x.attributes)"
      @play="toggleActedState"
      @select="panToObject" />
  </div>
</template>

<script>
import { fabric } from 'fabric';
import Vue from 'vue';
import World from './components/World.vue';
import ObjectDetails from './components/ObjectDetails.vue';
import CreateObject from './components/CreateObject.vue';
import TurnControls from './components/TurnControls.vue';
import Network from './modules/networking';
  
const db = Network.database();

export default {
  name: 'game',
  components: {
    'game-world': World,
    ObjectDetails,
    CreateObject,
    TurnControls
  },
  data() {
    return {
      activeObjects: [],
      editMode: false,
      selectedObject: false,
      options: {
        autoPan: false,
        autoSync: true,
        isAddingObject: false,
        showHitChance: true,
        uploadedState: null
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
      
      if(save && this.options.autoSync)
        this.saveGame();
    },
    exportCurrentState() {
      let currentState = this.activeObjects
        .map( (o) => o.toObject() ),
          data = `data:application/json;charset=utf-8,${encodeURIComponent( JSON.stringify(currentState) )}`,
          linkElement = document.createElement('a');
      
      linkElement.setAttribute('href', data);
      linkElement.setAttribute('download', `holon-${this.$data._clientID}`);
      linkElement.click();
    },
    importStateFromJSON(fileList) {
      const reader = new FileReader();
      
      reader.onload = (e) => this.loadGame({
        gameObjects: JSON.parse(e.target.result)
      });
      
      reader.readAsText( fileList.item(0) );
    },
    loadGame(state) {
      const world = this.$refs.World.canvas;
      this.removeAllActiveObjects();
      
      try {
        if(!state.gameObjects || !state.gameObjects.length)
          throw "Invalid state object or state object empty";
        
        fabric.util.enlivenObjects(
          state.gameObjects, 
          (objs) => {
            world.addAsActiveObject.apply(
              world,
              [false, ...objs]
            );
          }
        );
        
        console.log("Saved state loaded:", state);
      }
      catch(e) {
        console.error(
          "There was an error loading the game:", 
          e, 
          state
        );
      }
      
      return this;
    },
    panToObject(object) {
      let canvas = this.$refs.World.canvas,
          zoom = canvas.getZoom(),
          canvasHeight = canvas.height,
          canvasWidth = canvas.width;
      
      canvas.absolutePan({
        x: object.left * zoom - canvasWidth / 2,
        y: object.top * zoom - canvasHeight / 2
      });
      
      object.blink();
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
      
      if(this.options.autoSync)
      return this.saveGame();
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
    toggleActedState(character) {
      character.setProp('hasActed', !character.hasActed);
    },
    toggleEditMode() {
      this.$refs.World.toggleEditMode();
      this.editMode = !this.editMode;
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
  
  .md-overlay {
    opacity: 0;
    pointer-events: none;
  }
  
  .md-tabs-content {
    overflow: visible;
  }
  
  .md-tabs.md-alignment-fixed .md-tabs-navigation .md-button {
    min-width: auto;
  }
  
  .turn-controls {
    position: fixed;
    top: 20px;
    right: 20px;
  }
</style>