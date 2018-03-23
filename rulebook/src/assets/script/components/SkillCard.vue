<template>
  <div 
    class="skill-card"
    :class="{ 'is-compact': compact }"
    :id="DOMId">
    <div class="icon-container-inner" v-if="compact">
      <img 
        class="skill-icon"
        :src="`src/assets/images/skills-icons/${skill.icon}.png`"
        :alt="`${skill.name} icon`" />
    </div>
    <card class="skill-card-inner">
      <div slot="header-main">
       <div class="icon-container-inner" v-if="!compact">
         <img 
           class="skill-icon"
           :src="`src/assets/images/skills-icons/${skill.icon}.png`"
           :alt="`${skill.name} icon`" />
       </div>
       
       {{ skill.name }}
        
        <ul class="skill-stats attribute-modifiers">
          <li
           v-if="skill.action >= 0"
           class="modifier tooltip" 
           data-tooltip="Punti azione">
            <i class="material-icons">reply_all</i>
            <span class="modifier-value">{{ skill.action }}</span>
          </li>
          <li
           v-if="skill.cooldown"
           class="modifier tooltip" 
           data-tooltip="Cooldown">
            <i class="material-icons">settings_backup_restore</i>
            <span class="modifier-value">{{ skill.cooldown }}</span>
          </li>
        </ul>
      </div>
      
      <div class="skill-description">
        <p v-html="skill.description"></p>
      </div>
      
      <div
         class="requirements-list"
         v-if="requirements.length"
         slot="footer">
        <dl>
          <dt>Requisiti:</dt>
          <dd>
            <ul class="requirements-list">
              <li 
                v-for="(requirement, idx) in requirements"
                v-if="!( typeof requirement === 'string' &&
                  requirement.includes('talent-') )">
                <a 
                  v-if="typeof requirement === 'string'"
                  :href="`#skills-level-${requirement[1]}`">
                    Qualsiasi abilità di Livello {{ requirement[1] }}
                </a>
                <a 
                  v-else-if="requirement.id"
                  :href="`#skill-${requirement.id}`">
                    {{ requirement.name }}
                </a>
                <span v-else-if="requirement.length">
                  Una qualsiasi tra
                  <ul class="optional-requirements requirements-list">
                    <li v-for="optionalRequirement in requirement">
                      <a 
                        :href="`#skill-${optionalRequirement.id}`">
                        {{ optionalRequirement.name }}
                      </a>
                    </li>
                  </ul>
                </span>
              </li>
            </ul>
          </dd>
        </dl>
      </div>
    </card>
  </div>
</template>

<script>
import { skills } from "../../../../../src/assets/script/modules/skills.json";
  
import Card from "./Card.vue";

export default {
  name: "skill-card",
  components: {
    Card
  },
  props: {
    "compact": {
      type: Boolean,
      required: true
    },
    "skill": {
      type: Object,
      required: true
    }
  },
  computed: {
    DOMId() {
      if(!this.compact)
        return `skill-${this.skill.id}`;
    },
    requirements() {
      return this.skill.requirements
        .map((requirement) => {
          if(
            typeof requirement === "string" 
            && !requirement.includes("*")
            && !requirement.includes("talent")
          )
            return skills.find( skill => skill.id === requirement );
          else if( Array.isArray(requirement) )
            return requirement.map((optionalRequirement) => {
              return skills.find( skill => skill.id === optionalRequirement ); 
            });
          else
            return requirement;
        });
    }
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss">
  @import "../../style/_variables";
  
  .card-footer {
    .skill-card-inner {
      box-shadow: 0 0 10px #000;
      
      footer::after,
      header::before {
          display: none;
      }
    }
  }
  
  .requirements-list {
    display:         inline-block;
    list-style-type: none;
    margin:          0;
    padding:         0;
    
    &:empty {
      display: none;
    }
    
    &.optional-requirements {
      &::before {
        content: "(";
      }
      
      &::after {
        content: ")";
      }
    }
    
    dd,
    dt {
      display: inline-block;
      margin:  0;
    }
    
    dl {
      margin: 0;
    }
    
    li {
      display: inline-block;
      
      &:not(:last-child)::after {
        content: ", ";
        margin:  0 4px 0 -4px;
      }
    }
  }
  
  .skill-card {
    &.is-option,
    &.is-required,
    &.is-selected {
      opacity: 1;
      
      .icon-container-inner {
        transform: scale(1.1);
      }
    }
    
    &.is-compact {
      display: inline-block;
      margin:  2px;
      opacity: 0.8;
      position: relative;
      
      &:hover {
        cursor:  pointer;
        opacity: 1;
        
        .skill-card-inner {
          display: block;
        }
      }
      
      .icon-container-inner::after {
        content:          "";
        mix-blend-mode:   color;
        position:         absolute;
        top:              3px;
        right:            3px;
        bottom:           3px;
        left:             3px;
      }
      
      .skill-card-inner {
        display: none;
        
        position: absolute;
        width: 450px;
        z-index: 400;
      }
    }
  }
  
  .skill-icon {
    transition: all .15s ease-out;
  }
</style>