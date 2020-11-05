import Vue from 'vue';

import MultiSelect from './src/MultiSelect.vue';

interface VueComp {
  install?: Function;
}

(MultiSelect as VueComp).install = (vue: typeof Vue) => {
  vue.component('multiSelect', MultiSelect);
};

export default MultiSelect;
