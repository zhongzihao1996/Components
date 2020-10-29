/* eslint-disable no-unused-vars */
import { removeClass, addClass, debounce, getValueByKey, getCell, getColumnByCell } from './common/util';
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import LayoutMixin from './layout-mixin';
import { mapStates } from './store/store-api';
import checkBox from './common/comp/checkbox.vue';
import { CreateElement, VNode } from 'vue';
import {
  columnType,
  statesDataType,
  storeType,
  NestedRenderData,
  RowType,
  RenderParamsType
} from './common/common';

interface MapStates {
  [key: string]: Function
}

@Component({
  components: {
    checkBox
  }
})
export default class tableBody extends Mixins(LayoutMixin) {
  @Prop()
  fixed!: string;

  @Prop({
    required: true
  })
  store!: storeType;

  get getTable(): any {
    return this.$parent;
  }

  get firstDefaultColumnIndex() {
    return this.columns.findIndex((column: columnType) => {
      return column.type === 'default';
    })
  }

  get getStates() {
    return mapStates(this, {
      data: 'data',
      hoverRowIndex: 'hoverRowIndex',
      indent: 'indent',
      columns: 'columns',
      leftFixedLeafCount: 'leftFixedLeafColumnsLength',
      rightFixedLeafCount: 'rightFixedLeafColumnsLength',
      columnsCount: (states: statesDataType) => states.columns.length,
      leftFixedCount: (states: statesDataType) => states.leftFixedColumns.length,
      rightFixedCount: (states: statesDataType) => states.rightFixedColumns.length,
      hasExpandColumn: (states: statesDataType) => states.columns.some(({ type }) => type === 'expand')
    }) as MapStates
  }

  get getData() {
    return this.getStates.data();
  }

  get hoverRowIndex() {
    return this.getStates.hoverRowIndex();
  }

