<template>
  <div class='object-details'>
    <div v-if='object && object.attributes'>
      <h2>{{object.attributes.name}}</h2>
      
      <health-bar 
        :health='object.attributes.resistance'
        :wounds='object.attributes.wounds' />
      
      <dl class="attributes">
        <dt>
          <md-icon class="md-primary">favorite</md-icon>
          <span>Resistance</span>
        </dt>
        <dd>{{object.attributes.resistance}}</dd>
        <dt>
          <md-icon class="md-primary">brightness_7</md-icon>
          <span>Will</span>
        </dt>
        <dd>{{object.attributes.will}}</dd>
        <dt>
          <md-icon class="md-primary">gps_fixed</md-icon>
          <span>Aim</span>
        </dt>
        <dd>{{object.attributes.aim}}</dd>
        <dt>
          <md-icon class="md-primary">flash_on</md-icon>
          <span>Reflexes</span>
        </dt>
        <dd>{{object.attributes.reflexes}}</dd>
        <dt>
          <md-icon class="md-primary">directions_run</md-icon>
          <span>Movement</span>
        </dt>
        <dd>{{object.attributes.movement}}</dd>
        <dt>
          <md-icon class="md-primary">reply_all</md-icon>
          <span>Action</span>
        </dt>
        <dd>{{object.attributes.action}}</dd>
        <dt>
          <md-icon class="md-primary">visibility</md-icon>
          <span>Vision</span>
        </dt>
        <dd>{{object.attributes.vision}}</dd>
        <dt>
          <md-icon class="md-primary">security</md-icon>
          <span>Toughness</span>
        </dt>
        <dd>{{object.attributes.resistance}}</dd>
      </dl>
    </div>
    <span v-else>No object selected.</span>
  </div>
</template>

<script>
import HealthBar from './HealthBar.vue';
  
export default {
  name: 'object-details',
  props: ['activeObjects', 'object'],
  components: {
    HealthBar
  }
}
</script>

<style scoped>
  dt, dd {
    display:     inline-block;
    font-weight: normal;
    margin:      5px 0;
  }
  
  dt { width: 150px; }
  
  i { margin-right: 10px; }
</style>
