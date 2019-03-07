import Vue from 'vue';
import ElementUI from 'element-ui';
Vue.use(ElementUI);

import App from './App.vue';

import CommonComponent from '../index';
import SampleTableDemo from './sample-table-demo.vue';
import MultipleCascaderDemo from './multiple-cascader-demo.vue';

CommonComponent['SampleTableDemo'] = SampleTableDemo;
CommonComponent['MultipleCascaderDemo'] = MultipleCascaderDemo;

// 通用组件
Object.keys(CommonComponent).forEach(key => {
	Vue.component(key, CommonComponent[key]);
});

new Vue({
	el: '#app',
	components: { App },
	template: '<App/>',
});
