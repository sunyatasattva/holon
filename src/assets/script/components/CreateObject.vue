<template>
  <div class='create-object-form'>
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
</template>

<script>
import Cover from '../entities/cover';
  
export default {
  name: 'create-object',
  props: ['isAddingObject'],
  methods: {
    addObject(type) {
      let world = this.$root.$children[0].$refs.World.canvas,
          obj;
      
      if(type === 'cover') {
        obj = new Cover({
          width: world.tileSize,
          height: world.tileSize,
          coverType: this.newCoverType
        });
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
