import Vue from 'vue';

import CascaderSelect from './src/CascaderSelect.vue';

interface VueComp {
  install?: Function;
}

(CascaderSelect as VueComp).install = (vue: typeof Vue) => {
  vue.component('cascaderSelect', CascaderSelect);
};

export default CascaderSelect;
