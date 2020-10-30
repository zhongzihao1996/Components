import Vue from 'vue';
import {
  Dialog,
  Message
} from 'element-ui';
import popDialog from './pop-dialog/index';

interface componentsData {
  [name: string]: object;
}

const components: componentsData = {
  popDialog,
};

const install: any = (vue: typeof Vue) => {
  if (install.installed) return;
  vue.use(Dialog);
  vue.prototype.$message = Message;
  Object.keys(components).forEach(key => {
    vue.component(key, components[key]);
  });
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  version: '1.0.0',
  install,
  ...components
};
