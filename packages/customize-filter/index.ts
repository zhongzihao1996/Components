import customizeFilter from './src/customizeFilter.vue';
import Vue from 'vue';

import {
  Dialog,
  Scrollbar,
  Checkbox,
  CheckboxGroup,
  Message
} from 'element-ui';

import '../../src/assets/css/button.scss';

interface VueComp {
  install?: Function
}

(customizeFilter as VueComp).install = function (vue: typeof Vue) {
  vue.use(Dialog);
  vue.use(Scrollbar);
  vue.use(Checkbox);
  vue.use(CheckboxGroup);
  vue.prototype.$message = Message;
  vue.component('customizeFilter', customizeFilter);
};

export default customizeFilter;
