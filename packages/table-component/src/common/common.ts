// eslint-disable-next-line no-unused-vars
import { TableColumn } from '../../../../types/components-junhai';

export interface columnType extends TableColumn{
  children: columnType[];
  id: string;
  level: number;
  rowSpan: number;
  colSpan: number;
  renderThCellChild: Function;
  renderTdCellChild: Function;
  width: number;
  fixedWidthFlag: boolean;
  minDefaultWidth: number;
  minWidth: number;
  realWidth: number;
}

export interface statesDataType {
  isFixed: boolean;
  expandRows: any;
  columns: Array<columnType>;
  leftFixedColumns: Array<columnType>;
  leftFixedLeafColumns: Array<columnType>;
  rightFixedColumns: Array<columnType>;
  rightFixedLeafColumns: Array<columnType>;
  data: Array<object>;
  originColumns: columnType[];
  sortingColumn: columnType;
  sortRule: string;
  selectConfig: object[];
  rowKey: Function | string;
  rowKey2: string;
  nestedData: NestedData;
  lazyNodeMap: LazyNodeMap
}

interface NestedData {
  [key: string]: NestedRenderData
}

export interface NestedRenderData {
  display: boolean;
  expanded?: boolean;
  level: number;
  lazyLoad?: boolean;
  loading?: boolean;
  loaded?: boolean;
  noLazyChildren?: boolean;
  children?: Array<NestedRenderData>;
}

interface LazyNodeMap {
  [key: string]: RowType | RowType[];
}

export interface storeType extends Vue {
  states: statesDataType;
  commit: Function;
  updateColumns: Function;
  checkRowExpanded: Function;
}

export interface RowType {
  children: Array<RowType>;
}

export interface NestedNode {
  level: number;
  indent: number;
  expanded?: boolean;
  loading?: boolean;
  noLazyChildren?: boolean;
}

export interface RenderParamsType {
  store: storeType;
  _self: any;
  column: columnType;
  row: RowType;
  rowIndex: number;
  nestedNode?: NestedNode
}