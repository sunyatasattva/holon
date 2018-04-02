<template>
 <section class="character-creation">
    <md-field>
      <label for="team">Team</label>
      <md-select name="team" id="team" v-model="team">
        <md-option :value="0">Allies</md-option>
        <md-option :value="1">Enemies</md-option>
      </md-select>
    </md-field>
    <md-field>
      <label for="character-load">Load character</label>
      <md-select
        id="character-load"
        v-model="loadedCharacterId"
        @md-selected="loadCharacter">
        <md-option 
          v-for="character of characters"
          :value="character['.key']">
          {{ character.attributes.name }}
        </md-option>
      </md-select>
    </md-field>
    <md-field>
      <label>Name</label>
      <md-input v-model='name'></md-input>
      <md-chip>{{ characterPoints }}</md-chip>
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
    <section class="equipment">
      <section class="weapons">
        <md-field>
          <label for="weapons">Weapons</label>
          <md-select
           id="weapons"
           multiple
           v-model="selectedWeaponsTypes">
            <md-option 
              v-for="weapon in Equipment.weapons"
              :value="weapon.type">
              {{ weapon.type }}
            </md-option>
          </md-select>
          <md-chip v-if="selectedWeapons.length">
            {{ selectedWeapons.reduce((sum, i) => sum + i.cost, 0) }}
          </md-chip>
        </md-field>
      </section>
      <section class="armors">
        <md-field>
          <label for="armors">Armor</label>
          <md-select
           id="armors"
           v-model="selectedArmorType"
           >
            <md-option
             v-for="armor in Equipment.armors"
             :value="armor.type"
             >
              {{ armor.type }}
            </md-option>
          </md-select>
          <md-chip v-if="selectedArmor">
            {{ selectedArmor.cost }}
          </md-chip>
        </md-field>
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
import Network from '../modules/networking';
  
import Equipment from '_equipment';
  
const db = Network.database();

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
    },
    // @fixme this is due to a bug in vue-material
    // can't assign objects to select value
    selectedArmor() {
      let armor = Equipment.armors.find(
        (item) => item.type === this.selectedArmorType
      );
      
      if(armor) {
        this.equipment.armor = armor;
      }
      
      return armor; 
    },
    selectedWeapons() {
      let weapons = Equipment.weapons.filter(
        (item) => this.selectedWeaponsTypes.includes(item.type)
      );
      
      if(weapons.length) {
        this.equipment.weapons = weapons;
        this.equipment.activeWeapon = weapons[0];
      }
      
      return weapons;
    }
  },
  data() {
    return {
      Equipment: Equipment,
      
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
      equipment: {
        armor: null,
        items: [],
        weapons: []
      },
      
      loadedCharacterId: null,
      name: '',
      team: 0,
      
      selectedArmorType: '',
      selectedWeaponsTypes: []
    }
  },
  firebase: {
    characters: db.ref('characters')
  },
  methods: {
    add() {
      this.$emit('add', this.$data);
    },
    cancel() {
      this.$emit('cancel');
    },
    loadCharacter(id) {
      let character = this.characters.find(
        (char) => char['.key'] === id
      );
      
      console.log('Loaded character: ', character);
      
      Object.keys(character.baseAttributes)
        .forEach((attr) => {
          this.attributes[attr].value = character.baseAttributes[attr];
        });
      
      this.selectedArmorType = character.equipment.armor.type;
      this.selectedWeaponsTypes = character.equipment.weapons
        .map(weapon => weapon.type);
      this.name = character.attributes.name;
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
