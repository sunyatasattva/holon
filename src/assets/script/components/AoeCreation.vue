<template>
  <div class="add-aoe">
    <div class="aoe-options">
      <div class="aoe-basic-details">
        <div class="color-input">
          <span class="aoe-color-label">Color</span>
          <swatches 
            :colors="colors" 
            v-model="color" 
            swatch-size="20" 
            row-length="6" />
        </div>
        <md-switch v-model="isTimed" class="md-primary">Add a timer</md-switch>
      </div>
      <div class="aoe-time-details" v-if="isTimed">
        <md-field class="aoe-duration">
          <md-icon>timer</md-icon>
          <label>Duration</label>
          <md-input v-model="duration" type="number"></md-input>
        </md-field>
        <md-field class="aoe-parent" v-if="characters.length">
          <label for="character-load">Select parent character</label>
          <md-select
            id="character-load"
            v-model="parent">
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
      @click='add'>
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
</template>

<script>
import Swatches from 'vue-swatches';

export default {
  name: 'aoe-creation',
  components: {
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
      color: '#000',
      colors: ['#1ebc9c', '#48a2de', '#a463bf', '#f2c510', '#c0382a', '#000'],
      duration: 1,
      isTimed: false,
      parent: null,
    }
  },
  methods: {
    add() {
      this.$emit('add', this.$data);
    },
    cancel() {
      this.$emit('cancel');
    }
  },
  props: ['characters', 'isAddingObject']
}
</script>

<style scoped>
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
</style>