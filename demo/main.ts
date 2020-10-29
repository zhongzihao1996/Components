import Vue from 'vue';
import App from './App.vue';

import demoExample from './demo-example.vue';
Vue.component('demoExample', demoExample);

// 本地引入
import componentsJunhai from '../packages/index';
Vue.use(componentsJunhai);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
});
