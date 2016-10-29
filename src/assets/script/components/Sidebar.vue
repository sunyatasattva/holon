<template>
  <div class='sidebar' v-if='selectedObject'>
    <h1>Selected object</h1>
    {{selectedObject.attributes.name}}
  </div>
</template>

<script>
export default {
  name: 'info-sidebar',
  props: ['activeObjects', 'selectedObject']
}
</script>

<style scoped>
  .sidebar {
    background-color: #fff;
    border-left:      1px solid #ccc;
    padding-left:     10px;
    position:         fixed;
    top:              0;
    right:            0;
    bottom:           0;
  }
</style>
