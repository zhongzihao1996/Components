import Vue from 'vue'

export interface DataOption {
  value: string | number;
  label: string | number;
}

export interface DataGroup {
  label: string;
  indeterminate: boolean;
  checkAll: boolean;
  checkedList: Array<string | number>;
  children: Array<DataOption>;
}

export declare class CustomizeFilter extends Vue {

  static install(vue: typeof Vue): void

  title: string

  sureButtonText: string

  data: Array<DataGroup> | Array<DataOption>

  value: Array<DataOption>

  default: Array<DataOption>

  groupFlag: boolean

  keepOrderFlag: boolean

  showFlag: boolean

  saveTemplateFlag: boolean

  templateRemindText: string

  templateNameNum: number

  specialText: string

  specialField: string

}