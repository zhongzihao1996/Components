import Vue from 'vue'

export function install(vue: typeof Vue): void

export interface TableDataType {
  [propName: string]: string | number;
}

export interface nestedNode {
  rowKey: string,
  level: number,
  expanded: boolean,
  loaded: boolean
}

export declare class TableBox extends Vue {

  static install(vue: typeof Vue): void

  $refs: {
    bodyWrapperDom: HTMLElement
  }

  data: Array<TableDataType>

  tableHeight: number

  loadingFlag: boolean

  rowKey: string | ((row: object) => any)

  rowKey2: string

  expandAllFlag: boolean

  lazyLoad: boolean

  classNameConfig: string | ((param: object) => string | undefined)

  mergeCellConfig: (param: object) => object | undefined

  /**
   * @param row
   * @param nestedNode
   * @param resolve
   */
  loadFun(row: object, nestedNode: nestedNode, resolve: Function): void

  noTableBorder: boolean

  noTableBorderX: boolean

  noTableBorderY: boolean

  /**
   * @param row
   * @param selectSet
   */
  setSelection(row: object, selectSet?: boolean): void

  setAllSelection(): void

  /**
   * @param row
   * @param expandSet
   */
  setExpansionRow(row: object, expandSet?: boolean): void

  clearSort(): void
}

export type TableColumnType = 'default' | 'select' | 'expand'
export type TableColumnFixedType = 'left' | 'right'
export type TableColumnAlignment = 'left' | 'center' | 'right'
export type TableColumnBgColorType = '' | 'highlight'

export declare class TableColumn extends Vue {

  static install(vue: typeof Vue): void

  type: TableColumnType

  label: string

  prop: string

  width: number

  fixedWidthFlag: boolean

  fixed: TableColumnFixedType

  sortable: boolean | string

  headerAlignType: TableColumnAlignment

  alignType: TableColumnAlignment

  bgColorType: TableColumnBgColorType

  maxLength: number

  filterPlacement: string

}
