<template>
  <div class="table-box-container"
       :class="{'noTableBorder': noTableBorder, 'noTableBorderX': noTableBorderX, 'noTableBorderY': noTableBorderY}"
       :style="{height: tableHeight+'px'}"
       @mouseleave="handleMouseLeave($event)">

    <div class="hidden-columns" ref="hiddenColumns"><slot></slot></div>

    <div class="table-header-wrapper" ref="headerWrapper">
      <table-header ref="tableHeader" 
                    :store="store"
                    :style="{ width: headerWidth? headerWidth + 'px' : ''}"
                    :default-sort="defaultSort">
      </table-header>
    </div>

    <div class="table-body-wrapper" :class="{'horScroll': scrollX}" :style="[showBodyHeight]" ref="bodyWrapperDom" >
      <table-body :store="store" :style="{ width: bodyWidth? bodyWidth + 'px' : '' }">
      </table-body>
      <div class="empty-table-box"
           :style="{ width: bodyWidth? bodyWidth + 'px' : '' }"
           v-if="isEmpty">
        <p class="empty-text">暂无数据</p>
      </div>
    </div>

    <div class="fixed-table-container left"
        :class="[scrollX ? `scroll-${scrollPosition}` : '']"
        :style="[{ width: leftFixedWidth ? leftFixedWidth + 'px' : ''}, showFixedHeight]"
        ref="leftFixedWrapper"
        v-if="leftFixedColumns.length > 0">
      <div class="fixed-table-header-wrapper left" ref="fixedHeaderWrapper">
        <table-header fixed="left" :store="store" :style="{ width: headerWidth? headerWidth + 'px' : ''}" ref="leftFixedTableHeader">
        </table-header>
      </div>

      <div class="fixed-table-body-wrapper left" ref="leftFixedBodyWrapper"
        :style="[{ top: headerHeight + 'px' }, showFixedBodyHeight]">
        <table-body fixed="left" :store="store" :style="{ width: bodyWidth? bodyWidth + 'px' : '' }">
        </table-body>
      </div>
    </div>

    <div class="fixed-table-container right"
        :class="[scrollX ? `scroll-${scrollPosition}` : '']"
        :style="[{
          width: rightFixedWidth ? rightFixedWidth + 'px' : '',
          right: scrollY ? (gutterWidth || 0) + 'px' : ''
        }, showFixedHeight]"
        ref="rightFixedWrapper"
        v-if="rightFixedColumns.length > 0">
      <div class="fixed-table-header-wrapper right" ref="rightFixedHeaderWrapper">
        <table-header fixed="right" :store="store" :style="{ width: headerWidth? headerWidth + 'px' : '' }"
          ref="rightFixedTableHeader">
        </table-header>
      </div>
      <div class="fixed-table-body-wrapper right" ref="rightFixedBodyWrapper"
          :style="[{ top: headerHeight + 'px' }, showFixedBodyHeight]">
        <table-body fixed="right" :store="store" :style="{ width: bodyWidth? bodyWidth + 'px' : '' }">
        </table-body>
      </div>
    </div>

    <div v-if="rightFixedColumns.length > 0" class="fixed-right-gutter" ref="rightFixedPatch"
      :style="{
        width: scrollY ? gutterWidth + 'px' : '0',
        height: headerHeight + 'px'
      }"></div>

    <transition name="top-icon-transition">
      <i class="iconfont back-top-icon" @click="backToTop()" v-show="showTopIcon">&#xe68d;</i>
    </transition>

    <div class="loading-mask" v-show="loadingFlag">
      <span class="loading-div">
        <i class="iconfont icon-laoding"></i>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
  /* eslint-disable no-unused-vars */
  import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
  import normalizeWheel from 'normalize-wheel';
  import { addResizeListener, removeResizeListener } from './common/resize-event';
  import { debounce, throttle, isFirefox } from './common/util';
  import { createStore } from './store/store-api';
  import TableHeader from './table-header';
  import TableBody from './table-body';
  import {
    columnType,
    statesDataType,
    storeType
  } from './common/common';
  
  interface TableDataType {
    [propName: string]: string | number;
  }

  interface HeaderBodyVue extends Vue {
    updateColWidth?: Function;
    handleGutter?: Function;
  }

  @Component({ 
    name: 'tableBox',
    components: {
      TableHeader,
      TableBody,
    } 
  })
  export default class tableBox extends Vue {
    $refs!: {
      bodyWrapperDom: HTMLElement;
      leftFixedWrapper: HTMLElement;
      rightFixedWrapper: HTMLElement;
      headerWrapper: HTMLElement;
      leftFixedBodyWrapper: HTMLElement;
      rightFixedBodyWrapper: HTMLElement;
    }

    @Prop({ 
      type: Array,
      required: true,
      default: function() {
          return [];
      } 
    })
    data!: Array<TableDataType>;
    @Prop({ type: Number }) tableHeight!: number;
    @Prop({ type: Boolean, default: false }) loadingFlag!: boolean;
    @Prop([ String, Function ]) rowKey!: null;
    @Prop({ type: String }) rowKey2!: null;
    @Prop({ type: Boolean, default: false }) expandAllFlag!: boolean;
    @Prop({ type: Boolean, default: false }) lazyLoad!: boolean;
    @Prop({ type: Function }) loadFun!: null;
    @Prop({ type: Boolean, default: false }) noTableBorder!: boolean;
    @Prop({ type: Boolean, default: false }) noTableBorderX!: boolean;
    @Prop({ type: Boolean, default: false }) noTableBorderY!: boolean;
    @Prop({ type: Object }) defaultSort!: null;
    @Prop([ String, Function ]) classNameConfig!: null;
    @Prop({ type: Function }) mergeCellConfig!: null;

    // data
    store: storeType = createStore(this, {});
    tableId: string = 'table-box';
    currentWidth: number | null = null;
    currentHeight: number | null = null;
    isGroup: boolean = false;  // 是否拥有多级表头
    scrollPosition: string = 'left';
    initFlag: boolean = false;
    mouseWheelEventName: string = '';
    showTopIcon: boolean = false;  // 是否显示回到顶部按钮
    // layout
    observers: Array<Vue> = [];
    scrollX: boolean = false;
    scrollY: boolean = false;
    colMinWidth: number | null = null; // 初始化后不变
    bodyWidth: number | null = null;
    leftFixedWidth: number | null = null;
    rightFixedWidth: number | null = null;
    headerHeight: number | null = null;
    bodyHeight: number | null = null;     // body高度
    fixedHeight: number | null = null;  // 固定列总高度
    fixedBodyHeight: number | null = null; // 固定列body高度
    gutterWidth: number = 17;
    // expand
    expandedRender: Function | null = null; 
    
    get columns() {
      return this.store.states.columns;
    }

    get columnsCount() {
      return this.store.states.columns.length;
    }

    get leftFixedColumns() {
      return this.store.states.leftFixedColumns;
    }

    get leftFixedLeafColumns() {
      return this.store.states.leftFixedLeafColumns;
    }

    get rightFixedColumns() {
      return this.store.states.rightFixedColumns;
    }

    get rightFixedLeafColumns() {
      return this.store.states.rightFixedLeafColumns;
    }

    get isEmpty() {
      return !(this.store.states.data && this.store.states.data.length)
    }

    get bodyWrapperDom() {
      return this.$refs.bodyWrapperDom;
    }

    get updateHeightFlag() {
      return this.tableHeight || this.leftFixedColumns.length > 0 || this.rightFixedColumns.length > 0;
    }

    get headerWidth() {
      const { bodyWidth, scrollY, gutterWidth } = this;
      return bodyWidth ? bodyWidth - (scrollY ? gutterWidth : 0) : '';
    }

    get showBodyHeight() {
      if (this.tableHeight) {
        return { height: this.bodyHeight ? this.bodyHeight + 'px' : '' };
      }
      return {};
    }

    get showFixedBodyHeight() {
      if (this.tableHeight) {
        return { height: this.fixedBodyHeight ? this.fixedBodyHeight + 'px' : ''};
      }
      return {};
    }

    get showFixedHeight() {
      return { height: this.fixedHeight ? this.fixedHeight + 'px' : '' };
    }
    
    @Watch('data', { immediate: true })
    onDataChange(newVal: Array<TableDataType>) {
      this.store.commit('setData', newVal);
      this.updateHeightData();
    }

    @Watch('columnsCount')
    onColumnsCount(newVal:number, oldVal:number) {
      if (this.initFlag) {
        // 增加列数时重新获取数据
        if(newVal > oldVal) {
          this.resetColMinWidth();
        } else {
          this.updateColMinWidth();
        }
        this.notifyObservers('scrollYChange');
        this.updateWidthData();
      }
    }

    @Watch('scrollX')
    onScrollXChange() {
      if (this.initFlag) {
        this.updateHeightData();
      }
    }

    @Watch('tableHeight', { immediate: true })
    onTableHeightChange() {
      if (this.initFlag) {
        this.updateHeightData();
      }
    }

    created () {
      this.store = createStore(this, {
        rowKey: this.rowKey,
        rowKey2: this.rowKey2,
        expandAllFlag: this.expandAllFlag,
        lazyLoad: this.lazyLoad,
        data: this.data
      });
    }

    mounted() {
      this.store.updateColumns();
      this.initTable();
      this.currentWidth = (this.$el as HTMLElement).offsetWidth;
      this.currentHeight = (this.$el as HTMLElement).offsetHeight;
      this.$nextTick(() => {
        // 绑定事件
        this.mouseWheelEventName = "onwheel" in document.createElement("div") ? "wheel" : 
        (isFirefox ? "DOMMouseScroll" : "mousewheel");
        if(this.leftFixedColumns.length > 0) {
          this.$refs.leftFixedWrapper.addEventListener(this.mouseWheelEventName, this.handleFixedTableMousewheel);
        }
        if(this.rightFixedColumns.length > 0) {
          this.$refs.rightFixedWrapper.addEventListener(this.mouseWheelEventName, this.handleFixedTableMousewheel);
        }
        this.bodyWrapperDom.addEventListener('scroll', this.handleScroll, { passive: true });
        // window.onresize = debounce(50, this.handleRize);
        addResizeListener(this.$el, this.handleRize);
        
        this.initFlag = true;
      });
    }
    
    updated () {
      this.$nextTick(() => {
        if(this.headerHeight && this.$refs.headerWrapper && this.headerHeight !== this.$refs.headerWrapper.offsetHeight) {
          this.updateHeightData();
        }
        addResizeListener(this.$el, this.handleRize);
        // window.onresize = debounce(50, this.handleRize);
      })
    }

    checkScrollY() {
      let changed = false;
      if (!this.tableHeight) {
        return;
      }
      const bodyWrapperDom = this.bodyWrapperDom;
      if (this.$el && bodyWrapperDom) {
        const body = bodyWrapperDom.querySelector('.table-body') as HTMLElement;
        const prevScrollY = this.scrollY;
        let scrollY = body.offsetHeight + (this.scrollX ? this.gutterWidth : 0) > (this.bodyHeight as number);
        this.scrollY = scrollY;
        changed = prevScrollY !== scrollY;
        // if(changed) {
        //   console.log(prevScrollY + '->' + scrollY)
        // }
      } else {
        changed = false;
      }
      if (changed) {
        this.notifyObservers('scrollYChange');
        this.resetColMinWidth();
        this.updateWidthData();
      }
    }

    updateTable() {
      const that = this;
      debounce(50, () => that.initTable())();
    }
    
    initTable() {
      if (this.updateHeightFlag) {
        if (!this.initFlag) {
          this.$nextTick(() => { this.updateHeightData() });
        } else {
          this.updateHeightData();
        }
      }
      this.updateWidthData();
    }

    updateHeightData() {
      const { headerWrapper } = this.$refs;
      if (!headerWrapper) { return; }
      const headerHeight = this.headerHeight = headerWrapper.offsetHeight;
      // console.log("headerHeight: "+headerHeight)
      const getTableHeight = this.tableHeight;
      if (getTableHeight) {
        this.bodyHeight = getTableHeight - headerHeight;
        this.fixedBodyHeight = this.scrollX ? (this.bodyHeight - this.gutterWidth) : this.bodyHeight;
        this.fixedHeight = this.scrollX ? getTableHeight - this.gutterWidth : getTableHeight;
      }
      this.checkScrollY();
      this.notifyObservers('scrollYChange');
    }

    updateWidthData() {
      const scrollYWidth = this.scrollY ? this.gutterWidth : 0;
      const containerWidth = this.$el.clientWidth - scrollYWidth;

      if(containerWidth <= 0) { return; }

      const flattenColumns: Array<columnType> = this.columns;
      const flattenColsLen = flattenColumns.length;
      // 获取未定宽的列 与 长度
      let flexColumns = flattenColumns.filter((column) => typeof column.width !== 'number');
      const flexColsLen = flexColumns.length;

      let nowColMinWidth = 0;    // 用于比较的最小列宽
      if(!this.colMinWidth) {    // 未初始化colMinWidth时，用默认最小总列宽去比较
        let result = 0;
        flattenColumns.forEach((column) => {
          result += column.width || column.minDefaultWidth;
        });
        nowColMinWidth = result;
      } else {                    // 已初始化colMinWidth时
        nowColMinWidth = this.colMinWidth;
      }
      
      // console.log("窗宽度: "+containerWidth)
      // console.log("最小列宽: "+nowColMinWidth)

      // 有未定宽的列
      if (flexColsLen > 0) {
        // 有横向滚动条 
        if (nowColMinWidth > containerWidth) {
          this.scrollX = true;

          // 更新未定宽列的实际宽度值（初始化时取最小默认列宽minDefaultWidth；初始化后改变宽度取初始化最小列度）
          flexColumns.forEach(function(column) {
            column.realWidth = column.minWidth || column.minDefaultWidth;
          });

          // 更新bodyWidth为列宽
          this.bodyWidth = nowColMinWidth;
        }
        // 无横向滚动
        else {
          this.scrollX = false;

          const extraWidth = containerWidth - nowColMinWidth;
          // console.log("多出宽度: " + extraWidth)
          // 当宽度比最小列宽多时，动态分配剩余宽度
          if(extraWidth) {
            if (flexColsLen === 1) {
              flexColumns[0].realWidth = (flexColumns[0].minWidth || flexColumns[0].minDefaultWidth) + extraWidth;
            } else {
              const remainWidth = extraWidth % flexColsLen;
              const averAddWidth = (extraWidth - remainWidth) / flexColsLen;
              flexColumns.forEach((column) => {
                // 分配的基值（初始化时取最小默认列宽minDefaultWidth；初始化后改变宽度取初始化最小列度）
                column.realWidth = (column.minWidth || column.minDefaultWidth) + averAddWidth;
              });
              if(remainWidth) {
                flexColumns[0].realWidth = flexColumns[0].realWidth + remainWidth;
              }
            }
          }
          // 刚好相等时(常出现场景：切换每页显示个数后，本来消失的垂直滚动条又出现)
          // 更新未定宽列的实际宽度值（初始化时取最小默认列宽minDefaultWidth；初始化后改变宽度取初始化最小列度）
          else {
            flexColumns.forEach(function(column) {
              column.realWidth = column.minWidth || column.minDefaultWidth;
            });
          }
          // 更新bodyWidth为现宽度
          this.bodyWidth = containerWidth;
        }
      }
      // 全部列都定宽时
      else {
        // 有横向滚动条 
        if (nowColMinWidth > containerWidth) {
          this.scrollX = true;

          // 更新所有列的实际宽度值（初始化时取规定宽度width；初始化后改变宽度取初始化最小列度）
          flattenColumns.forEach(function(column) {
            column.realWidth = column.minWidth || column.width;
          });

          // 更新bodyWidth为列宽
          this.bodyWidth = nowColMinWidth;
        }
        // 无横向滚动
        else {
          this.scrollX = false;

          const extraWidth = containerWidth - nowColMinWidth;
          // console.log("多出宽度: " + extraWidth);
          // 当宽度比最小列宽多时，动态分配剩余宽度
          if(extraWidth) {
            // 固定设置宽度的列
            let fixedWidthColumns = flattenColumns.filter((column) => column.fixedWidthFlag);
            const flexColsNum = flattenColsLen - fixedWidthColumns.length;
            // console.log(flexColsNum);
            if (flexColsNum > 0) {
              const remainWidth = extraWidth % flexColsNum;
              const averAddWidth = (extraWidth - remainWidth) / flexColsNum;
              flattenColumns.forEach((column) => {
                // 分配的基值 (初始化时取规定宽度width；初始化后改变宽度取初始化最小列度minWidth)
                // 仅限不固定设置宽度的列
                if (!column.fixedWidthFlag) {
                  column.realWidth = (column.minWidth || column.width) + averAddWidth;
                }
              });
              if(remainWidth) {
                const index = flattenColumns.findIndex((column) => !column.fixedWidthFlag);
                if (index !== -1) {
                  flattenColumns[index].realWidth = flattenColumns[index].realWidth + remainWidth;
                }
              }
              // 更新bodyWidth为现宽度
              this.bodyWidth = containerWidth;
            } 
            // 所有列都固定设置宽度时
            else {
              flattenColumns.forEach(function(column) {
                column.realWidth = column.minWidth || column.width;
              });
              // 更新bodyWidth为列宽
              this.bodyWidth = nowColMinWidth;
            }
          }
          // 刚好相等时(常出现场景：切换每页显示个数后，本来消失的垂直滚动条又出现)
          // 更新所有列的实际宽度值（初始化时取规定宽度width；初始化后改变宽度取初始化最小列度）
          else {
            flattenColumns.forEach(function(column) {
              column.realWidth = column.minWidth || column.width;
            });
            // 更新bodyWidth为现宽度
            this.bodyWidth = containerWidth;
          }
        }
      }

      // 初始化完成后（高度数据已获取），进行最小列宽数据初始化
      if(!this.colMinWidth && this.headerHeight) {
        // 初始化最小总列宽
        this.colMinWidth = this.bodyWidth;
        // console.log("初始化最小总列宽: "+this.colMinWidth);
        // 初始化最小列度
        flattenColumns.forEach((column) => {
          column.minWidth = column.realWidth;
        });
      }
      // this.currentWidth = this.bodyWidth;
      
      // 获取 leftFixedWidth
      const leftFixedLeafColumns: Array<columnType> = this.leftFixedLeafColumns;
      if (leftFixedLeafColumns.length > 0) {
        let leftFixedWidth = 0;
        leftFixedLeafColumns.forEach(function(column) {
          leftFixedWidth += column.realWidth || column.width;
        });
        this.leftFixedWidth = leftFixedWidth;
      }

      // 获取 rightFixedWidth
      const rightFixedLeafColumns: Array<columnType> = this.rightFixedLeafColumns;
      if (rightFixedLeafColumns.length > 0) {
        let rightFixedWidth = 0;
        rightFixedLeafColumns.forEach(function(column) {
          rightFixedWidth += column.realWidth || column.width;
        });

        this.rightFixedWidth = rightFixedWidth;
      }

      this.notifyObservers('updateColWidth');
      
      // console.log('%c*****************','color:blue;')
    }

    updateColMinWidth() {
      let result = 0;
      const newColumns: Array<columnType> = this.columns;
      newColumns.forEach((column) => {
        column.minWidth = column.realWidth; // 更新minWidth
        result += column.realWidth;
      });
      this.colMinWidth = result;
      // console.log("更新最小总列宽: "+this.colMinWidth);
    }

    resetColMinWidth() {
      // 重置minWidth相关数据（重新获取数据）
      const newColumns: Array<columnType> = this.columns;
      newColumns.forEach((column) => {
        column.minWidth = 0; 
      });
      this.colMinWidth = null;
      // console.log("重置最小总列宽: "+this.colMinWidth);
    }

    addObserver(observer: HeaderBodyVue) {
      this.observers.push(observer);
    }

    removeObserver(observer: HeaderBodyVue) {
      const index = this.observers.indexOf(observer);
      if (index !== -1) {
        this.observers.splice(index, 1);
      }
    }

    notifyObservers(event: string) {
      const observers: Array<HeaderBodyVue> = this.observers;
      observers.forEach((observer) => {
        if(event === 'updateColWidth' && observer.updateColWidth) {
          observer.updateColWidth();
        }
        if(event === 'scrollYChange' && observer.handleGutter) {
          observer.handleGutter();
        }
      });
    }

    backToTop() {
      this.$nextTick(() => {
        this.bodyWrapperDom.scrollTop = 0;
      });
    }
    
    // 事件响应
    handleMouseLeave() {
      this.store.commit('setHoverRowIndex', null);
    }
    
    handleScroll() {
      const that = this;
      throttle(20, function() {
        const { scrollLeft, scrollTop, offsetWidth, scrollWidth } = that.bodyWrapperDom;
        const { headerWrapper, leftFixedBodyWrapper, rightFixedBodyWrapper } = that.$refs;
        if (headerWrapper) headerWrapper.scrollLeft = scrollLeft;
        if (leftFixedBodyWrapper) leftFixedBodyWrapper.scrollTop = scrollTop;
        if (rightFixedBodyWrapper) rightFixedBodyWrapper.scrollTop = scrollTop;
        if (scrollLeft === 0) {
          that.scrollPosition = 'left';
        } else if (scrollLeft >= scrollWidth - offsetWidth - 1) {
          that.scrollPosition = 'right';
        } else {
          that.scrollPosition = 'middle';
        }

        that.showTopIcon = (scrollTop && scrollTop > 600) ? true : false;
      })();
    }

    handleRize() {
      if (!this.initFlag) return;
      let resizeFlag = false;
      const el = this.$el as HTMLElement;

      const newWidth = el.offsetWidth;
      resizeFlag = newWidth !== this.currentWidth ? true : resizeFlag;
      const newHeight = el.offsetHeight;
      resizeFlag = (this.tableHeight && this.updateHeightFlag && (newHeight !== this.currentHeight))? true : resizeFlag;
      if (resizeFlag) {
        this.currentWidth = newWidth;
        this.currentHeight = newHeight;
        this.initTable();
      }
    }

    handleFixedTableMousewheel(event: Event) {
      const data = normalizeWheel(event);
      const bodyWrapperDom = this.bodyWrapperDom;
      if (Math.abs(data.spinY) > 0) {
        const currentScrollTop = bodyWrapperDom.scrollTop;
        if (data.pixelY < 0 && currentScrollTop !== 0) {
          event.preventDefault();
        }
        if (data.pixelY > 0 && bodyWrapperDom.scrollHeight - bodyWrapperDom.clientHeight > currentScrollTop) {
          event.preventDefault();
        }
        bodyWrapperDom.scrollTop += Math.ceil(data.pixelY / 5);
      } else {
        bodyWrapperDom.scrollLeft += Math.ceil(data.pixelX / 5);
      }
    }
    
    // 暴露方法
    setSelection(row: object, selectSet: boolean) {
      this.store.commit('changeRowSelect', row, selectSet);
    }
    
    setAllSelection() {
      this.store.commit('changeAllSelect');
    }

    setClearSelection() {
      this.store.commit('handleClearSelection');
    }

    setExpansionRow(row: object, expandSet: boolean) {
      this.store.commit('changeExpansion', row, expandSet);
    }

    clearSort() {
      this.store.commit('clearAllSort');
    }

    destroyed() {
      // window.onresize = null;
      removeResizeListener(this.$el, this.handleRize);
      this.$refs.leftFixedWrapper && this.$refs.leftFixedWrapper.removeEventListener(this.mouseWheelEventName, this.handleFixedTableMousewheel);
      this.$refs.rightFixedWrapper && this.$refs.rightFixedWrapper.removeEventListener(this.mouseWheelEventName, this.handleFixedTableMousewheel);
      const options: object = { passive: true };
      this.bodyWrapperDom.removeEventListener('scroll', this.handleScroll, options);
    }

    
  }
