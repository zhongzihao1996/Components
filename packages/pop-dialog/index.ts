import popDialog from './src/popDialog.vue';
import Vue from 'vue';

import '../../src/assets/css/button.scss';

interface VueComp {
  install?: Function
}

(popDialog as VueComp).install = function (vue: typeof Vue) {
  vue.component('popDialog', popDialog);
};

export default popDialog;
