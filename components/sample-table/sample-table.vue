<template>
  <div class="sample-table" :style="{border:border + 'px solid transparent'}" v-loading="isloading">
    <div class="scroll-overflow" :style="{paddingLeft:fixedTableLeftWidth+'px'}">
      <table class="scroll-table" :width="tableWidth" ref="scrollTable" :style="{borderRight:fixedTableRightWidth+'px solid transparent'}">
        <thead>
          <slot name="header"></slot>
        </thead>
        <tbody>
          <slot name="fixed"></slot>
          <template v-for="(item,index) in list">
            <slot :row="item" :index="index" name="body"></slot>
          </template>
          <slot name="append"></slot>
        </tbody>
      </table>
    </div>
    <table class="fixed-table fixed-table-left" ref="fixedTableLeft">
      <thead>
      </thead>
      <tbody></tbody>
    </table>
    <table class="fixed-table fixed-table-right" ref="fixedTableRight">
      <thead>
      </thead>
      <tbody></tbody>
    </table>
    <div class="empty" v-if="isempty">
      <slot name="empty">暂无数据</slot>
    </div>
  </div>
</template>

<script>
import utils from '../utils';
export default {
  props: {
    raws: {
      type: Array //原始数据[滚动加载]
    },
    data: {
      type: Array, //原始数据
      required: true
    },
    border: {
      type: Number,
      default: 0
    },
    isloading: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '100%'
    },
    fixedable: {
      type: Boolean,
      default: false
    },
    sortcustom: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sortProp: '',
      sortOrder: '',
      filteProp: '',
      filteOptions: [],
      busy: true,
      exporting: false,
      selections: [],
      fixedTableLeftWidth: 0,
      fixedTableRightWidth: 0
    };
  },
  computed: {
    list() {
      //数据源（小于等于原始数据，大于等于当前数据）
      let arr = JSON.parse(JSON.stringify(this.data));
      if (this.filteOptions.length > 0) {
        arr = arr.filter(o => this.filteOptions.includes(o[this.filteProp]));
      }
      if (this.sortProp && this.sortOrder && !this.sortcustom) {
        arr = utils.orderBy(arr, this.sortProp, this.sortOrder);
      }
      return arr;
    },
    isempty() {
      return this.list.length === 0 && !('fixed' in this.$slots);
    },
    tableWidth() {
      if (typeof this.width === 'number') {
        return (
          this.width - this.fixedTableLeftWidth - this.fixedTableRightWidth
        );
      } else {
        return this.width;
      }
    }
  },
  methods: {
    sortChange(prop) {
      if (prop === this.sortProp) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortProp = prop;
        this.sortOrder = 'asc';
      }
      this.$emit('afterSortChange', {
        sortProp: this.sortProp,
        sortOrder: this.sortOrder
      });
    },
    filteChange(filters) {
      this.filteProp = filters.prop;
      this.filteOptions = filters.groups;
      this.$emit('afterFilteChange', {
        filteProp: this.filteProp,
        filteOptions: this.filteOptions
      });
    },
    selectionChange(param) {
      if (typeof param === 'boolean') {
        let list = [];
        if (param) {
          for (let i = 0; i < this.data.length; i++) {
            list.push(i);
          }
        } else {
          list = [];
        }
        this.selections = list;
      } else if (typeof param === 'object') {
        let index = this.selections.indexOf(param.index);
        if (index > -1) {
          this.selections.splice(index, 1);
        }
        if (param.checked) {
          this.selections.push(param.index);
        }
      }
      this.$emit('selectionChange', this.selections);
    },

    /**
     * 清除选中（外部调用）
     */
    clearSelection() {
      this.selections = [];
    },

    /**
     * 设置选择项（外部调用）
     */
    setSelection(indexs) {
      if (indexs instanceof Array) {
        this.selections = JSON.parse(JSON.stringify(indexs));
      } else if (typeof indexs === 'number') {
        this.selections = [indexs];
      }
    },

    /**
     * 动态设置浮动table（先判断是否有冻结列以及先找好位置）
     * 优化思路
     * 目前：每次更新list时重新生成dom节点，覆盖原先fixed的table内容
     * 缺点：每一行每一列都需要重新渲染一遍，而且clientHeight比较影响性能
     * 优化：避免全量渲染fixedTable，只更新变化的节点
     */
    createFixedTable() {
      let thead_l = document.createElement('thead');
      let thead_r = document.createElement('thead');
      let tbody_l = document.createElement('tbody');
      let tbody_r = document.createElement('tbody');
      let fixedTableLeft = this.$refs['fixedTableLeft'];
      let fixedTableRight = this.$refs['fixedTableRight'];
      let averageHeight = this.getTableAverageHeight(); //获取平均高度，判断是否跳过高度获取
      this.$children.forEach($tr => {
        let tr_l = document.createElement('tr');
        let tr_r = document.createElement('tr');
        let tr_height = averageHeight
          ? averageHeight
          : $tr.$el.style.height || $tr.$el.clientHeight + 'px'; //获取高度这句代码明显降低的性能
        tr_l.className = 'tr';
        tr_r.className = 'tr';
        tr_l.style.height = tr_height;
        tr_r.style.height = tr_height;
        $tr.$el.style.height = tr_height;
        if (/^.*-SampleTableHeader$/gi.test($tr.$vnode.tag)) {
          $tr.$children.forEach(($th, $th_index) => {
            if (['left', 'right'].includes($th.fixed)) {
              let th_width = $th.$el.style.width || $th.$el.clientWidth + 'px';
              $th.$el.style.width = th_width;
              if ($th.fixed === 'left') {
                tr_l.appendChild($th.$el);
              } else {
                tr_r.appendChild($th.$el);
              }
              thead_l.appendChild(tr_l);
              thead_r.appendChild(tr_r);
            }
          });
        }
        if (/^.*-SampleTableBody$/gi.test($tr.$vnode.tag)) {
          $tr.$children.forEach($td => {
            if (['left', 'right'].includes($td.fixed)) {
              if ($td.fixed === 'left') {
                tr_l.appendChild($td.$el);
              } else {
                tr_r.appendChild($td.$el);
              }
            }
          });
          tbody_l.appendChild(tr_l);
          tbody_r.appendChild(tr_r);
        }
      });
      fixedTableLeft.replaceChild(
        thead_l,
        fixedTableLeft.querySelector('thead')
      );
      fixedTableLeft.replaceChild(
        tbody_l,
        fixedTableLeft.querySelector('tbody')
      );
      fixedTableRight.replaceChild(
        thead_r,
        fixedTableRight.querySelector('thead')
      );
      fixedTableRight.replaceChild(
        tbody_r,
        fixedTableRight.querySelector('tbody')
      );
      this.fixedTableLeftWidth = fixedTableLeft.clientWidth;
      this.fixedTableRightWidth = fixedTableRight.clientWidth;
    },

    /**
     * 获取表格平均高度
     */
    getTableAverageHeight() {
      let height = 0;
      let tbody = this.$refs.scrollTable.querySelector('tbody');
      let trs = this.$refs.scrollTable.querySelectorAll('tbody>tr.tr');
      if (trs.length > 0) {
        let trHeight = trs[0].clientHeight;
        if (tbody.clientHeight === trHeight * trs.length) {
          height = trHeight + 'px';
        }
      }
      return height;
    }
  },
  watch: {
    list() {
      this.$nextTick(() => {
        if (this.fixedable) {
          this.createFixedTable();
        }
      });
    }
  }
};
</script>

