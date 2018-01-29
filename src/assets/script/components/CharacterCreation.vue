<template>
 <section class="character-creation">
    <md-field>
      <label>Name</label>
      <md-input v-model='name'></md-input>
      <md-chip>{{ characterPoints }}</md-chip>
    </md-field>
    <md-field>
      <label for="team">Team</label>
      <md-select name="team" id="team" v-model="team">
        <md-option value="0">Allies</md-option>
        <md-option value="1">Enemies</md-option>
      </md-select>
    </md-field>
    <section class="stats">
      <section class="characteristics">
        <h3>Characteristics</h3>
        <attribute-input
          icon='favorite'
          label='Resistance'
          type='number'
          :cap='6'
          :cost='20'
          :initial='3'
          :step='5' :model.sync='attributes.resistance' />
        <attribute-input
          icon='brightness_7'
          label='Will'
          type='number'
          :cap='50'
          :cost='1'
          :initial='20'
          :model.sync='attributes.will' />
        <attribute-input 
          icon='gps_fixed'
          label='Aim'
          type='number'
          :cap='40'
          :cost='1'
          :initial='10'
          :model.sync='attributes.aim' />
        <attribute-input
          icon='flash_on'
          label='Reflexes'
          type='number'
          :cap='10'
          :cost='4'
          :model.sync='attributes.reflexes' />
      </section>
      <section class="attributes">
        <h3>Attributes</h3>
        <attribute-input
          icon='directions_run'
          label='Movement'
          type='number'
          :cap='10'
          :cost='10'
          :initial='6'
          :step='5'
          :model.sync='attributes.movement' />
        <attribute-input
          icon='reply_all'
          label='Action'
          type='number'
          :cap='4'
          :cost='60'
          :initial='2'
          :step='1'
          :model.sync='attributes.action' />
        <attribute-input
          icon='visibility'
          label='Vision'
          type='number'
          :cap='20'
          :cost='10'
          :initial='12'
          :step='5'
          :model.sync='attributes.vision' />
        <attribute-input
          icon='security'
          label='Toughness'
          type='number'
          :cap='3'
          :cost='30'
          :step='2'
          :model.sync='attributes.toughness' />
      </section>
    </section>
    <md-button
      v-if='!isAddingObject'
      class='md-raised md-primary'
      :disabled='!name'
      @click='add'>
      <md-icon>person_add</md-icon>
      Add character
    </md-button>
    <md-button
      v-else
      class='md-raised md-warn'
      @click='cancel'>
      Cancel
    </md-button>
  </section>
</template>

<script>
import AttributeInput from './AttributeInput.vue';

export default {
  name: 'character-creation',
  components: {
    AttributeInput
  },
  computed: {
    characterPoints() {
      return Object.values(this.attributes)
        .reduce(
          (sum, curr) => sum + curr.cost,
          0
        );
    }
  },
  data() {
    return {
      attributes: {
        action: {
          cost: 0,
          value: 2
        },
        aim: {
          cost: 0,
          value: 10
        },
        movement: {
          cost: 0,
          value: 6
        },
        reflexes: {
          cost: 0,
          value: 0
        },
        resistance: {
          cost: 0,
          value: 3
        },
        toughness: {
          cost: 0,
          value: 0
        },
        vision: {
          cost: 0,
          value: 12
        },
        will: {
          cost: 0,
          value: 20
        }
      },
      
      name: '',
      team: 0
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
  props: ['isAddingObject']
}
</script>

<style scoped>
  .stats {
    display: flex;
  }
  
  .characteristics {
    margin-right: 25px;
  }
</style>
