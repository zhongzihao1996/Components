import Vue from 'vue';

import {
  Select,
  Option,
  OptionGroup
} from 'element-ui';
import MultiSelect from './src/MultiSelect.vue';

interface VueComp {
  install?: Function;
}

(MultiSelect as VueComp).install = (vue: typeof Vue) => {
  vue.use(Select);
  vue.use(Option);
  vue.use(OptionGroup);
  vue.component('multiSelect', MultiSelect);
};

export default MultiSelect;
