import Vue from 'vue';

import DatePicker from './src/DatePicker.vue';

interface VueComp {
  install?: Function;
}

(DatePicker as VueComp).install = (vue: typeof Vue) => {
  vue.component('datePicker', DatePicker);
};

export default DatePicker;
