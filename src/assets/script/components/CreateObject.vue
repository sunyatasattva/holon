<template>
  <div class='create-object-form'>
    <md-list>
      <md-list-item md-expand>
        <md-icon>album</md-icon>
        <span class="md-list-item-text">Add area of effect</span>

        <div class="add-cover" slot="md-expand">
          <div class="aoe-options">
            <div class="aoe-basic-details">
              <div class="color-input">
                <span class="aoe-color-label">Color</span>
                <swatches 
                  :colors="newAoEColors" 
                  v-model="newAoEColor" 
                  swatch-size="20" 
                  row-length="6" />
              </div>
              <md-switch v-model="newAoEIsTimed" class="md-primary">Add a timer</md-switch>
            </div>
            <div class="aoe-time-details" v-if="newAoEIsTimed">
              <md-field class="aoe-duration">
                <md-icon>timer</md-icon>
                <label>Duration</label>
                <md-input v-model="newAoELife" type="number"></md-input>
              </md-field>
              <md-field class="aoe-parent" v-if="characters.length">
                <label for="character-load">Select parent character</label>
                <md-select
                  id="character-load"
                  v-model="newAoEParent">
                  <md-option
                    v-for="character of sortedCharacters"
                    :key="character.id"
                    :value="character.id">
                    {{ character.attributes.name }}
                  </md-option>
                </md-select>
              </md-field>
            </div>
            
          </div>
          <md-button
            v-if='!isAddingObject'
            class='md-raised md-primary'
            @click='addObject("aoe")'>
            <md-icon>add_circle_outline</md-icon>
            Add area of effect
          </md-button>
          <md-button
            v-else
            class='md-raised md-warn'
            @click='cancel'>
            Cancel
          </md-button>
        </div>
      </md-list-item>
      <md-list-item md-expand>
        <md-icon>security</md-icon>
        <span class="md-list-item-text">Add cover</span>
        
        <div class="add-cover" slot="md-expand">
          <div class="cover-options">
            <md-radio
              v-model="newCoverType"
              id="new-cover-full"
              value="full">
              Full
            </md-radio>
            <md-radio
              v-model="newCoverType"
              id="new-cover-partial"
              value="partial">
              Partial
            </md-radio>
            <md-switch 
              v-model="newCoverPathable"
              class="md-primary">
              Pathable
            </md-switch>
          </div>
          <md-button
            v-if='!isAddingObject'
            class='md-raised md-primary'
            @click='addObject("cover")'>
            <md-icon>add_circle_outline</md-icon>
            Add cover
          </md-button>
          <md-button
            v-else
            class='md-raised md-warn'
            @click='cancel'>
            Cancel
          </md-button>
        </div>
      </md-list-item>
      <md-list-item md-expand>
        <md-icon>person</md-icon>
        <span class="md-list-item-text">Add character</span>
        
        <div class="add-character" slot="md-expand">
          <character-creation
            :isAddingObject="isAddingObject"
            @add="addObject('character', ...arguments)"
            @cancel="cancel" />
        </div>
      </md-list-item>
    </md-list>
  </div>
</template>

<script>
import Swatches from 'vue-swatches';

import CharacterCreation from './CharacterCreation.vue';

import AreaOfEffect from '../entities/aoe';
import Cover from '../entities/cover';
import Walker from '../entities/walker';
  
import Skills from '_skills';
  
export default {
  name: 'create-object',
  components: {
    CharacterCreation,
    Swatches
  },
  computed: {
    sortedCharacters() {
      return this.characters.sort((a, b) => {
        if(a.attributes.name < b.attributes.name) { return -1; }
        if(a.attributes.name > b.attributes.name) { return 1; }
        return 0;
      });
    }
  },
  data() {
    return {
      newAoEColor: '#000',
      newAoEColors: ['#1ebc9c', '#48a2de', '#a463bf', '#f2c510', '#c0382a', '#000'],
      newAoEIsTimed: false,
      newAoELife: 1,
      newAoEParent: null,
      newCoverType: 'full',
      newCoverPathable: false
    }
  },
  props: ['characters', 'isAddingObject'],
  methods: {
    addObject(type, data) {
      let world = this.$root.$children[0].$refs.World.canvas,
          attrs,
          obj;
      
      if(type === 'cover') {
        obj = new Cover({
          width: world.tileSize,
          height: world.tileSize,
          coverType: this.newCoverType,
          pathable: this.newCoverPathable,
          selectable: true
        });
      }
      else if(type === 'aoe') {
        obj = new AreaOfEffect({
          world,
          color: this.newAoEColor,
          lifeTime: this.newAoELife,
          parentId: this.newAoEParent
        });
      }
      else if(type === 'character'){
        attrs = {
          resistance: data.attributes.resistance.value,
          will: data.attributes.will.value,
          aim: data.attributes.aim.value,
          reflexes: data.attributes.reflexes.value,
          movement: data.attributes.movement.value,
          action: data.attributes.action.value,
          vision: data.attributes.vision.value,
          toughness: data.attributes.toughness.value,

          defense: data.attributes.reflexes.value
        };

        obj = new Walker({
          attributes: {
            ...attrs,
            name: data.name,
            skills: data.skills.map(
              (skill) => {
                return Skills.skills.find( _ => _.id === skill );
              }
            )
          },
          // @fixme I wish I could use computed props on this :(
          // too much tied into FabricJs
          baseAttributes: attrs,
          equipment: { ...data.equipment },
          width: world.tileSize,
          height: world.tileSize,
          radius: world.tileSize / 2,
          team: data.team
        });
      }
      
      this.$emit('add', 'isAddingObject', obj);
    },
    cancel() {
      this.$emit('cancel');
    }
  }
}
</script>

<style>
  .md-button:not(.md-icon-button) {
    margin-left:  0;
    margin-right: 20px;
  }
  
  .md-button.md-raised:not(.md-icon-button) .md-icon {
    margin-right: 5px;
  }
  
  .md-list-item-expand .md-ripple {
    cursor: pointer;
  }
</style>

<style scoped lang="scss">
  .add-character,
  .add-cover {
    padding: 16px;
  }

  .aoe-basic-details,
  .aoe-time-details,
  .color-input {
    align-items: center;
    display:     flex;
  }

  .aoe-duration,
  .color-input {
    margin-right: 5%;
    width:        35%;

    input {
      width: 100%;
    }
  }

  .aoe-parent {
    width: 60%;
  }

  .color-input {
    font-weight:     bold;
    justify-content: space-between;
  }

  .md-tab {
    padding: 0;
  }
  
  .md-list.md-theme-default .md-list-item-container:not(.md-list-item-default):not([disabled]):hover {
    background-color: transparent;
    cursor: auto;
  }
</style>
