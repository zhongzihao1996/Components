import Vue from 'vue';
import popDialog from './src/popDialog.vue';

interface VueComp {
  install?: Function;
}

(popDialog as VueComp).install = (vue: typeof Vue) => {
  vue.component('popDialog', popDialog);
};

export default popDialog;
