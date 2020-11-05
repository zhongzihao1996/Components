import Vue from 'vue';

const components: any = require.context('./', true, /\.vue$/);

components.keys().forEach(key => {
  const component = components(key).default;
  Vue.component(`${component.name}`, component);
});
