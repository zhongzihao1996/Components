import Vue from 'vue';
import {
  DatePicker,
  Select,
  Option,
  OptionGroup,
  Dialog,
  // Scrollbar,
  Checkbox,
  CheckboxGroup,
  Message,
} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import datePicker from './date-picker/index';
import multiSelect from './multi-select/index';
import popDialog from './pop-dialog/index';

interface componentsData {
  [name: string]: object;
}

const components: componentsData = {
  datePicker,
  multiSelect,
  popDialog,
};

const install = (vue: typeof Vue) => {
  vue.use(DatePicker);
  vue.use(Select);
  vue.use(Option);
  vue.use(OptionGroup);
  vue.use(Dialog);
  // vue.use(Scrollbar);
  vue.use(Checkbox);
  vue.prototype.$message = Message;
  vue.use(CheckboxGroup); Object.keys(components).forEach(key => {
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
