import Vue from 'vue';
import Game from './Game.vue';

// @todo swap with Keen-UI when ready for Vue 2.0
import VueMaterial from 'vue-material'
Vue.use(VueMaterial);

Vue.material.theme.register('default', {
  primary: 'blue',
  accent: 'amber'
});

import VueFire from 'vuefire';
Vue.use(VueFire);

const Cover  = require('./entities/cover');
const Walker = require('./entities/walker');

const game = new Vue({
  el: '#Game',
  render: (h) => h(Game),
});

const world = game.$children[0].$refs.World.canvas;