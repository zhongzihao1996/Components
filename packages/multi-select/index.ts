import Vue from 'vue';

import {
  Select,
  Option,
  OptionGroup
} from 'element-ui';
import multiSelect from './src/MultiSelect.vue';

interface VueComp {
  install?: Function;
}

(multiSelect as VueComp).install = (vue: typeof Vue) => {
  vue.use(Select);
  vue.use(Option);
  vue.use(OptionGroup);
  vue.component('multiSelect', multiSelect);
};

export default multiSelect;
