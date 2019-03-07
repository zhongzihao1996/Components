<template>
  <div class="infinite-table" v-infinite-scroll="scrollLoad" v-infinite-scroll-disabled="busy" v-infinite-scroll-distance="500" ref="infinite">
    <slot name="top"></slot>
    <sample-table ref="sampleTable" :raws="raws" :data="list" :border="border" :isloading="isloading" :width="width" :fixedable="fixedable" sortcustom @afterSortChange="sortChange" @afterFilteChange="filteChange" @selectionChange="selectionChange">
      <template slot="header">
        <slot name="header"></slot>
      </template>
      <slot name="fixed" slot="fixed"></slot>
      <template slot-scope="scope" slot="body">
        <slot :row="scope.row" :index="scope.index" name="body"></slot>
      </template>
      <template slot="append">
        <slot name="append"></slot>
      </template>
      <template slot="empty">
        <slot name="empty">暂无数据</slot>
      </template>
    </sample-table>
    <slot name="bottom"></slot>
  </div>
</template>

<script>
import utils from '../utils';
var exportCallback = null;
export default {
  props: {
    raws: {
      type: Array, //原始数据
      required: true
    },
    step: {
      type: Number,
      default: 100
    },
    border: {
      type: Number,
      default: 20
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
    },
  },
  data() {
    return {
      sortProp: '',
      sortOrder: '',
      filteProp: '',
      filteOptions: [],
      list: [], //当前数据
      busy: true,
      exporting: false
    };
  },
  computed: {
    data() {
      //数据源（小于等于原始数据，大于等于当前数据）
      let arr = JSON.parse(JSON.stringify(this.raws));
      if (this.filteOptions.length > 0) {
        arr = arr.filter(o => this.filteOptions.includes(o[this.filteProp]));
      }
      if (this.sortProp && this.sortOrder && !this.sortcustom) {
        arr = utils.orderBy(arr, this.sortProp, this.sortOrder);
      }
      return arr;
    }
  },
  mounted() {
    this.init();
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
      let start = this.list.length;
      let tmp = this.data.slice(start, start + this.step);
      if (tmp.length > 0) {
        this.list.push(...tmp);
        this.$nextTick(() => {
          this.busy = false;
        });
      }
    },
    sortChange({ sortProp, sortOrder }) {
      if (sortProp === this.sortProp) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortProp = sortProp;
        this.sortOrder = 'asc';
      }
      if (!this.sortcustom) {
        this.init();
      }
      this.$emit('afterSortChange', {
        sortProp: this.sortProp,
        sortOrder: this.sortOrder
      });
    },
    filteChange({ filteProp, filteOptions }) {
      this.filteProp = filteProp;
      this.filteOptions = filteOptions;
      this.init();
      this.$emit('afterFilteChange', {
        filteProp: this.filteProp,
        filteOptions: this.filteOptions
      });
    },
    selectionChange(indexs) {
      this.$emit('selectionChange', indexs);
    },

    /**
     * 清除选中（外部调用&转发）
     */
    clearSelection() {
      this.$refs['sampleTable'].clearSelection();
    },

    /**
     * 设置选择项（外部调用&转发）
     */
    setSelection(indexs) {
      this.$refs['sampleTable'].setSelection(indexs);
    },

    /**
     * 全量渲染（外部调用）
     * @ callback 渲染完成的回调
     */
    renderingFull(callback) {
      this.exporting = true;
      this.list = JSON.parse(JSON.stringify(this.data)); //确保一定触发渲染
      exportCallback = callback;
    }
  },
  watch: {
    raws() {
      if (this.raws.length > 0) {
        this.init();
      }
    },
    list() {
      this.$nextTick(() => {
        if (this.exporting && typeof exportCallback === 'function') {
          this.exporting = false;
          exportCallback();
          exportCallback = null;
        }
      });
    }
  }
};
</script>

<style lang="less">
.infinite-table {
  max-height: calc(100vh - 50px);
  overflow-y: auto;
  position: relative;
  line-height: normal;
}
</style>

