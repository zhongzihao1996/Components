import datePicker from './src/datePicker.vue';
import Vue from 'vue';

import { DatePicker } from 'element-ui';

import '../../src/assets/css/button.scss';

interface VueComp {
  install?: Function
}

(datePicker as VueComp).install = function (vue: typeof Vue) {
  vue.use(DatePicker);
  vue.component('datePicker', datePicker);
};

export default datePicker;
