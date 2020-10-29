import Vue from 'vue'

export declare class PopDialog extends Vue {

  static install(vue: typeof Vue): void

  dialogType: string

  showFlag: boolean

  showCloseFlag: boolean

  clickBgCloseFlag: boolean

  title: string

  centerStyle: boolean

  cancelbuttonText: string

  buttonText: string

  sureButtonDisabled: boolean

  sureButtonType: string

  width: number

  height: number

  /**
   * 拦截dialog关闭的处理函数（仅限点击右上角关闭按钮以及点击遮罩背景关闭的情况）
   * @param param 方法参数，用于关闭dialog
   */
  beforeCloseFun: (param: Function) => void
}