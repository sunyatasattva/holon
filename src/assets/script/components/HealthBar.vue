<template>
  <div class='health-bar'>
    <ul>
      <li v-for='n in currentHealth' class='full' @click='wound'></li>
      <li v-for='n in wounds' class='wound' @click='heal'></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'health-bar',
  props: ['health', 'wounds'],
  computed: {
    currentHealth() {
      return this.health - this.wounds;
    }
  },
  methods: {
    wound() {
      // @todo refactor with state management
      this.$emit('update', -1);
    },
    heal() {
      this.$emit('update', 1);
    }
  }
}
</script>

<style lang="scss">
  .health-bar {
    ul {
      font-size: 0;
      margin:    0;
      padding:   0;
    }

    li {
      background-color: #fff;
      border:           1px solid #cad5e0;
      display:          inline-block;
      margin-right:     5px;
      transform:        skewX(-15deg);
      width:            30px;
      height:           15px;
      position:         relative;
    }

    li:last-child:after {
      -moz-transform:    rotate(-45deg);
      -webkit-transform: rotate(-45deg);
      background:        #FFFFFF;
      border-bottom:     1px solid #CAD5E0;
      border-right:      1px solid #CAD5E0;
      content:           '';
      display:           block;
      width:             11px;
      height:            11px;
      position:          absolute;
      top:               1px;
      right:             -7px;
    }

    li.full,
    li.full:last-child::after {
      background-color: #cad5e0
    }
  }
</style>
