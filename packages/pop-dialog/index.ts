import Vue from 'vue';
import {
  Dialog,
} from 'element-ui';
import popDialog from './src/popDialog.vue';

interface VueComp {
  install?: Function;
}

(popDialog as VueComp).install = (vue: typeof Vue) => {
  vue.use(Dialog);
  vue.component('popDialog', popDialog);
};

export default popDialog;
