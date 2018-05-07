<template>
  <div
   @click="executeCommand"
   class="command-button"
   :class="{ 'is-cooldown': currentCooldown }">
    <img :src="`rulebook/src/assets/images/skills-icons/${command.icon}.png`" alt="">
    <div class="cooldown-counter" v-if="currentCooldown">
      <md-progress-spinner 
        md-mode="determinate"
        :md-diameter="50"
        :md-value="(currentCooldown / command.cooldown) * 100"
      />
      <span class="cooldown-value">{{ currentCooldown }}</span>
    </div>
  </div>
</template>

<script>
import CommandButton from './CommandButton.vue';
import { commands } from '_mechanics';
import { skills } from '_skills';
  
export default {
  name: 'command-button',
  props: ['character', 'commandId', 'currentCooldown'],
  components: {
    CommandButton
  },
  computed: {
    command() {
      return commands
        .concat(skills)
        .find( _ => _.id === this.commandId );
    }
  },
  methods: {
    executeCommand() {
      if(this.currentCooldown)
        return;
      
      this.character.executeCommand(this.command);
      this.$emit('command', this.command);
    }
  }
}
</script>

<style lang="scss">
  .command-button {
    user-select: none;
    position:    relative;
    
    &.is-cooldown {
      img {
        filter: brightness(50%);
      }
    }
    
    .cooldown-counter {
      color:            #fff;
      text-align:       center;
      position:         absolute;
      top:              0;
      right:            0;
      bottom:           0;
      left:             0;
    }
    
    .cooldown-value {
      font-size:   24px;
      font-weight: bold;
      line-height: 50px;
    }
    
    .md-progress-spinner {
      position: absolute;
      left: 0;
      
      circle.md-progress-spinner-circle {
        stroke: rgba(144, 189, 226, 0.5);
      }
    }
  }
</style>
