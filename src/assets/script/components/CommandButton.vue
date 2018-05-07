<template>
  <div @click="executeCommand" class="command-button">
    <img :src="`rulebook/src/assets/images/skills-icons/${command.icon}.png`" alt="">
  </div>
</template>

<script>
import CommandButton from './CommandButton.vue';
import { commands } from '_mechanics';
  
export default {
  name: 'command-button',
  props: ['character', 'commandId'],
  components: {
    CommandButton
  },
  computed: {
    command() {
      return commands.find( _ => _.id === this.commandId );
    }
  },
  methods: {
    executeCommand() {
      return this.character.executeCommand(this.command);
    }
  }
}
</script>

<style scoped lang="scss">
</style>
