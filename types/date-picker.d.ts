import Vue from 'vue';

export type TypeConfig = 'daterange' | 'datetimerange' | 'datetime' | 'year' | 'month' | 'week' | 'date'

export interface PickerOptionsData {
  text: string;
  onClick?: Function;
}

export type DateValueType = Array<string> | string | null;

export declare class DatePicker extends Vue {
  static install(vue: typeof Vue): void

  size: string

  disabled: boolean

  editable: boolean

  searchFormDate: DateValueType

  type: TypeConfig

  isLimit: boolean

  dateType: string

  defaultTime: Array<string>

  rangeSeparator: string

  placeholder: string

  startPlaceholder: string

  endPlaceholder: string

  pickerOptionsData: PickerOptionsData[]
}
