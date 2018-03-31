<template>
  <div class='object-details'>
    <div v-if='object && object.attributes'>
      <h2>{{object.attributes.name}}</h2>
      
      <health-bar 
        :health='object.attributes.resistance'
        :wounds='object.attributes.wounds' />
      
      <dl class="attributes">
        <template
          v-for='attribute in $options.mechanics.attributes'
          v-if='attribute.id !== "resources"'>
          <dt
           :class="{ 'is-modified': object.attributes[attribute.id] !== object.baseAttributes[attribute.id] }"
         >
          <md-icon class="md-primary">{{ attribute.icon }}</md-icon>
          <span>{{ attribute.name }}</span>
          </dt>

          <dd>
            {{ object.attributes[attribute.id] }}
          </dd>
        </template>
      </dl>
      
      <section class="equipment" v-if="object.equipment">
        <section class="armor">
          <div v-if="object.equipment.armor">
            <h4 class="armor-type">
              <md-icon>accessibility</md-icon>
              {{ object.equipment.armor.type }}
            </h4>
            <div class="armor-details">
              <span
               v-for="(value, key) in object.equipment.armor.modifiers"
               >
                <md-icon>
                  {{ $options.mechanics.attributes.find( x => x.id === key ).icon }}
                </md-icon>
                <span class="modifier-value">
                  {{ value }}
                </span>
              </span>
            </div>
          </div>
        </section>
        <section class="weapons">
          <ul v-if="object.equipment.weapons">
            <li
              v-for="weapon in object.equipment.weapons"
              :class="{ 'is-selected': object.equipment.activeWeapon.type === weapon.type }"
              @click="selectWeapon(weapon)"
             >
              <h4 class="weapon-type">{{ weapon.type }}</h4>
              <div class="weapon-modifiers">
                <span
                 v-for="(value, key) in weapon.modifiers"
                 >
                  <md-icon>
                    {{ $options.mechanics.attributes.find( x => x.id === key ).icon }}
                  </md-icon>
                  <span class="modifier-value">
                    {{ value }}
                  </span>
                </span>
              </div>
              <div class="weapon-details">
                <span class="weapon-damage">
                  <md-icon>gps_not_fixed</md-icon>
                  {{ weapon.damage }}
                </span>
                <span class="weapon-critical">
                  <md-icon>new_releases</md-icon>
                  {{ weapon.criticalHitChance }}
                </span>
                <span class="weapon-critical">
                  <md-icon>settings_input_component</md-icon>
                  {{ weapon.ammo }}
                </span>
              </div>
            </li>
          </ul>
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
import pick from 'lodash.pick';
import Vue from 'vue';
  
import Mechanics from '../modules/mechanics.json';

import HealthBar from './HealthBar.vue';
import Network from '../modules/networking';
  
const db = Network.database();
  
export default {
  name: 'object-details',
  props: ['object'],
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
                'Character removed: ',
                characterId
              );
            }
            else {
              console.error('There was an error saving the character', error);
            }
          }
        );
    },
    saveObject() {
      const characterId = this.object.attributes.name.toLowerCase();
      const character = pick(
        this.object,
        [
          'attributes',
          'baseAttributes',
          'equipment'
        ]
      );
      
      this.$firebaseRefs.characters
        .child(characterId)
        .set(
          character,
          (error) => {
            if(!error) {
              this.showSnackbar = true;
              this.snackbarMessage = 'Character saved successfully.';
            
              console.log(
                'Character saved: ',
                characterId,
                character
              );
            }
            else {
              console.error('There was an error saving the character in the database', error);
            }
          }
        );
    },
    selectWeapon(weapon) {
      console.log('Selecting weapon: ', weapon);
      Vue.set(this.object, 'equipment', {
        ...this.object.equipment,
        activeWeapon: weapon
      }); 
    }
  },
  watch: {
    'object.equipment.armor': 'calculateModifiedAttributes',
    'object.equipment.activeWeapon': 'calculateModifiedAttributes'
  },
  mechanics: Mechanics
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
  
  .armor-details,
  .armor-type,
  .weapon-modifiers,
  .weapon-type {
    display: inline-block;
  }
  
  .armor-details,
  .armor-type {
    width: 175px;
  }
  
  .weapon-modifiers,
  .weapon-type {
    width: 165px;
  }
  
  .modifier-value {
    margin-right: 10px;
  }
  
  .weapon-details {
    span {
      display: inline-block;
      margin-right: 10px;
    }
  }
  
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
