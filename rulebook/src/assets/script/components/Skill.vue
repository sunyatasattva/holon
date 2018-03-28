<template>
  <div 
   class="skill" 
   :class="classObject"
   :data-skill-id="skill.id"
   :id="DOMId"
   @click="$emit('click', skill);">
    <div class="icon-container-outer" :class="{ 'col-1': !compact }">
      <div class="icon-container-inner">
        <img 
        class="skill-icon"
        :src="`src/assets/images/skills-icons/${skill.icon}.png`"
        :alt="`${skill.name} icon`" />
      </div>
    </div>
    <div class="skill-description-container" :class="{ 'col-11': !compact }">
      <h3 class="skill-name">{{ skill.name }}</h3>
      <div class="skill-data">
        
      </div>
      <div class="skill-description">
        <p v-html="skill.description"></p>
      </div>
    </div>
  </div>
</template>

<script>
import { skills } from "../../../../rules/skills.json";

export default {
  name: "skill",
  props: {
    "compact": {
      type: Boolean,
      required: true
    },
    "selectedSkill": {
      type: Object,
      required: true
    },
    "skill": {
      type: Object,
      required: true
    }
  },
  computed: {
    classObject() {
      let classes = {
        "is-compact": this.compact,
        "columns": !this.compact,
        "is-selected": this.selectedSkill && this.selectedSkill.id === this.skill.id
      }
      
      if(this.isRequired === "is-option")
        classes["is-option"] = true;
      else if(this.isRequired)
        classes["is-required"] = true;
      
      return classes;
    },
    DOMId() {
      if(!this.compact)
        return `skill-${this.skill.id}`;
    },
    isRequired() {
      if(this.selectedSkill && this.selectedSkill.requirements) 
        return this.selectedSkill.requirements
          .reduce((v, curr) => {
            if(v)
              return v;
            else if(
              typeof curr === "string" 
              && curr.includes("*")
            )
              return this.skill.requirements.length === +curr[1] - 1 ? "is-option" : false;
            else if(typeof curr === "string")
              return this.skill.id === curr;
            else if( Array.isArray(curr) )
              return curr.some( x => x === this.skill.id ) ? "is-option" : false;
          }, false);
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
  
  .icon-container-inner {
    background-color:    #0c0c0c;
    border:              1px solid;
    border-bottom-color: #1b1b1b;
    border-left-color:   #060606;
    border-right-color:  #1b1b1b;
    border-top-color:    #060606;
    box-sizing:          content-box;
    padding:             2px;
    width:               32px;
    height:              32px;
    position:            relative;
    
    transition: transform .15s ease-out;
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
    
    li {
      display: inline-block;
      
      &:not(:last-child)::after {
        content: ", ";
        margin:  0 4px 0 -4px;
      }
    }
  }
  
  .skill {
    &:not(.is-compact) {
      align-items:      center;
      background-color: $dark-color-darker;
      margin-bottom:    $line-height;
      padding:          $padding;
    }
    
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
        
        .skill-description-container {
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
      
      .skill-description-container {
        display: none;
        
        position: absolute;
        width: 450px;
        z-index: 400;
        background-color: $dark-color-darker;
        padding: $padding;
      }
    }
    
    &.is-option {
      .icon-container-inner::after {
        background-color: $orange-color;
      }
    }
    
    &.is-required {
      .icon-container-inner::after {
        background-color: $red-color;
      }
    }
    
    &.is-selected {
      .icon-container-inner::after {
        background-color: $green-color;
      }
    }
  }
  
  .skill-icon {
    transition: all .15s ease-out;
  }
</style>