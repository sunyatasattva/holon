<template>
  <div ref="main" class="off-canvas off-canvas-sidebar-show">
    <nav class="off-canvas-sidebar table-of-contents">
      <img src="src/assets/images/logo.png" alt="Holon RPG" class="logo">
    </nav>
    <div class="off-canvas-content book-content">
      <section class="skill-list" id="skill-list">
        <h1>Abilità</h1>
        <div 
          v-for="(group, i) in $options.skills"
          class="skill-group-compact">
          <h2>Livello {{ i + 1 }}</h2>
          <skill 
            v-for="skill in group"
            :selectedSkill="selectedSkill"
            :skill="skill"
            :compact="true" 
            @click="selectSkill"
          />
        </div>
        <div 
          v-for="(group, i) in $options.skills"
          class="skill-group-compact"
          :id="`skills-level-${i + 1}`">
          <h2>Livello {{ i + 1 }}</h2>
          <skill v-for="skill in group" :skill="skill" />
        </div>
      </section>
      <section class="talent-list" id="talent-list">
        <h1>Talenti</h1>
        <ul>
          <li v-for="talent in $options.talents">
            <card>
              <span slot="header-main" :id="`talent-${talent.id}`">
                <div class="icon-container-inner">
                  <img
                    class="skill-icon"
                    :src="`src/assets/images/skills-icons/${talent.icon}.png`"
                    :alt="`${talent.name} icon`" />
                </div>
                
                <span>{{ talent.name }}</span>
              </span>
              
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt vero ad eius, sed temporibus porro. Sapiente dolore, sequi ad, nam expedita ea ullam labore vitae molestias iure delectus laborum aliquid.</p>
            </card>
            
          </li>
        </ul>
      </section>
      <section class="equipment" id="equipment">
        <h1>Equipaggiamento ed Oggetti</h1>
        <section class="weapons" id="weapon-list">
          <h2>Armi</h2>
          <ul class="weapon-list">
            <li v-for="weapon in $options.equipment.weapons">
              <weapon-card :weapon="weapon" />
            </li>
          </ul>
        </section>
        <section class="armors" id="armor-list">
          <h2>Armature</h2>
          <ul class="armor-list">
            <li v-for="armor in $options.equipment.armors">
              <card>
                <span slot="header-main">
                  {{ armor.type }}

                  <ul class="armor-stats attribute-modifiers">
                    <li 
                     class="modifier tooltip" 
                     data-tooltip="Costo">
                      <i class="material-icons">monetization_on</i>
                      <span class="modifier-value">{{ armor.cost }}</span>
                    </li>
                  </ul>
                </span>

                <p v-if="armor.description" v-html="armor.description"></p>

                <attribute-modifiers 
                  slot="footer"
                  v-if="armor.modifiers"
                  :modifiers="armor.modifiers"
                />
              </card>
            </li>
          </ul>
        </section>
        <section class="items" id="item-list">
          <h2>Oggetti</h2>
          <ul class="item-list" v-for="category in $options.equipment.items">
            <li v-for="item in category">
              <card>
                <span slot="header-main">
                  {{ item.type }}

                  <ul class="armor-stats attribute-modifiers">
                    <li 
                     class="modifier tooltip" 
                     data-tooltip="Costo">
                      <i class="material-icons">monetization_on</i>
                      <span class="modifier-value">{{ item.cost }}</span>
                    </li>
                  </ul>
                </span>

                <p v-if="item.description" v-html="item.description"></p>

                <attribute-modifiers 
                  slot="footer"
                  v-if="item.modifiers"
                  :modifiers="item.modifiers"
                />
              </card>
            </li>
          </ul>
        </section>
      </section>
    </div>
  </div>
</template>

<script>
import groupBy from "lodash.groupby";
import AttributeModifiers from "./components/AttributeModifiers.vue";
import Card from "./components/Card.vue";
import Skill from "./components/Skill.vue";
import WeaponCard from "./components/WeaponCard.vue";

