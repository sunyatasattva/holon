<template>
  <div class="attribute-modifiers">
    <ul>
      <li 
        v-for="(mod, attr) in modifiers"
        class="modifier"
        :class="{ 'is-negative': mod < 0 || mod[0] === '-', 'is-positive': mod > 0 || mod[0] === '×' }">
        <i class="material-icons">{{ $options.icons[attr] }}</i>
        <span class="modifier-value">{{ mod }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "attribute-modifiers",
  props: ["modifiers"],
  icons: {
    "action": "reply_all",
    "aim": "gps_fixed",
    "criticalHitChance": "new_releases",
    "movement": "directions_run",
    "reflexes": "flash_on",
    "resistance": "favorite",
    "toughness": "security",
    "vision": "visibility",
    "will": "brightness_7"
  }
}
</script>

<style lang="scss">
  @import "../../style/_variables";
  
  .attribute-modifiers {
    margin: 0;
    
    .modifier {
      display: inline-block;
      margin: 0 $padding 0 0;
      
      &:last-child {
        margin-right: 0;
      }
      
      &.is-negative {
        color: $red-color;
      }
      
      &.is-positive {
        color: $green-color;
      }
      
      .material-icons,
      .modifier-value {
        vertical-align: middle;
      }
    }
  }
</style>
