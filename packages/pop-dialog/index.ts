import Vue from 'vue';

import PopDialog from './src/PopDialog.vue';

interface VueComp {
  install?: Function;
}

(PopDialog as VueComp).install = (vue: typeof Vue) => {
  vue.component('popDialog', PopDialog);
};

export default PopDialog;
