/* eslint-disable no-unused-vars */
import { Component, Prop, Mixins } from 'vue-property-decorator';
import LayoutMixin from './layout-mixin';
import { mapStates } from './store/store-api';
import checkBox from './common/comp/checkbox.vue';
import { CreateElement, VNode } from 'vue';
import {
  columnType,
  statesDataType,
  storeType
} from './common/common';
 
const getAllColumns = (columns: columnType[]) => {
  const result: columnType[] = [];
  columns.forEach((column) => {
    if (column.children) {
      result.push(column);
      result.push.apply(result, getAllColumns(column.children));
    } else {
      result.push(column);
    }
  });
  return result;
};

const convertToRows = (originColumns: columnType[]) => {
  let maxLevel = 1;
  const traverse = (column: columnType, parent?: columnType) => {
    if (parent) {
      column.level = parent.level + 1;
      if (maxLevel < column.level) {
        maxLevel = column.level;
      }
    }
    if (column.children) {
      let colSpan = 0;
      column.children.forEach((subColumn) => {
        traverse(subColumn, column);
        colSpan += subColumn.colSpan;
      });
      column.colSpan = colSpan;
    } else {
      column.colSpan = 1;
    }
  };

  originColumns.forEach((column) => {
    column.level = 1;
    traverse(column);
  });

  const rows: any[] = [];
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }

  const allColumns = getAllColumns(originColumns);

  allColumns.forEach((column) => {
    if (!column.children) {
      column.rowSpan = maxLevel - column.level + 1;
    } else {
      column.rowSpan = 1;
    }
    rows[column.level - 1].push(column);
  });

  return rows;
};

interface DefaultSort {
  prop: string;
  rule: string;
}

interface MapStates {
  [key: string]: Function
}

@Component({
  components: {
    checkBox
  }
})
export default class tableHeader extends Mixins(LayoutMixin) {
  @Prop()
  fixed!: string;

  @Prop({
    required: true
  })
  store!: storeType;

  @Prop()
  border!: boolean;
  
  @Prop({
    type: Object,
    default() {
      return {
        prop: '',
        rule: ''
      };
    }
  }) 
  defaultSort!: DefaultSort

  get getTable(): any {
    return this.$parent;
  }

  get hasGutter() {
    return this.fixed !== 'right' && this.getTable.gutterWidth;
  }

  get getStates() {
    return mapStates(this, {
      columns: 'columns',
      leftFixedLeafCount: 'leftFixedLeafColumnsLength',
      rightFixedLeafCount: 'rightFixedLeafColumnsLength',
      columnsCount: (states: statesDataType) => states.columns.length,
      leftFixedCount: (states: statesDataType) => states.leftFixedColumns.length,
      rightFixedCount: (states: statesDataType) => states.rightFixedColumns.length,
      isAllSelected: 'isAllSelected',
    }) as MapStates
  }

  get columns() {
    return this.getStates.columns();
  }

  get leftFixedLeafCount() {
    return this.getStates.leftFixedLeafCount();
  }

  get rightFixedLeafCount() {
    return this.getStates.rightFixedLeafCount();
  }

  get columnsCount() {
    return this.getStates.columnsCount();
  }

  get leftFixedCount() {
    return this.getStates.leftFixedCount();
  }

  get rightFixedCount() {
    return this.getStates.rightFixedCount();
  }
  
  get isAllSelected() {
    return this.getStates.isAllSelected();
  }

  mounted() {
    this.$nextTick(() => {
      const { prop, rule } = this.defaultSort;
      if (prop) {
        let theColumn;
        const getColumns = this.columns;
        const len = getColumns.length;
        for (let i = 0; i !== len; ++i) {
          if (getColumns[i].prop === prop) {
            theColumn = getColumns[i];
          }
        }
        if (theColumn) {
          this.store.commit('changeSortCondition', {
            sortingColumn: theColumn,
            sortProp: prop,
            sortRule: rule
          });
        }
      }
    });
  }

  isHidden(index: number, columns: columnType[]) {
    let start = 0;
    for (let i = 0; i < index; i++) {
      start += columns[i].colSpan;
    }
    const after = start + columns[index].colSpan - 1;
    if (this.fixed === 'left') {
      return after >= this.leftFixedLeafCount;
    } else if (this.fixed === 'right') {
      return start < this.columnsCount - this.rightFixedLeafCount;
    } else {
      return (after < this.leftFixedLeafCount) || (start >= this.columnsCount - this.rightFixedLeafCount);
    }
  }

