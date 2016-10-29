import Vue from 'vue';
import Game from './Game.vue';

// @todo swap with Keen-UI when ready for Vue 2.0
import VueMaterial from 'vue-material'
Vue.use(VueMaterial);

Vue.material.theme.register('default', {
  primary: 'blue',
  accent: 'amber'
})

const Cover  = require('./entities/cover');
const Walker = require('./entities/walker');

const game = new Vue({
  el: '#Game',
  render: (h) => h(Game)
});

const world = game.$children[0].$refs.World.canvas;

// add objects
var cover = new Cover({
  left: 100,
  top: 100,
  width: world.tileSize,
  height: world.tileSize,
  fill: '#faa',
});

world.addAsActiveObject(cover);

var pg = new Walker({
  left: 225,
  top: 225,
  radius: world.tileSize / 2,
  fill: '#f1cc16',
  attributes: {
    movement: 3,
    name: 'Paperino'
  }
});

world.addAsActiveObject(pg);

var pg2 = new Walker({
  left: 275,
  top: 275,
  radius: world.tileSize / 2,
  fill: '#f1cc16',
  attributes: {
    movement: 2,
    name: 'Colorado'
  }
});

world.addAsActiveObject(pg2);