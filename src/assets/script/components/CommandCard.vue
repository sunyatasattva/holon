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
  </div>
</template>

<script>
import CommandButton from './CommandButton.vue';
  
export default {
  name: 'command-card',
  props: ['character'],
  components: {
    CommandButton
  }
}
</script>

<style scoped lang="scss">
  .command-card {
    position: fixed;
    bottom: 24px;
    left: 50%;
    
    .command-button {
      display: inline-block;
      margin: 0 2px;
      width: 50px;
      cursor: pointer;
      height: 50px;
      opacity: 0.7;
      
      &:hover {
        opacity: 1;
      }
    }
  }
</style>