  getCellClass(rowIndex: number, columnIndex: number, columns: columnType[], column: columnType) {
    const classes = [column.id, column.headerAlignType, column.bgColorType];
    if (rowIndex === 0 && this.isHidden(columnIndex, columns)) {
      classes.push('visi-hidden');
    }
    return classes.join(' ');
  }

  checkSortRule(column: columnType, rule: string) {
    const getSortingColumn = this.store.states.sortingColumn;
    const getSortRule = this.store.states.sortRule;
    if (getSortingColumn) {
      return getSortingColumn === column && getSortRule === rule;
    } else {
      return false;
    }
  }

  handleHeaderClick(event: MouseEvent, column: columnType) {
    if (column.sortable) {
      this.handleSortClick(event, column);
    }

    this.getTable.$emit('headerClick', column, event);
  }

  handleSortClick(event: MouseEvent, column: columnType, rule?: string) {
    event.stopPropagation();
    if (!column.sortable) return;
    this.store.commit('changeSortCondition', {
      sortingColumn: column,
      sortProp: column.prop,
      sortRule: rule
    });
  }

  handleCheckboxClick() {
    this.store.commit('changeAllSelect');
  }

  getCellContent(h: CreateElement, column: columnType, columnIndex: number) {
    const store = this.store;
    if (column.renderThCellChild) {
      return (
        column.renderThCellChild.call(
          (this as any)._renderProxy,
          h,
          {
            column,
            rowIndex: columnIndex,
            store: store,
            _self: this.getTable.$vnode.context
          }
        )
      )
    } else if (column.type === 'select') {
      return (
        <check-box
          disabled={store.states.data && store.states.data.length === 0}
          indeterminate={store.states.selectConfig.length > 0 && !this.isAllSelected}
          onChange={this.handleCheckboxClick}
          value={this.isAllSelected} />
      )
    } else if (column.type === 'expand') {
      return column.label || '';
    } else {
      const ele = [];
      if (column.filterPlacement) {
        ele.push(
          <span title={column.filterPlacement}>{column.label}</span>
        );
      } else {
        ele.push(column.label);
      }
      if (column.sortable) {
        ele.push(
          <span class="caret-wrapper"
            on-click={($event: MouseEvent) => this.handleSortClick($event, column)}>
            <i class={["iconfont icon-caret-top", { 'chosen': this.checkSortRule(column, 'asc') }]} on-click={($event: MouseEvent) => this.handleSortClick($event, column, 'asc')}></i>
            <i class={["iconfont icon-caret-bottom", { 'chosen': this.checkSortRule(column, 'desc') }]} on-click={($event: MouseEvent) => this.handleSortClick($event, column, 'desc')}></i>
          </span>
        )
      }
      return ele;
    }
  }

  render(h: CreateElement): VNode {
    const columnRows = convertToRows(this.store.states.originColumns);
    this.getTable.isGroup = columnRows.length > 1 ? true : false;  // 是否拥有多级表头
    return (
      <table
        class="table-header"
        cellspacing="0"
        cellpadding="0"
        border="0">
        <colgroup>
          {
            this.columns.map((column: columnType) => <col name={column.id} key={column.id} />)
          }
          {
            this.hasGutter ? <col name="gutter" /> : ''
          }
        </colgroup>
        <thead>
          {
            (this as any)._l(columnRows, (columns: columnType[], rowIndex: number) =>
              <tr>
                {
                  columns.map((column, columnIndex) => (
                    <th class={this.getCellClass(rowIndex, columnIndex, columns, column)}
                      colspan={column.colSpan}
                      rowspan={column.rowSpan}
                      on-click={($event: MouseEvent) => this.handleHeaderClick($event, column)}
                      key={column.id}>
                      <div class={['cell', { 'sortable': column.sortable }]}>
                        {
                          this.getCellContent(h, column, columnIndex)
                        }
                      </div>
                    </th>))
                }
                {
                  this.hasGutter ? <th class="gutter"></th> : ''
                }
              </tr>
            )
          }
        </thead>
      </table>
    );
  }

}
