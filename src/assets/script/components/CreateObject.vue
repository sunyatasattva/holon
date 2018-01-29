<template>
  <div class='create-object-form'>
    <div class="addCover">
      <md-button
        v-if='!isAddingObject'
        class='md-raised md-primary'
        @click='addObject("cover")'>
        Add cover
      </md-button>
      <md-button
        v-else
        class='md-raised md-warn'
        @click='cancel'>
        Cancel
      </md-button>
      <md-radio
        v-model="newCoverType"
        id="new-cover-full"
        name="new-cover-type"
        md-value="full">
        Full
      </md-radio>
      <md-radio
        v-model="newCoverType"
        id="new-cover-partial"
        name="new-cover-type"
        md-value="partial">
        Partial
      </md-radio>
      <md-switch 
        v-model="newCoverPathable"
        class="md-primary">
        Pathable
      </md-switch>
    </div>
    <div class="addCharacter">
      <md-button
        v-if='!isAddingObject'
        class='md-raised md-primary'
        @click='addObject("character")'>
        Add character
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
import CharacterCreation from './CharacterCreation.vue';
import Cover from '../entities/cover';
import Walker from '../entities/walker';
  
export default {
  name: 'create-object',
  components: {
    CharacterCreation
  },
  data() {
    return {
      newCoverType: 'full',
      newCoverPathable: false
    }
  },
  props: ['isAddingObject'],
  methods: {
    addObject(type, data) {
      let world = this.$root.$children[0].$refs.World.canvas,
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
      else if(type === 'character'){
        obj = new Walker({
          attributes: {
            name: data.name,
            resistance: data.attributes.resistance.value,
            will: data.attributes.will.value,
            aim: data.attributes.aim.value,
            reflexes: data.attributes.reflexes.value,
            movement: data.attributes.movement.value,
            action: data.attributes.action.value,
            vision: data.attributes.vision.value,
            toughness: data.attributes.toughness.value,
          },
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

<style scoped>
</style>