import equipment from "../../../../src/assets/script/modules/equipment.json";
import skills from "../../../../src/assets/script/modules/skills.json";

function parseRequirements(requirements, curr) {
  let nestedRequirements,
      requirementLevel,
      skill;

  requirements.push(curr);

  if(
    typeof curr === "string" 
    && curr.includes("*")
  ) {
    requirementLevel = curr[1] - 1;

    for(requirementLevel; requirementLevel > 0; requirementLevel--) {
      requirements.push(`*${requirementLevel}`)
    }
  }
  else if(typeof curr === "string") {
    skill = skills.skills.find(skill => skill.id === curr);
    
    nestedRequirements = skill.requirements
      .reduce(parseRequirements, []);
    
    requirements = requirements.concat(nestedRequirements);
  }
  else if( Array.isArray(curr) ) {
    curr.forEach((option) => {
      skill = skills.skills.find(skill => skill.id === option);
      
      nestedRequirements = skill.requirements
        .reduce(parseRequirements, []);

      curr = curr.concat(nestedRequirements);
    });
    
    requirements.push(curr);
  }
  
  return requirements;
} 

const groupedSkills = skills.skills
  .reduce((arr, skill) => {
    let requirementsLevel = skill.requirements.length,
        group = arr[requirementsLevel] || [];
    
    group.push(skill);
    arr[requirementsLevel] = group;
    
    return arr;
  }, []);

  console.log(groupedSkills)
  
export default {
  name: "book",
  components: {
    AttributeModifiers,
    Card,
    Skill,
    WeaponCard
  },
  data() {
    return {
      selectedSkill: {}
    }
  },
  
  methods: {
    selectSkill(skill) {
      this.selectedSkill = skill;
      
      this.selectedSkill.requirements = this.selectedSkill.requirements
        .reduce(parseRequirements, []);
    }
  },
  
  equipment: {
    armors: equipment.armors,
    items: groupBy(equipment.items, "category"),
    weapons: equipment.weapons
  },
  skills: groupedSkills,
  talents: skills.talents
}
</script>

<style lang="scss">
  @import "../style/core";
  
  a {
    color: $blue-color;
    opacity: 0.9;
    
    &:hover {
      color: $blue-color;
      border-bottom: 1px solid $blue-color;
      text-decoration: none;
      opacity: 1;
    }
  }
  
  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing:  antialiased;
    background-color:        $dark-color;
    color:                   $gray-color-light;
    font-family:             ProximaNova,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
    text-rendering:          optimizeLegibility;
  }
  
  em {
    color: $yellow-color;
    
    &.minus,
    &.plus,
    &.stat {
      font-style: normal;
    }
    
    &.minus {
      color: $red-color;
    }
    
    &.plus {
      color: $green-color;
    }
    
    &.stat {
      color: $aqua-color;
    }
  }
  
  ul {
    padding: 0;
    margin: $line-height 0;
    list-style-type: none;
    
    ul {
      margin: 0;
      padding: 0;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: $blue-color;
    font-weight: 300;
  }
  
  .armor-list,
  .item-list {
    .card-header-main .attribute-modifiers {
      right: $padding;
    }
  }
  
  .card-header-main {
    .attribute-modifiers {
      color:       $gray-color-light;
      display:     inline-block;
      font-size:   $unit-4;
      margin-left: $padding * 2;
      position:    absolute;
      top:         0;
      right:       $padding * 11;

      .modifier {
        line-height: $line-height * 2;
        height:      $line-height * 2;
      }

      .weapon-damage {
        width: $padding * 4;
      }
    }
  }
  
  .logo {
    width: 150px;
  }
  
  .off-canvas {
    .book-content {
      padding-right: 4rem;
    }
    .table-of-contents {
      background-color: $dark-color-darker;
      padding: $padding;
    }
  }
  
  .skill-group {
    margin: $line-height 0;
  }
  
  .tooltip {
    cursor: help;
  }
</style>