import multiSelect from './src/multiSelect.vue';
import Vue from 'vue';

import {
  Select,
  Option,
  OptionGroup
} from 'element-ui';

import '../../src/assets/css/button.scss';

interface VueComp {
  install?: Function
}

(multiSelect as VueComp).install = function (vue: typeof Vue) {
  vue.use(Select);
  vue.use(Option);
  vue.use(OptionGroup);
  vue.component('multiSelect', multiSelect);
};

export default multiSelect;
