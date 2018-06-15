<template>
  <card>
    <span slot="header-main">
      {{ weapon.type }}

      <ul class="weapon-stats attribute-modifiers">
        <li 
         class="modifier tooltip" 
         data-tooltip="Costo">
          <i class="material-icons">monetization_on</i>
          <span class="modifier-value">{{ weapon.cost }}</span>
        </li>
        <li 
         class="modifier weapon-damage tooltip" 
         data-tooltip="Danni">
          <i class="material-icons">gps_fixed</i>
          <span class="modifier-value">{{ weapon.damage }}</span>
        </li>
        <li 
         class="modifier tooltip" 
         data-tooltip="Critico">
          <i class="material-icons">new_releases</i>
          <span class="modifier-value">{{ weapon.criticalHitChance }}</span>
        </li>
        <li 
         v-if="weapon.ammo > 0"
         class="modifier tooltip" 
         data-tooltip="Munizioni">
          <i class="material-icons">settings_input_composite</i>
          <span class="modifier-value">{{ weapon.ammo }}</span>
        </li>
      </ul>
    </span>
    <span slot="header-aside">
      {{ weapon.category }}
    </span>

    <p v-if="weapon.description" v-html="weapon.description"></p>

    <attribute-modifiers 
      slot="footer"
      v-if="weapon.modifiers"
      :modifiers="weapon.modifiers"
    />
  </card>
</template>

<script>
import AttributeModifiers from "./AttributeModifiers.vue";
import Card from "./Card.vue";

export default {
  name: "weapon-card",
  components: {
    AttributeModifiers,
    Card
  },
  props: {
    weapon: {
      required: true,
      type: Object
    }
  }
}
</script>

<style>
</style>