<style lang="less">
.sample-table {
  line-height: normal;
  position: relative;
  z-index: 0;
  overflow: hidden;
  .scroll-overflow {
    overflow: auto;
    box-sizing: border-box;
    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background: #7d7d7d;
    }
    &::-webkit-scrollbar-track {
      border-radius: 0;
      background: rgba(0, 0, 0, 0.1);
    }
  }
  > table,
  .scroll-table {
    border-collapse: collapse;
    text-align: center;
    font-size: 12px;
    color: #303133;
    thead {
      tr {
        background: #5f9cce;
        th {
          color: #fff;
          cursor: default;
          div.sortable {
            span.caret-wrapper {
              i.el-icon-caret-top,
              i.el-icon-caret-bottom {
                color: rgba(255, 255, 255, 0.5);
                &.current {
                  color: #fff;
                }
              }
            }
          }
        }
      }
    }
    tbody {
      color: #606266;
      > tr {
        transform: translate3d(0, 0, 0); // 使用GPU渲染加速
        td.expand {
          cursor: pointer;
        }
        &.tr:nth-child(even) {
          background: #fafafa;
        }
        &.tr:hover {
          background: #ecf5ff;
        }
      }
      > .expand_content {
        display: table-row;
      }
    }
    th,
    td {
      border: 1px solid #ebeef5;
      padding: 6px 0 7px 0;
    }
  }
  table.scroll-table {
    position: relative;
    z-index: 0;
    box-sizing: border-box;
    min-width: 100%;
  }
  table.fixed-table {
    position: absolute;
    z-index: 10;
    top: 0;
    background: #fff;
    &.fixed-table-left {
      box-shadow: 1px -1px 8px 1px #d3d4d6;
      left: 0;
    }
    &.fixed-table-right {
      box-shadow: -2px -1px 8px 1px #d3d4d6;
      right: 0;
    }
  }
  div.empty {
    padding: 25px 0;
    font-size: 12px;
    text-align: center;
    background: #fff;
    border: 1px solid #ebeef5;
  }
}
</style>
