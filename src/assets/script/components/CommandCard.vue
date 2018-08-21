<template>
  <div class="command-card">
    <command-button 
      :character="character"
      commandId="overwatch"
      />
    
    <command-button 
      :character="character"
      commandId="hunkerDown"
      />
      
    <command-button 
      v-for="skill in character.attributes.skills"
      v-if="skill.cooldown"
      :character="character"
      :commandId="skill.id"
      :currentCooldown="skill.currentCooldown"
      @command="startCooldown"
    />
  </div>
</template>

<script>
import Vue from 'vue';

import CommandButton from './CommandButton.vue';
  
export default {
  name: 'command-card',
  props: ['character'],
  components: {
    CommandButton
  },
  methods: {
    startCooldown(command) {
      const skill = this.character.attributes.skills
        .find( _ => _.id === command.id );
      
      Vue.set(skill, 'currentCooldown', skill.cooldown);
    }
  }
}
</script>

<style scoped lang="scss">
  .command-card {
    position: fixed;
    bottom:   24px;
    left:     50%;
    
    .command-button {
      cursor:  pointer;
      display: inline-block;
      margin:  0 2px;
      opacity: 0.8;
      width:   50px;
      height:  50px;
      
      transition: all 0.1s ease-in-out;
      
      &:active {
        transform: scale(1.1);
      }
      
      &:hover {
        opacity: 1;
      }
      
      &.is-cooldown {
        cursor: progress;
        
        &:active {
          transform: scale(1);
        }
        
        &:hover {
          opacity: 0.7;
        }
      }
    }
  }
</style>
