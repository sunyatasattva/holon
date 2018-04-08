<template>
  <div class="item-selection-menu">
    <md-menu md-direction="top-start" md-size="huge">
      <md-button md-menu-trigger class="md-raised">
        <md-chip v-if="inventoryPoints && !hideCost">
          {{ inventoryPoints }}
        </md-chip>
        <span>Items</span>
      </md-button>
      <md-menu-content class="item-selection-menu-content">
        <template v-for="category in groupedItems">
          <md-menu-item v-for="item in category">
            <component 
              :is="`icon-${$options.itemIcons[item.category]}`" />
            <div class="item-input-container">
              <attribute-input 
                :cap="255"
                :cost="item.cost"
                :label="item.type"
                :model.sync="inventory[item.id]"
                @update:model="update"
              />
            </div>
          </md-menu-item>
        </template>
      </md-menu-content>
    </md-menu>
  </div>
</template>

<script>
import groupBy from 'lodash.groupby';

import AttributeInput from './AttributeInput.vue';  

import { items as allItems } from '_equipment';

const ITEM_ICONS = {
  "Ammo": "ammo",
  "Drugs": "pill",
  "Grenades": "ornament",
  "Weapon Mods": "pistol"
}  

export default {
  name: 'item-selection-menu',
  props: ['hideCost', 'items'],
  components: {
    AttributeInput
  },
  computed: {
    groupedItems() {
      let items = this.items || allItems;
      
      return groupBy(items, "category");
    },
    inventoryPoints() {
      return Object.values(this.inventory)
        .reduce(
          (sum, curr) => sum + curr.cost,
          0
      );
    }
  },
  data() {
    let items = this.items || allItems;
    
    return {
      inventory: items
        .reduce((acc, curr) => {
          let id = curr.id;
          
          acc[id] = { cost: 0, value: 0, ...curr }
          
          return acc;
        }, {})
    }
  },
  methods: {
    update() {
      this.$emit('update', this.$data.inventory);
    }
  },
  itemIcons: ITEM_ICONS
}
</script>

<style lang="scss">
  .item-selection-menu {
    .md-button {
      margin-bottom: 20px;
      width:         100%;
      
      .md-chip {
        position: absolute;
        left:     2px;
        top:      2px;
      }
    }
    
    .md-button-content {
      position: static;
    }
    
    .md-menu {
      display: block;
    }
  }
  
  .item-selection-menu-content {
    .md-field {
      margin-bottom: 0px;
      
      label {
        color: #222;
      }
    }
    
    &.md-menu-content.md-menu-content-huge {
      min-width: 360px;
    }
  }
</style>

<style scoped>
  .item-input-container {
    margin-left: 10px;
    width:       100%;
  }
</style>
