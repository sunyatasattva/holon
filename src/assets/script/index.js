import 'babel-polyfill';

import Vue from 'vue';
import Game from './Game.vue';

// @todo swap with Keen-UI when ready for Vue 2.0
//import { 
//  MdButton,
//  MdDrawer,
//  MdField,
//  MdIcon,
//  MdRadio,
//  MdSelect,
//  MdSwitch,
//  MdTabs,
//  MdTooltip
//} from 'vue-material/dist/components'
//
//Vue.use(MdButton);
//Vue.use(MdDrawer);
//Vue.use(MdField);
//Vue.use(MdIcon);
//Vue.use(MdRadio);
//Vue.use(MdSelect);
//Vue.use(MdSwitch);
//Vue.use(MdTabs);
//Vue.use(MdTooltip);
import VueMaterial from 'vue-material';

Vue.use(VueMaterial);

import IconAmmo from 'vue-material-design-icons/video-input-component.vue';
import IconOrnament from 'vue-material-design-icons/ornament.vue';
import IconPill from 'vue-material-design-icons/pill.vue';
import IconPistol from 'vue-material-design-icons/pistol.vue';
 
Vue.component('icon-ammo', IconAmmo);
Vue.component('icon-ornament', IconOrnament);
Vue.component('icon-pill', IconPill);
Vue.component('icon-pistol', IconPistol);

import VueFire from 'vuefire';
Vue.use(VueFire);

const Cover  = require('./entities/cover');
const Walker = require('./entities/walker');

const game = new Vue({
  el: '#Game',
  render: (h) => h(Game),
});

const world = game.$children[0].$refs.World.canvas;