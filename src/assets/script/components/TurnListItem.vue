<template>
  <li
    :class="{ 
      'has-acted': character.hasActed,
      'is-current': isCurrent,
      'is-delaying': character.isDelaying
    }">
    <span 
      class="team-affiliation"
      :style="{ backgroundColor: teamFills[character.team] }"
      ></span>
    <span class="character-name">{{ character.attributes.name }}</span>
    <md-button
     class="md-dense md-icon-button md-mini"
     v-if="isCurrent && !character.isDelaying"
     @click.stop="delayAction"
     >
      <md-icon>subdirectory_arrow_left</md-icon>
      <md-tooltip>Delay action</md-tooltip>
    </md-button>
  </li>
</template>

<script>
import Vue from 'vue';
import Walker from '../entities/walker';
  
const walkerSingleton = new Walker();

export default {
  name: 'turn-list-item',
  props: ['character', 'isCurrent'],
  computed: {
    isDelaying() {
      return this.character.isDelaying();
    }
  },
  data() {
    return {
      teamFills: walkerSingleton.teamFills
    }
  },
  methods: {
    delayAction() {
      this.character.setProp('isDelaying', !this.isDelaying);
    }
  }
}
</script>

<style scoped lang="scss">
  li {
    color:     #232323;
    cursor:    pointer;
    font-size: 12px;
    
    transition: font-size .15s ease-out;
    
    &:hover {
      color: #4e4e4e;
    }
    
    &.has-acted {
      opacity: 0.6;
    }
    
    &.is-current {
      font-size: 14px;
    }
    
    &.is-delaying {
      font-style: italic;
    }
    
    span,
    .md-button {
      vertical-align: middle;
    }
  }
  
  .team-affiliation {
    border-radius: 100%;
    display:       inline-block;
    margin-right:  5px;
    width:         12px;
    height:        12px;
  }
  
  .md-icon {
    font-size: 14px !important;
  }
</style>
