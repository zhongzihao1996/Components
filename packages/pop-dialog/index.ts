import Vue from 'vue';
import {
  Dialog,
} from 'element-ui';
import PopDialog from './src/PopDialog.vue';

interface VueComp {
  install?: Function;
}

(PopDialog as VueComp).install = (vue: typeof Vue) => {
  vue.use(Dialog);
  vue.component('popDialog', PopDialog);
};

export default PopDialog;
