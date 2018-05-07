<template>
  <div class="turn-controls">
    <transition-group name="turn-list" tag="ul">
      <turn-list-item
        v-for="character in sortedCharacters"
        :character="character"
        :isCurrent="activeCharacters.length && character.attributes.name === activeCharacters[0].attributes.name"
        :key="character.attributes.name.toLowerCase()"
        @click.native.stop="selectCharacter(character)"
      />
    </transition-group>
    <md-button
     class="md-dense md-icon-button md-mini md-primary turn-play"
     @click="playTurn"
     >
      <md-icon>play_arrow</md-icon>
    </md-button>
    <div class="current-turn" @click.alt="resetTurnCounter">
      {{ currentTurn }}
      <md-tooltip md-direction="bottom">Current turn</md-tooltip>
    </div>
  </div>
</template>

<script>
import TurnListItem from './TurnListItem.vue';
import Walker from '../entities/walker';
  
const walkerSingleton = new Walker();

export default {
  name: 'turn-controls',
  props: ['autoPan', 'characters', 'currentTurn'],
  components: {
    TurnListItem
  },
  computed: {
    activeCharacters() {
      return this.sortedCharacters
        .filter( (character) => !character.hasActed );
    },
    sortedCharacters() {
      return this.characters
        .sort( 
          (a, b) => {
            if(!a.isDelaying && b.isDelaying)
              return -1;
            else if(a.isDelaying && !b.isDelaying)
              return 1;
            else if(a.isDelaying && b.isDelaying)
              return a.attributes.reflexes - b.attributes.reflexes;
            else
              return b.attributes.reflexes - a.attributes.reflexes
          }
        );
    }
  },
  data() {
    return {
      teamFills: walkerSingleton.teamFills
    }
  },
  methods: {
    playTurn() {
      this.$emit('play', this.activeCharacters[0]);
      
      if(this.activeCharacters.length < 1) {
        this.$emit('endTurn');
        
        this.sortedCharacters
          .forEach((character) => {
            character.hasActed = false;
            character.isDelaying = false;
          });
        
        // @fixme ? maybe? Should this be here or in Game.vue. Maybe this should emit a simple update event.
        this.sortedCharacters[0].canvas
          .fire('object:modified');
      }
    },
    resetTurnCounter() {
      this.$emit('resetTurnCounter');
    },
    selectCharacter(character) {
      this.$emit('select', character);
    }
  },
  watch: {
    activeCharacters(curr, last) {
      if(this.autoPan && curr[0] !== last[0])
        this.selectCharacter(curr[0]);
    } 
  }
}
</script>

<style scoped lang="scss">
  ul {
    font-size: 0;
    margin:    0;
    padding:   0;
    list-style-type: none;
    width: 200px;
  }
  
  li {
    color:     #232323;
    cursor:    pointer;
    font-size: 12px;
    line-height: 32px;
    
    &:hover {
      color: #4e4e4e;
    }
    
    &.has-acted {
      opacity: 0.6;
    }
    
    span,
    .md-button {
      vertical-align: middle;
    }
  }
  
  .current-turn {
    background-color: rgba(150,150,150,0.2);
    border:           1px solid #ccc;
    border-radius:    100%;
    cursor:           pointer;
    float:            right;
    font-weight:      bold;
    line-height:      31px;
    margin-right:     5px;
    text-align:       center;
    text-shadow:      0 0 8px #fff;
    user-select:      none;
    width:            32px;
    height:           32px;
  }
  
  .team-affiliation {
    border-radius: 100%;
    display:       inline-block;
    margin-right:  5px;
    width:         12px;
    height:        12px;
  }
  
  .turn-list-move {
    transition: transform .5s ease-in-out;
  }
  
  .turn-play {
    float: right;
  }
  
  .md-icon {
    font-size: 14px !important;
  }
</style>
