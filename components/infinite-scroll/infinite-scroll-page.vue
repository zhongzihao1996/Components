<template>
  <div class="infinite-scroll-page" v-infinite-scroll="scrollLoad" infinite-scroll-disabled="busy" infinite-scroll-distance="500" ref="infinite">
    <slot name="header"></slot>
    <div :style="{padding:padding}">
      <table class="scroll-table">
        <thead>
          <slot name="main"></slot>
        </thead>
        <tbody>
          <slot name="fixed"></slot>
          <tr v-for="(item,index) in list" :key="'tr_'+index">
            <td v-for="(cell,tdIndex) in columns" :key="'td_'+index+'_'+tdIndex">
              {{findAttr(item,cell.prop)}}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="empty" v-if="isempty">
        <slot name="empty">暂无数据</slot>
      </div>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script>
import utils from '../utils';
export default {
  //todo 还需要插入内容和可选、序号
  props: {
    raws: {
      type: Array,
      required: true
    },
    step: {
      type: Number,
      default: 100
    },
    padding: {
      type: String,
      default: '20px'
    }
  },
  data() {
    return {
      sortProp: '',
      sortOrder: '',
      filteProp: '',
      filteOptions: [],
      list: [],
      busy: true,
      columns: []
    };
  },
  computed: {
    data() {
      let arr = JSON.parse(JSON.stringify(this.raws));
      if (this.filteOptions.length > 0) {
        arr = arr.filter(o => this.filteOptions.includes(o[this.filteProp]));
      }
      if (this.sortProp && this.sortOrder) {
        arr = utils.orderBy(arr, this.sortProp, this.sortOrder);
      }
      return arr;
    },
    isempty() {
      return this.list.length === 0 && !('fixed' in this.$slots);
    }
  },
  mounted() {
    document.body.parentNode.style.overflowY = 'hidden';
  },
  destroyed() {
    document.body.parentNode.style.overflowY = 'auto';
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.list = [];
        this.busy = false;
        this.scrollLoad();
      });
    },
    scrollLoad() {
      this.busy = true;
      if (this.raws.length === 0 || this.list.length === this.data.length) {
        return false;
      }
      let start = this.list.length === 0 ? 0 : this.list.length - 1;
      let tmp = this.data.slice(start, start + this.step);
      if (tmp.length > 0) {
        this.list.push(...tmp);
        this.$nextTick(() => {
          this.busy = false;
        });
      }
    },
    sortChange(prop) {
      if (prop === this.sortProp) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortProp = prop;
        this.sortOrder = 'asc';
      }
      this.init();
      this.$emit('afterSortChange', {
        sortProp: this.sortProp,
        sortOrder: this.sortOrder
      });
    },
    filteChange(filters) {
      this.filteProp = filters.prop;
      this.filteOptions = filters.groups;
      this.init();
      this.$emit('afterFilteChange', {
        filteProp: this.filteProp,
        filteOptions: this.filteOptions
      });
    },
    findAttr(obj, key) {
      let val = '';
      key.split('.').forEach(k => {
        val = val === '' ? obj[k] : val[k];
      });
      return val || '　';
    },
    setColumns() {
      let arr = [];
      this.$slots.main.forEach(uo => {
        if (/^.*-infinite-scroll-column-group$/gi.test(uo.tag)) {
          uo.componentOptions.children.forEach(item => {
            if (/^.*-infinite-scroll-column$/gi.test(item.tag)) {
              if ('prop' in item.componentOptions.propsData) {
                arr.push(item.componentOptions.propsData);
              }
            }
          });
        }
      });
      this.columns = arr;
    }
  },
  watch: {
    raws() {
      if (this.raws.length > 0) {
        this.setColumns();
        this.init();
      }
    }
  }
};
</script>

<style lang="less">
.infinite-scroll-page {
  max-height: calc(100vh - 50px);
  overflow-y: auto;
  table.scroll-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
    font-size: 12px;
    color: #303133;
    thead {
      tr {
        background: #f5f7fa;
        th {
          cursor: default;
        }
      }
    }
    tbody {
      tr {
        transform: translate3d(0, 0, 0); // 使用GPU渲染加速
        &:nth-child(even) {
          background: #fafafa;
        }
        &:hover {
          background: #ecf5ff;
        }
      }
    }
    th,
    td {
      border: 1px solid #ebeef5;
      padding: 6px 0 7px 0;
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

