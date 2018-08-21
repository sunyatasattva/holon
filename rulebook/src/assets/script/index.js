import Vue from "vue";
import Book from "./Book.vue";

import VueMaterial from "vue-material";

import IconAmmo from "vue-material-design-icons/video-input-component.vue";
import IconDna from "vue-material-design-icons/dna.vue";
import IconMemory from "vue-material-design-icons/memory.vue";
import IconOrnament from "vue-material-design-icons/ornament.vue";
import IconPill from "vue-material-design-icons/pill.vue";
import IconPistol from "vue-material-design-icons/pistol.vue";
import IconWrench from "vue-material-design-icons/wrench.vue";
 
Vue.component("icon-ammo", IconAmmo);
Vue.component("icon-dna", IconDna);
Vue.component("icon-memory", IconMemory);
Vue.component("icon-ornament", IconOrnament);
Vue.component("icon-pill", IconPill);
Vue.component("icon-pistol", IconPistol);
Vue.component("icon-wrench", IconWrench);

Vue.use(VueMaterial);

new Vue({
  el: "#book",
  render: (h) => h(Book),
});