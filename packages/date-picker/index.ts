import Vue from 'vue';

import { DatePicker } from 'element-ui';
import datePicker from './src/DatePicker.vue';

interface VueComp {
  install?: Function;
}

(datePicker as VueComp).install = (vue: typeof Vue) => {
  vue.use(DatePicker);
  vue.component('datePicker', datePicker);
};

export default datePicker;