</script>

<style lang="scss">
.table-box-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  line-height: normal;
  border: 1px solid $borderColor;
  box-sizing: border-box;
  background: #fff;
  z-index: 0;
  &.noTableBorder {
    border: none;
  }
  &.noTableBorderX {
    table {
      th, td {
        border-bottom: none;
      }
    }
  }
  &.noTableBorderY {
    table {
      th, td {
        border-right: none;
      }
    }
  }
  div.table-header-wrapper {
    width: 100%;
    overflow: hidden;
  }
  div.table-body-wrapper {
    position: relative;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    &.horScroll {
      overflow-x: scroll;
    }
    
  }
  div.fixed-table-container {
    position: absolute;
    top: 0;
    overflow: hidden;
    height: 100%;
    z-index: 5;
    box-shadow: none;
    &.scroll-middle, &.scroll-right.left, &.scroll-left.right {
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
    }
    &.left {
      left: 0;
    }
    &.right {
      right: 0;
    }
    .fixed-table-header-wrapper,
    .fixed-table-body-wrapper {
      position: absolute;
      top: 0;
      z-index: 3;
      &.left {
        left: 0;
        right: auto;
      }
      &.right {
        left: auto;
        right: 0;
      }
      overflow: hidden;
    }
  }
  div.fixed-right-gutter {
    position: absolute;
    top: -1px;
    right: 0;
    background-color: #fff;
    border-bottom: 1px solid $borderColor;
  }
  table {
    &.table-header, &.table-body {
      table-layout: fixed;
    }
    border-collapse: separate;
    box-sizing: border-box;
    color: $normalFontColor;
    thead {
      font-size: $fontSizeSmall;
      tr {
        background: $headerBackground;
        th {
          color: #fff;
          cursor: default;
          &.gutter {
            padding: 0;
            margin: 0;
            border: none;
            background: #F5F7FA;
          }
          div.sortable {
            cursor: pointer;
            span {
              display: inline-block;
              vertical-align: middle;
              &.caret-wrapper {
                position: relative;
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                vertical-align: text-bottom;
                width: 13px;
                line-height: 7px;
                i.iconfont {
                  color: #fff;
                  font-size: 11px;
                  &.chosen {
                    color: $mainColor;
                  }
                }
              }
            }
          }
        }
      }
    }
    tbody {
      font-size: $fontSizeSmall;
      background: #fff;
      tr {
        background: #fff;
        transform: translate3d(0, 0, 0);
        &.tr:nth-child(even) {
          background: $stripeColor;
        }
        &.tr:hover, &.tr.hand-hover {
          background: #f5f7fa;
        }
        &[class*=level-] {
          .expand-icon {
            display: inline-block;
            width: 20px;
            line-height: 20px;
            height: 20px;
            text-align: center;
            margin-right: 3px;
            &.expanded {
              transform: rotate(90deg);
            }
          }
        }
        td {
          &.expanded-content {
            padding: 20px 50px;
            background-color: #fff;
            border-bottom: 1px solid $borderColor;
          }
          .cell {
            white-space: normal;
            word-break: break-all;
            .expand-icon {
              position: relative;
              cursor: pointer;
              color: $normalFontColor;
              font-size: $fontSizeSmall;
              transition: transform 0.2s ease-in-out;
              height: 20px;
              line-height: 20px;
              &.expanded {
                transform: rotate(90deg);
              }
              &.rotate {
                -webkit-animation: load 1s linear infinite;
                -moz-animation: load 1s linear infinite;
                animation: load 1s linear infinite;
              }
              .iconfont {
                font-size: 12px;
              }
            }
          }
        }
      }
    }
    th,
    td {
      min-width: 0;
      position: relative;
      padding: 5px;
      overflow: hidden;
      text-align: center;
      vertical-align: middle;
      text-overflow: ellipsis;
      border-right: 1px solid $borderColor;
      border-bottom: 1px solid $borderColor;
      box-sizing: border-box;
      div.cell{
        position: relative;
        display: inline-block;
        line-height: 19px;
        width: 100%;
        box-sizing: border-box;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &.visi-hidden>* {
        visibility: hidden;
      }
      &.highlight {
        background-color: #85B1D6;
      }
      &.left {
        text-align: left;
      }
      &.center {
        text-align: center;
      }
      &.right {
        text-align: right;
      }
    }
  }
  .empty-table-box {
    width: 100%;
    padding: 25px 0;
    text-align: center;
    background: #fff;
    .empty-text {
      font-size: $fontSizeMiddle;
      color: $subFontColor;
    }
  }
  .back-top-icon {
    position: absolute;
    bottom: 30px;
    right: 30px;
    display: block;
    font-size: 36px;
    cursor: pointer;
    z-index: 10;
    color: #333333;
    opacity: 0.45;
    &:hover {
      opacity: 0.65;
    }
  }
  .top-icon-transition-enter-active {
    transition: all .3s ease-out;
  }
  .top-icon-transition-leave-active {
    transition: all .3s ease-in;
  }
  .top-icon-transition-enter,.top-icon-transition-leave-to {
    opacity: 0;
  }
  .top-icon-transition-enter-to,.top-icon-transition-leave {
    opacity: 0.45;
  }
  .loading-mask {
    position: absolute;
    z-index: 2000;
    background-color: rgba(255, 255, 255, 0.8);
    margin: 0;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transition: opacity .3s;
    text-align: center;
    .loading-div {
      position: absolute;
      top: 50%;
      margin-top: -18px;
      display: inline-block;
      width: 36px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      -webkit-animation: load 1s linear infinite;
      -moz-animation: load 1s linear infinite;
      animation: load 1s linear infinite;
      .iconfont {
        color: $mainColor;
        font-size: 35px;
      }
    }
  }
}
.hidden-columns {
  visibility: hidden;
  position: absolute;
  z-index: -1;
}
@keyframes load {
  from { transform: rotate(0deg); -webkit-transform: rotate(0deg); -moz-transform: rotate(0deg); }
  to { transform: rotate(360deg); -webkit-transform: rotate(360deg); -moz-transform: rotate(360deg); }
}
@-webkit-keyframes load {
  from { transform: rotate(0deg); -webkit-transform: rotate(0deg); -moz-transform: rotate(0deg); }
  to { transform: rotate(360deg); -webkit-transform: rotate(360deg); -moz-transform: rotate(360deg); }
}
@-moz-keyframes load {
  from { transform: rotate(0deg); -webkit-transform: rotate(0deg); -moz-transform: rotate(0deg); }
  to { transform: rotate(360deg); -webkit-transform: rotate(360deg); -moz-transform: rotate(360deg); }
}
</style>
