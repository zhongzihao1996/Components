import Vue from 'vue';

import { DatePicker as datePicker } from 'element-ui';
import DatePicker from './src/DatePicker.vue';

interface VueComp {
  install?: Function;
}

(DatePicker as VueComp).install = (vue: typeof Vue) => {
  vue.use(datePicker);
  vue.component('datePicker', DatePicker);
};

export default DatePicker;
