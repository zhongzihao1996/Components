/* eslint-disable no-unused-vars */
import { Component, Prop, Vue } from 'vue-property-decorator';
import { CreateElement, VNode } from 'vue';
import { parseWidth, compose, defaultRenderTdCellChild, nestedIconRender } from './common/util';
import checkBox from './common/comp/checkbox.vue';
import {
  columnType,
  RenderParamsType
} from './common/common';

let columnIdSeed = 1;

interface MinDefaultWidthConfig {
  [key: string]: number;
}

interface AllProps {
  [key: string]: string
}

@Component({
  components: {
    checkBox
  }
})
export default class tableColumn extends Vue {

  render(h: CreateElement): VNode {
    return h('div', this.$slots.default);
  }

  isSubColumn: boolean = false;

  columnConfig: AllProps = {};

  columnId: string = '';

  minDefaultWidthConfig: MinDefaultWidthConfig = {
    'default': 60,
    'select': 50,
    'expand': 50,
  }

  @Prop()
  label!: string;

  @Prop()
  prop!: string;

  @Prop()
  width!: number;

  @Prop({
    type: Boolean,
    default: false
  })
  fixedWidthFlag!: boolean;

  @Prop({
    type: String,
    default: 'default'
  })
  type!: string;

  @Prop({
    type: [Boolean, String],
    default: false
  })
  sortable!: boolean | string;

  @Prop({
    type: Boolean,
    default: false
  })
  keepSelectionFlag!: boolean;

  @Prop({
    type: Number,
    default: -1
  })
  maxLength!: number;

  @Prop({
    type: String,
    default: ''
  })
  filterPlacement!: string;

  @Prop({
    type: String,
    default: ''
  })
  bgColorType!: string;

  @Prop({
    type: String,
    default: ''
  })
  headerAlignType!: string;

  @Prop({
    type: String,
    default: ''
  })
  alignType!: string;

  @Prop()
  fixed!: string;

  @Prop()
  formatter!: Function;

  get getTable() {
    let parent: any = this.$parent;
    while (parent && !parent.tableId) {
      parent = parent.$parent;
    }
    return parent;
  }

  get columnOrTableParent() {
    let parent: any = this.$parent;
    while (parent && !parent.tableId && !parent.columnId) {
      parent = parent.$parent;
    }
    return parent;
  }

  created() {
    const parent = this.columnOrTableParent;
    this.isSubColumn = this.getTable !== parent;
    this.columnId = (parent.tableId || parent.columnId) + '_column_' + columnIdSeed++;

    const columnProp = {
      id: this.columnId,
      type: this.type,
      prop: this.prop,
      label: this.label,
      width: this.width,
      fixedWidthFlag: this.fixedWidthFlag,
      fixed: this.fixed,
      headerAlignType: this.headerAlignType,
      alignType: this.alignType,
      bgColorType: this.bgColorType,
      maxLength: this.maxLength,
      keepSelectionFlag: this.keepSelectionFlag,
      filterPlacement: this.filterPlacement,
      formatter: this.formatter,
      // sort 相关属性
      sortable: this.sortable,
      rule: null
    };

    // 通过方法 给column 增加属性/方法（执行的顺序是从右到左）
    const chains = compose(this.setColumnRenders, this.setColumnWidth);
    this.columnConfig = chains(columnProp);

    this.handlePropsWatchers();
  }

  mounted() {
    const getTable = this.getTable;
    const parent = this.columnOrTableParent;
    const children = this.isSubColumn ? parent.$el.children : parent.$refs.hiddenColumns.children;
    const columnIndex = this.getColumnElIndex(children, this.$el);

    getTable.store.commit('insertColumn', this.columnConfig, columnIndex, this.isSubColumn ? parent.columnConfig : null);
  }


  handlePropsWatchers() {
    const allProps: AllProps = {
      type: 'type',
      prop: 'prop',
      label: 'label',
      width: 'width',
      fixedWidthFlag: 'fixedWidthFlag',
      fixed: 'fixed',
      formatter: 'formatter',
      sortable: 'sortable',
      alignType: 'alignType',
      headerAlignType: 'headerAlignType',
      bgColorType: 'bgColorType',
      filterPlacement: 'filterPlacement',
      maxLength: 'maxLength',
    };
    Object.keys(allProps).forEach(key => {
      const columnKey = allProps[key];
      this.$watch(key, (newVal) => {
        this.columnConfig[columnKey] = newVal;
        if (key === 'width') {
          this.columnConfig.realWidth = newVal;
        }
        if (columnKey === 'width' || columnKey === 'fixed') {
          this.getTable.updateColMinWidth();
          this.getTable.updateTable();
          if (columnKey === 'fixed') {
            this.getTable.store.updateColumns();
          }
        }
      });
    });
  }

  getColumnElIndex(children: HTMLCollection, child: Element) {
    return Array.prototype.indexOf.call(children, child);
  }

  // 给column 增加 宽度属性
  setColumnWidth(column: columnType) {
    column.minDefaultWidth = this.minDefaultWidthConfig[this.type]; // 最小默认列宽
    column.width = parseWidth(this.width);            // 指定列宽（未指定则为undefined）
    // 选择列若未定宽，则定最小默认列宽
    if (!column.width && (column.type === 'select' || column.type === 'expand')) {
      column.width = column.minDefaultWidth;
    }
    column.realWidth = column.width || column.minDefaultWidth; // 初始实际宽度
    return column;
  }

  // 给column增加 renderThCellChild 和 renderTdCellChild 方法
  setColumnRenders(column: columnType) {
    // 若有自定义表头的内容
    if (this.$scopedSlots.header) {
      const headerFun = this.$scopedSlots.header;
      column.renderThCellChild = (h: CreateElement, data: RenderParamsType) => {
        return headerFun(data);
      };
    }

    // 展开行的渲染函数
    if (column.type === 'expand') {
      // 展开图标列的渲染函数
      column.renderTdCellChild = (h: CreateElement, data: RenderParamsType) => {
        return defaultRenderTdCellChild(h, data);
      };
      // 展开内容渲染函数
      this.getTable.expandedRender = (h: CreateElement, data: RenderParamsType) => {
        return this.$scopedSlots.default ?
          this.$scopedSlots.default(data)
          :
          this.$slots.default;
      };
    } else {
      column.renderTdCellChild = (h: CreateElement, data: RenderParamsType) => {
        let children = null;
        if (this.$scopedSlots.default) {
          children = this.$scopedSlots.default(data); // 插槽方式
        } else {
          children = defaultRenderTdCellChild(h, data); // 默认渲染方式
        }
        const nestedIcon = nestedIconRender(h, data);
        return ([nestedIcon, children]);
      };
    }
    return column;
  }

  destroyed() {
    if (!this.$parent) return;
    const parent: any = this.$parent;
    this.getTable.store.commit('removeColumn', this.columnConfig, this.isSubColumn ? parent.columnConfig : null);
  }
}
