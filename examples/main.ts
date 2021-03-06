/* eslint-disable import/named */
import Vue from 'vue';
import ElementUI from 'element-ui';
import App from './App.vue';

import 'element-ui/lib/theme-chalk/index.css';
import {
  DatePicker,
  MultiSelect,
  PopDialog,
  CascaderSelect,
} from '../src/main';

import './pages/pages.index';

Vue.use(ElementUI);

Vue.use(DatePicker);
Vue.use(MultiSelect);
Vue.use(PopDialog);
Vue.use(CascaderSelect);

new Vue({
  mounted() {
    this.consoleVersion('构建版本', process.env.CODE_VERSION);
    this.consoleVersion('功能分支', process.env.CODE_BRANCH, '#c23531');
    this.consoleVersion('更新用户', process.env.COMMER_USER, '#c23531');
    this.consoleVersion('更新信息', process.env.COMMER_MESSAGE, '#c23531');
    this.consoleVersion('更新时间', process.env.COMMER_TIME, '#c23531');
  },
  methods: {
    consoleVersion(label = '', value = '', labelColor = '#35495e', valueColor = '#41b883') {
      console.log(
        `%c ${label} %c ${value} %c`,
        `background:${labelColor} ; padding: 1px; border-radius: 3px 0 0 3px; color: #fff`,
        `background:${valueColor} ; padding: 1px; border-radius: 0 3px 3px 0; color: #fff`,
        'background:transparent;',
      );
    },
  },
  render: h => h(App),
}).$mount('#app');
