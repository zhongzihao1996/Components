import { Component, Vue } from 'vue-property-decorator';
// eslint-disable-next-line no-unused-vars
import { columnType } from './common/common';

interface ColumnsMap {
  [id: string]: columnType;
}

@Component
export default class LayoutMixins extends Vue {
  getTable: any;
  created() {
    this.getTable.addObserver(this);
  }

  destroyed() {
    this.getTable.removeObserver(this);
  }

  mounted() {
    this.updateColWidth();
    this.handleGutter();
  }

  updated() {
    this.updateColWidth();
    this.handleGutter();
  }

  updateColWidth() {
    const cols = this.$el.querySelectorAll('colgroup > col');
    if (!cols.length) return;
    const flattenColumns = this.getTable.columns;
    const columnsMap: ColumnsMap = {};
    flattenColumns.forEach((column: columnType) => {
      columnsMap[column.id] = column;
    });
    for (let i = 0, j = cols.length; i < j; i++) {
      const col = cols[i];
      const name = col.getAttribute('name');
      const column = columnsMap[name as string];
      if (column) {
        col.setAttribute('width', `${column.realWidth || column.width}`);
      }
    }
  }

  handleGutter() {
    const cols = this.$el.querySelectorAll('colgroup > col[name=gutter]');
    for (let i = 0, j = cols.length; i < j; i++) {
      const col = cols[i];
      col.setAttribute('width', this.getTable.scrollY ? this.getTable.gutterWidth : '0');
    }
    const ths = this.$el.querySelectorAll('th.gutter') as NodeListOf<HTMLElement>;
    for (let i = 0, j = ths.length; i < j; i++) {
      const th = ths[i];
      th.style.width = this.getTable.scrollY ? this.getTable.gutterWidth + 'px' : '0';
      th.style.display = this.getTable.scrollY ? '' : 'none';
    }
  }
}
