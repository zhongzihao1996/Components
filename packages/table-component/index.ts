import tableBox from './src/table-box.vue';
import tableColumn from './src/table-column';
import Vue from 'vue';

import '../../src/assets/css/button.scss';

interface VueComp {
  install?: Function
}

(tableBox as VueComp).install = function (vue: typeof Vue) {
  vue.component('tableBox', tableBox);
};
(tableColumn as VueComp).install = function (vue: typeof Vue) {
  vue.component('tableColumn', tableColumn);
};

const install = function (vue: typeof Vue) {
  vue.component('tableBox', tableBox);
  vue.component('tableColumn', tableColumn);
}

export default {
  install,
  tableBox,
  tableColumn
};
