import Vue from 'vue';

import DatePicker from './src/DatePicker.vue';

interface VueComp {
  install?: Function;
}

(DatePicker as VueComp).install = (vue: typeof Vue) => {
  vue.component('DatePicker', DatePicker);
};

export default DatePicker;