  get indent() {
    return this.getStates.indent();
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

  get hasExpandColumn() {
    return this.getStates.hasExpandColumn();
  }

  @Watch('hoverRowIndex')
  onHoverRowIndexChange(newVal: number, oldVal: number) {
    if (!this.store.states.isFixed) return;
    const rows = this.$el.querySelectorAll('.tr');
    const oldRow = rows[oldVal];
    const newRow = rows[newVal];
    if (oldRow) {
      removeClass(oldRow, 'hand-hover');
    }
    if (newRow) {
      addClass(newRow, 'hand-hover');
    }
  }


  isHidden(columnIndex: number) {
    if (this.fixed === 'left') {
      // 左固定列表的不固定列隐藏
      return columnIndex >= this.leftFixedLeafCount;
    } else if (this.fixed === 'right') {
      // 右固定列表的不固定列隐藏
      return columnIndex < this.columnsCount - this.rightFixedLeafCount;
    } else {
      // 正常列表的固定列隐藏
      return (columnIndex < this.leftFixedLeafCount) || (columnIndex >= this.columnsCount - this.rightFixedLeafCount);
    }
  }

  getCellMerge(row: RowType, column: columnType, rowIndex: number, columnIndex: number) {
    let rowspan = 1;
    let colspan = 1;
    const mergeCellConfig = this.getTable.mergeCellConfig;
    if (typeof mergeCellConfig === 'function') {
      const result = mergeCellConfig({ row, column, rowIndex, columnIndex });
      if (result && typeof result === 'object') {
        rowspan = result.rowspan;
        colspan = result.colspan;
      }
    }
    return { rowspan, colspan };
  }

  // tr行标签的key（若有配置rowKey则为rowKey，无则为rowIndex）
  getKeyOfRow(row: RowType, index: number) {
    const rowKey = this.getTable.rowKey;
    if (rowKey) {
      return getValueByKey(row, rowKey);
    }
    return index;
  }

  getRowClass(row: RowType) {
    const classes = ['tr'];
    if (this.store.states.expandRows.indexOf(row) > -1) {
      classes.push('expanded');
    }
    return classes;
  }

  getCellClass(rowIndex: number, columnIndex: number, row: RowType, column: columnType) {
    const classes = [column.id, column.alignType];

    if (this.isHidden(columnIndex)) {
      classes.push('visi-hidden');
    }

    const { classNameConfig } = this.getTable;
    if (typeof classNameConfig === 'string') {
      classes.push(classNameConfig);
    } else if (typeof classNameConfig === 'function') {
      classes.push(classNameConfig.call(null, { rowIndex, columnIndex, row, column }));
    }

    return classes.join(' ');
  }

  getColspanRealWidth(columns: columnType[], colspan: number, index: number) {
    if (colspan < 1) {
      return columns[index].realWidth;
    }
    const widthArr = columns.map(({ realWidth }) => realWidth).slice(index, index + colspan);
    return widthArr.reduce((acc, width) => acc + width, -1);
  }

  handleMouseEnter(index: number) {
    const that = this;
    debounce(30, () => {
      that.store.commit('setHoverRowIndex', index);
    })();
  }

  handleMouseLeave() {
    const that = this;
    debounce(30, () => {
      that.store.commit('setHoverRowIndex', null);
    })();
  }

  handleClick(event: MouseEvent, row: RowType) {
    const table = this.getTable;
    const cell = getCell(event);
    let column;
    if (cell) {
      column = getColumnByCell(table, cell);
      if (column) {
        table.$emit('cellClick', row, column, cell, event);
      }
    }
    table.$emit('rowClick', row, column, event);
  }

  defaultRender(h: CreateElement, row: RowType, rowIndex: number, nestedRenderData?: NestedRenderData) {
    const { columns } = this;
    const columnsHidden = columns.map((column: columnType, index: number) => this.isHidden(index));
    const rowClasses = this.getRowClass(row);
    let display = true;
    // 若有嵌套节点增加class和初始化是否展示
    if (nestedRenderData) {
      rowClasses.push('level-' + nestedRenderData.level);
      display = nestedRenderData.display;
    }
    let displayStyle = display ? null : { display: 'none' };
    return (
      <tr
        class={rowClasses}
        style={displayStyle}
        key={this.getKeyOfRow(row, rowIndex)}
        on-click={($event: MouseEvent) => this.handleClick($event, row)}
        on-mouseenter={() => this.handleMouseEnter(rowIndex)}
        on-mouseleave={this.handleMouseLeave}>
        {
          columns.map((column: columnType, columnIndex: number) => {
            const { rowspan, colspan } = this.getCellMerge(row, column, rowIndex, columnIndex);
            if (!rowspan || !colspan) {
              return null;
            }
            const columnData = { ...column };
            columnData.realWidth = this.getColspanRealWidth(columns, colspan, columnIndex);
            const params: RenderParamsType = {
              store: this.store,
              _self: this.getTable.$vnode.context,
              column: columnData,
              row,
              rowIndex,
            };
            // 有嵌套行且当前列为嵌套行的第一列，增加nestedNode属性（用于渲染nestedIcon）
            if (columnIndex === this.firstDefaultColumnIndex && nestedRenderData) {
              params.nestedNode = {
                level: nestedRenderData.level,
                indent: nestedRenderData.level * this.indent
              };
              if (typeof nestedRenderData.expanded === 'boolean') {
                params.nestedNode.expanded = nestedRenderData.expanded;
                // 懒加载
                if ('loading' in nestedRenderData) {
                  params.nestedNode.loading = nestedRenderData.loading;
                }
                if ('noLazyChildren' in nestedRenderData) {
                  params.nestedNode.noLazyChildren = nestedRenderData.noLazyChildren;
                }
              }
            }
            return (
              <td
                class={this.getCellClass(rowIndex, columnIndex, row, column)}
                rowspan={rowspan}
                colspan={colspan}>
                <div class="cell">
                  {
                    column.renderTdCellChild.call(
                      (this as any)._renderProxy,
                      this.$createElement,
                      params,
                      columnsHidden[columnIndex]
                    )
                  }
                </div>
              </td>
            );
          })
        }
      </tr>
    );
  }

  getRenderData(h: CreateElement, row: RowType, rowIndex: number): any {
    const { checkRowExpanded } = this.store;
    const { rowKey, rowKey2, nestedData, lazyNodeMap } = this.store.states;
    // 行展开渲染自定义内容(type="expand")
    if (this.hasExpandColumn && checkRowExpanded(row)) {
      const expandedRender = this.getTable.expandedRender;
      const tr = this.defaultRender(h, row, rowIndex);
      if (!expandedRender) {
        return tr;
      } else {
        return [
          [
            tr,
            <tr key={'expanded-row-' + tr.key}>
              <td colspan={this.columnsCount} class="expanded-content">
                {expandedRender(this.$createElement, { row, rowIndex, store: this.store })}
              </td>
            </tr>
          ]
        ];
      }
    }
    // 行展开渲染嵌套行数据
    else if (Object.keys(nestedData).length) {
      const key = getValueByKey(row, rowKey) + (rowKey2 ? `${getValueByKey(row, rowKey2)}` : '');
      let cursor = nestedData[key];
      let nestedRenderData: NestedRenderData | null = null;
      if (cursor) {
        nestedRenderData = {
          expanded: cursor.expanded,
          level: cursor.level,
          display: true
        };
        if (typeof cursor.lazyLoad === 'boolean') {
          if (typeof cursor.loaded === 'boolean' && cursor.loaded) {
            nestedRenderData.noLazyChildren = !(cursor.children && cursor.children.length);
          }
          nestedRenderData.loading = cursor.loading;
        }
      }
      // 加入嵌套首层渲染数据
      const tmp = [this.defaultRender(h, row, rowIndex, nestedRenderData as NestedRenderData)];
      // 遍历子层逐层加入渲染嵌套数据
      if (cursor) {
        let i = 0;
        const dig = (parent: NestedRenderData, children: RowType[]) => {
          if (!(children && children.length && parent)) return;
          children.forEach(node => {
            const childNestedRenderData: NestedRenderData = {
              display: parent.display && (parent.expanded as boolean),
              level: parent.level + 1
            };
            const childKey = getValueByKey(node, rowKey) + (rowKey2 ? `${getValueByKey(node, rowKey2)}` : '');
            if (childKey === undefined || childKey === null) {
              console.log('嵌套子节点缺少rowkey');
            }
            cursor = { ...nestedData[childKey] };
            // 若当前节点还有子节点
            if (cursor) {
              childNestedRenderData.expanded = cursor.expanded;
              // 懒加载的某些节点，level 未知
              cursor.level = cursor.level || childNestedRenderData.level;
              // 子节点的 display 属性由它本身的 expanded 与 display 共同决定
              cursor.display = !!(cursor.expanded && childNestedRenderData.display);
              // 懒加载
              if (typeof cursor.lazyLoad === 'boolean') {
                if (typeof cursor.loaded === 'boolean' && cursor.loaded) {
                  childNestedRenderData.noLazyChildren = !(cursor.children && cursor.children.length);
                }
                childNestedRenderData.loading = cursor.loading;
              }
            }
            i++;
            // 加入嵌套子层渲染数据
            tmp.push(this.defaultRender(h, node, rowIndex + i, childNestedRenderData));
            if (cursor) {
              const nodes = lazyNodeMap[childKey] || node.children;
              dig(cursor, nodes as RowType[]);
            }
          });
        };
        // 第一行display为true
        cursor.display = true;
        const nodes = lazyNodeMap[key] || row.children;
        dig(cursor, nodes as RowType[]);
      }
      return tmp;
    }
    else {
      return this.defaultRender(h, row, rowIndex);
    }
  }

  render(h: CreateElement): VNode {
    const data = this.getData || [];
    return (
      <table class="table-body" cellspacing="0" cellpadding="0" border="0">
        <colgroup>
          {
            this.columns.map((column: columnType) => <col name={column.id} key={column.id} />)
          }
        </colgroup>
        <tbody>
          {
            data.reduce((acc: VNode[], row: RowType) => {
              return acc.concat(this.getRenderData(h, row, acc.length));
            }, [])
          }
        </tbody>
      </table>
    );
  }
}
