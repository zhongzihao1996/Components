import pagination from './src/pagination.vue';
import Vue from 'vue';

import '../../src/assets/css/button.scss';

interface VueComp {
  install?: Function
}

(pagination as VueComp).install = function (vue: typeof Vue) {
  vue.component('pagination', pagination);
};

export default pagination;
