<template>
  <div
   @click="clickCommandButton"
   class="command-button"
   :class="{ 'is-cooldown': currentCooldown }">
    <img :src="`/rulebook/src/assets/images/skills-icons/${command.icon}.png`" alt="">
    <md-tooltip md-direction="top">{{ command.name }}</md-tooltip>
    <div class="cooldown-counter" v-if="currentCooldown">
      <md-progress-spinner 
        md-mode="determinate"
        :md-diameter="50"
        :md-value="(currentCooldown / command.cooldown) * 100"
      />
      <span class="cooldown-value">{{ currentCooldown }}</span>
    </div>
    
    <md-menu
      v-if="options"
      :md-active="showOptions"
      :md-offset-y="25"
      md-direction="top-start"
    >
      <md-menu-content>
        <md-menu-item 
          v-for="option in options"
          @click="clickCommandOption(option)">
          {{ option.type }}
        </md-menu-item>
      </md-menu-content>
    </md-menu>
  </div>
</template>

<script>
import CommandButton from './CommandButton.vue';
import { commands } from '_mechanics';
import { skills } from '_skills';
  
export default {
  name: 'command-button',
  props: ['character', 'commandId', 'currentCooldown', 'options'],
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
  data() {
    return {
      showOptions: false
    }
  },
  methods: {
    clickCommandButton() {
      if(!this.options)
        this.executeCommand();
      else {
        this.showOptions = !this.showOptions;
      }
    },
    clickCommandOption(option) {
      this.executeCommand(option);
      this.showOptions = false;
    },
    executeCommand(options) {
      if(this.currentCooldown)
        return;
      
      this.character.executeCommand(this.command, options);
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
    
    .md-menu { float: left; }
    
    .md-progress-spinner {
      position: absolute;
      left: 0;
      
      circle.md-progress-spinner-circle {
        stroke: rgba(144, 189, 226, 0.5);
      }
    }
  }
</style>
