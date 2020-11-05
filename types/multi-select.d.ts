import Vue from 'vue';

export interface OptionData {
  value: string | number;
  label: string | number;
}

export interface OptionsGroup {
  [groupName: string]: Array<OptionData>;
}

export declare class MultiSelect extends Vue {
  static install(vue: typeof Vue): void

  type: string

  smallSize: boolean

  options: Array<OptionData> | OptionsGroup

  placeholder: string

  group: boolean

  labelField: string

  valueField: string

  parentVal: Array<string>
}
