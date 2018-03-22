import Vue from "vue";
import Book from "./Book.vue";

import VueMaterial from 'vue-material';

Vue.use(VueMaterial);

new Vue({
  el: "#book",
  render: (h) => h(Book),
});