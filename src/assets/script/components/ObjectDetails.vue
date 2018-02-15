<template>
  <div class='object-details'>
    <div v-if='object && object.attributes'>
      <h2>{{object.attributes.name}}</h2>
      
      <health-bar 
        :health='object.attributes.resistance'
        :wounds='object.attributes.wounds' />
      
      <dl class="attributes">
        <dt :class="{ 'is-modified': object.attributes.resistance !== object.baseAttributes.resistance }">
          <md-icon class="md-primary">favorite</md-icon>
          <span>Resistance</span>
        </dt>
        <dd>
          {{object.attributes.resistance}}
        </dd>
        <dt :class="{ 'is-modified': object.attributes.movement !== object.baseAttributes.movement }">
          <md-icon class="md-primary">directions_run</md-icon>
          <span>Movement</span>
        </dt>
        <dd>
          {{object.attributes.movement}}
        </dd>
        <dt :class="{ 'is-modified': object.attributes.will !== object.baseAttributes.will }">
          <md-icon class="md-primary">brightness_7</md-icon>
          <span>Will</span>
        </dt>
        <dd>
          {{object.attributes.will}}
        </dd>
        <dt :class="{ 'is-modified': object.attributes.action !== object.baseAttributes.action }">
          <md-icon class="md-primary">reply_all</md-icon>
          <span>Action</span>
        </dt>
        <dd>
          {{object.attributes.action}}
        </dd>
        <dt :class="{ 'is-modified': object.attributes.aim !== object.baseAttributes.aim }">
          <md-icon class="md-primary">gps_fixed</md-icon>
          <span>Aim</span>
        </dt>
        <dd>
          {{object.attributes.aim}}
        </dd>
        <dt :class="{ 'is-modified': object.attributes.vision !== object.baseAttributes.vision }">
          <md-icon class="md-primary">visibility</md-icon>
          <span>Vision</span>
        </dt>
        <dd>
          {{object.attributes.vision}}
        </dd>
        <dt :class="{ 'is-modified': object.attributes.reflexes !== object.baseAttributes.reflexes }">
          <md-icon class="md-primary">flash_on</md-icon>
          <span>Reflexes</span>
        </dt>
        <dd>
          {{object.attributes.reflexes}}
        </dd>
        <dt :class="{ 'is-modified': object.attributes.toughness !== object.baseAttributes.toughness }">
          <md-icon class="md-primary">security</md-icon>
          <span>Toughness</span>
        </dt>
        <dd>
          {{object.attributes.toughness}}
        </dd>
      </dl>
      
      <section class="equipment" v-if="object.equipment">
        <section class="weapons">
          <ul v-if="object.equipment.weapons">
            <li
              v-for="weapon in object.equipment.weapons"
              :class="{ 'is-selected': object.equipment.activeWeapon.type === weapon.type }"
              @click="selectWeapon(weapon)"
             >
              <h4 class="weapon-type">{{ weapon.type }}</h4>
              <div class="weapon-details">
                <span class="weapon-damage">{{ weapon.damage }}</span>
              </div>
            </li>
          </ul>
        </section>
        <section class="armor">
          <div v-if="object.equipment.armor">
            <h4 class="armor-type">{{ object.equipment.armor.type }}</h4>
            <div class="armor-details"></div>
          </div>
        </section>
      </section>
      <md-button
       class="md-primary md-raised"
       @click="saveObject">
        <md-icon>save</md-icon>
        Save character
      </md-button>
      <md-button
        class="md-accent md-raised"
        v-if="characters[this.object.attributes.name.toLowerCase()]"
        @click="removeObjectFromDatabase">
        <md-icon>delete</md-icon>
        Delete reference
      </md-button>
    </div>
    <span v-else>No object selected.</span>
    <md-snackbar
     :md-active.sync="showSnackbar"
     >
      <span>
        <md-icon class="md-accent">check</md-icon>
        {{ snackbarMessage }}
      </span>
    </md-snackbar>
  </div>
</template>

<script>
import get from 'lodash.get';
import Vue from 'vue';

import HealthBar from './HealthBar.vue';
import Network from '../modules/networking';
  
const db = Network.database();
  
export default {
  name: 'object-details',
  props: ['activeObjects', 'object'],
  components: {
    HealthBar
  },
  data() {
    return {
      showSnackbar: false,
      snackbarMessage: ''
    }
  },
  firebase: {
    characters: {
      source: db.ref('characters'),
      asObject: true
    }
  },
  methods: {
    calculateModifiedAttributes() {
      if(this.object.calculateModifiedAttributes)
        this.object.calculateModifiedAttributes();
    },
    removeObjectFromDatabase() {
      let characterId = this.object.attributes.name.toLowerCase();
      
      this.$firebaseRefs.characters
        .child(characterId)
        .remove(
          (error) => {
            if(!error) {
              this.showSnackbar = true;
              this.snackbarMessage = 'References to character removed from the database.';
            
              console.log(
                'Character saved: ',
                characterId,
                this.object.attributes
              );
            }
            else {
              console.error('There was an error saving the character', error);
            }
          }
        );
    },
    saveObject() {
      let characterId = this.object.attributes.name.toLowerCase();
      
      this.$firebaseRefs.characters
        .child(characterId)
        .set(
          this.object.attributes,
          (error) => {
            if(!error) {
              this.showSnackbar = true;
              this.snackbarMessage = 'Character saved successfully.';
            
              console.log(
                'Character saved: ',
                characterId,
                this.object.attributes
              );
            }
            else {
              console.error('There was an error removing the character from the database', error);
            }
          }
        );
    },
    selectWeapon(weapon) {
      console.log('Selecting weapon: ', weapon);
      Vue.set(this.object.equipment, 'activeWeapon', weapon);
    }
  },
  watch: {
    'object.equipment.armor': 'calculateModifiedAttributes',
    'object.equipment.activeWeapon': 'calculateModifiedAttributes'
  }
}
</script>

<style scoped lang="scss">
  @import "../../../../node_modules/vue-material/dist/theme/engine";

  @include md-register-theme("default", (
    accent: md-get-palette-color(green, A200)
  ));

  @import "../../../../node_modules/vue-material/dist/components/MdIcon/theme";

  dt, dd {
    display:     inline-block;
    font-weight: normal;
    margin:      5px 0;
  }
  
  dt { 
    width: 145px;
  
    &.is-modified {
      + dd {
        color: md-get-palette-color(blue, A200);
      } 
    }
  }
  
  dd {
    width: 30px;
  }
  
  i { margin-right: 10px; }
  
  .weapon-type {
    margin-top: 0;
  }
  
  .weapons {
    ul {
      list-style-type: none;
      margin:          0;
      padding:         0;
    }
    
    li {
      cursor: pointer;
      opacity: 0.5;
      padding: 10px;
      
      &:hover {
        opacity: 0.75;
      }
      
      &.is-selected {
        background-color: rgba(md-get-palette-color(blue, A200), 0.1);
        opacity: 1;
      }
    }
  }
  
</style>
