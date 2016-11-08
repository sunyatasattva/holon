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
      <md-input-container>
        <label>Name</label>
        <md-input v-model='newCharacterName'></md-input>
      </md-input-container>
      <section class="characteristics character-creation">
        <h3>Characteristics</h3>
        <md-input-container>
          <label>Resistance</label>
          <md-input type="number"
            v-model='newCharacterResistance'></md-input>
        </md-input-container>
        <md-input-container>
          <label>Will</label>
          <md-input type="number"
            v-model='newCharacterWill'></md-input>
        </md-input-container>
        <md-input-container>
          <label>Aim</label>
          <md-input type="number"
            v-model='newCharacterAim'></md-input>
        </md-input-container>
        <md-input-container>
          <label>Reflexes</label>
          <md-input type="number"
            v-model='newCharacterResistance'></md-input>
        </md-input-container>
      </section>
      <section class="attributes character-creation">
        <h3>Attributes</h3>
        <md-input-container>
          <label>Movement</label>
          <md-input type="number"
            v-model='newCharacterMovement'></md-input>
        </md-input-container>
        <md-input-container>
          <label>Action</label>
          <md-input type="number"
            v-model='newCharacterAction'></md-input>
        </md-input-container>
        <md-input-container>
          <label>Vision</label>
          <md-input type="number"
            v-model='newCharacterVision'></md-input>
        </md-input-container>
        <md-input-container>
          <label>Toughness</label>
          <md-input type="number"
            v-model='newCharacterResistance'></md-input>
        </md-input-container>
      </section>
    </div>
  </div>
</template>

<script>
import Cover from '../entities/cover';
import Walker from '../entities/walker';
  
export default {
  name: 'create-object',
  data() {
    return {
      newCoverType: 'full',
      newCharacterName: '',
      newCharacterResistance: 3,
      newCharacterWill: 20,
      newCharacterAim: 10,
      newCharacterReflexes: 0,
      newCharacterMovement: 6,
      newCharacterAction: 2,
      newCharacterVision: 12,
      newCharacterToughness: 0
    }
  },
  props: ['isAddingObject'],
  methods: {
    addObject(type) {
      let world = this.$root.$children[0].$refs.World.canvas,
          obj;
      
      if(type === 'cover') {
        obj = new Cover({
          width: world.tileSize,
          height: world.tileSize,
          coverType: this.newCoverType,
          selectable: true
        });
      }
      else if(type === 'character'){
        obj = new Walker({
          attributes: {
            name: this.newCharacterName,
            resistance: this.newCharacterResistance,
            will: this.newCharacterWill,
            aim: this.newCharacterAim,
            reflexes: this.newCharacterReflexes,
            movement: this.newCharacterMovement,
            action: this.newCharacterAction,
            vision: this.newCharacterVision,
            toughness: this.newCharacterToughness,
          },
          width: world.tileSize,
          height: world.tileSize,
          radius: world.tileSize / 2
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
