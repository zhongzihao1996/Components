import Vue from 'vue';
import tableComponent from './table-component/index';
import pagination from './pagination/index';
import datePicker from './date-picker/index';
import popDialog from './pop-dialog/index';
import multiSelect from './multi-select/index';
import customizeFilter from './customize-filter/index';

import { 
  DatePicker,
  Select,
  Option,
  OptionGroup,
  Dialog,
  Scrollbar,
  Checkbox,
  CheckboxGroup,
  Message
} from 'element-ui';

import '../src/assets/css/button.scss';

interface componentsData {
  [name: string]: object
}

const components: componentsData = {
  tableComponent,
  pagination,
  datePicker,
  popDialog,
  multiSelect,
  customizeFilter
};

const install = function (vue: typeof Vue) {
  // eslint-disable-next-line no-undef
  if (compVersion) {
    // eslint-disable-next-line no-undef
    console.log("compVersion: " + compVersion);
  }
  vue.use(DatePicker);
  vue.use(Select);
  vue.use(Option);
  vue.use(OptionGroup);
  vue.use(Dialog);
  vue.use(Scrollbar);
  vue.use(Checkbox);
  vue.use(CheckboxGroup);
  vue.prototype.$message = Message;
  vue.use(tableComponent);
  Object.keys(components).forEach(key => {
    vue.component(key, components[key]);
  });
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  version: '1.0.0',
  install,
  ...components
};
