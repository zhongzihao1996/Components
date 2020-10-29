<template>
  <div class="pagination-container" v-if="showFlag">
    <span class="total-page-text">共 {{total}} 条</span>
    <span class="pagination-sizes" v-if="showPSselect">
      每页
      <div class="pagination-sizes-select-box" ref="selectDom">
        <div class="pagination-sizes-select" @click="toggleShowOption()">
          <input class="select-input"
                 :class="{ 'disabled': disabled }"
                 v-model="innerPageSize"
                 type="text"
                 readonly
                 placeholder="请选择"
                 :disabled="disabled"
                 @blur="toggleShowOption('blur')">
          <span class="select-arrow">
            <i class="iconfont" :class="{ 'drop': showOptionFlag }">&#xe637;</i>
          </span>
        </div>
        <div class="pagination-sizes-options" :class="dropPosition" v-show="showOptionFlag">
          <ul class="options-list">
            <li class="options-item"
                :class="{ 'selected': item == innerPageSize }"
                v-for="(item, index) in pageSizeConfig"
                :key="index"
                @click="handlePageSizeChange(item)"
                @mousedown="handleMouseDown">{{item}}</li>
          </ul>
        </div>
      </div>
      条
    </span>
    <button type="button"
            class="btn-prev"
            :disabled="innerCurrentPage<=1||disabled"
            @click="clickPrev()">
      <i class="iconfont">&#xe635;</i>
    </button>
    <ul @click="onPagClick"
        class="pagination-list">
      <!--第一页-->
      <li :class="{ active: innerCurrentPage === 1, disabled }"
          v-if="innerPageNum > 0"
          class="number">1</li>
      <!--more图标-->
      <li class="iconfont more btn-more-prev"
          :class="[prevIconClass, { disabled }]"
          v-if="showPrevMore"
          @mouseenter="onMouseenter('left')"
          @mouseleave="prevIconClass = 'icon-more'">
      </li>
      <!--页码-->
      <li v-for="pag in paginations"
          :key="pag"
          :class="{ active: innerCurrentPage === pag, disabled }"
          class="number">{{ pag }}</li>
      <!--more图标-->
      <li class="iconfont more btn-more-next"
          :class="[nextIconClass, { disabled }]"
          v-if="showNextMore"
          @mouseenter="onMouseenter('right')"
          @mouseleave="nextIconClass = 'icon-more'">
      </li>
      <!--总页码(最后一页)-->
      <li :class="{ active: innerCurrentPage === innerPageNum, disabled }"
          class="number"
          v-if="innerPageNum > 1">{{ innerPageNum }}</li>
    </ul>
    <button type="button"
            class="btn-next"
            :disabled="innerCurrentPage === innerPageNum || innerPageNum === 0 || disabled"
            @click="clickNext()">
      <i class="iconfont">&#xe636;</i>
    </button>
    <span class="pagination-jump">前往
      <div class="pagination-jump-input-container">
        <input class="pagination-jump-input"
                :class="{ 'disabled': disabled }"
                type="number"
                :min="1"
                :max="innerPageNum"
                v-model="inputPage"
                ref="input"
                :disabled="disabled"
                @keyup.enter="handleKeyup"
                @change="handleInputChange"/>
      </div>页
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { ArrayEquals, debounce } from '../../table-component/src/common/util';

@Component({ name: 'pagination'})
export default class pagination extends Vue {
  $refs!: {
    selectDom: HTMLElement;
  };

  @Prop({ type: Boolean, default: false }) disabled!: boolean; // 是否禁用
  @Prop({ type: Number, required: true }) total!: number;
  @Prop({ type: Number, default: 10 }) pageSize!: number; // 每页显示行数
  @Prop({ type: Number, default: 1 }) currentPage!: number;
  @Prop({
    type: Number,
    validator: function(value) {
      return (
        (value | 0) === value && value > 4 && value < 16 && value % 2 === 1
      );
    },
    default: 7
  })
  paginationNum!: number; // 要显示页码按钮数（当总页数超过该值时会折叠）
  @Prop({
    type: Array,
    default() {
      return [20, 50, 100, 200, 500];
    }
  })
  pageSizeConfig!: Array<number>; // 每页显示个数选择器的选项配置


  // data
  inputPage: number = 1;           // 跳转页数输入框值
  lastEmittedPage: number = -1; // 记录最后传递的当前页码
  changedFlag: boolean = false; // 是否改变当前页码
  innerPageSize: number = 0; // 每页条数(通过watch同步props)
  innerCurrentPage: number = 1; // 当前的页码(通过watch同步props)
  prevIconClass: string = 'icon-more';
  nextIconClass: string = 'icon-more';
  showPrevMore: boolean = false;
  showNextMore: boolean = false;
  showOptionFlag: boolean = false;
  dropPosition: string = 'top';

  @Watch('currentPage', { immediate: true })
  onCpChanged(val: number) {
    val = this.checkJumpPage(val);
    this.innerCurrentPage = val;
    this.inputPage = val;
  }
  @Watch('pageSize', { immediate: true })
  onPzChanged(val: number) {
    this.innerPageSize = isNaN(val) ? 20 : val;
  }
  @Watch('pageSizeConfig', { immediate: true })
  onPzConfigChanged(newVal: Array<number>, oldVal: Array<number>) {
    if(newVal && newVal.length>0) {
      if (ArrayEquals(newVal, oldVal)) return;
      // 如果 指定每页显示个数 不在 每页显示个数选择器选项配置 中，则每页显示个数取选项配置中的第一个
      if(newVal.indexOf(this.pageSize) === -1) {
        this.innerPageSize = this.pageSizeConfig[0];
      }
    }
  }
  @Watch('innerPageNum', { immediate: true })
  onInnerPageNumChanged(newVal: number) {
    // 改变每页显示个数时，innerPageNum总页数可能改变
    if(this.innerCurrentPage > newVal) { // 当前页大于总页数
      this.innerCurrentPage = newVal === 0 ? 1 : newVal;
      this.changedFlag = true;
      this.emitChange();
    }
  }
  @Watch('showPrevMore', { immediate: true })
  onSpmChanged(val: boolean) {
    if (!val) this.prevIconClass = 'icon-more';
  }
  @Watch('showNextMore', { immediate: true })
  onSnmChanged(val: boolean) {
    if (!val) this.nextIconClass = 'icon-more';
  }

  get showFlag() {
    return this.total>0;
  }

  get showPSselect() {
    return this.pageSizeConfig && this.pageSizeConfig.length>0
  }

  // 总页数（最大页数）
  get innerPageNum() {
    return Math.ceil(this.total / this.innerPageSize);
  }

  // 页码按钮渲染数组
  get paginations() {
    const paginationNum = this.paginationNum;
    // 按钮的一半数量
    const halfPaginatioCount = (paginationNum - 1) / 2;
    // 当前页码数
    const innerCurrentPage = Number(this.innerCurrentPage);
    // 总页数
    const innerPageNum = Number(this.innerPageNum);
    let showPrevMore = false;
    let showNextMore = false;

    // 如果总页码数大于要显示的页码按钮数量，要出现more图标
    if (innerPageNum > paginationNum) {
      //  如果当前页码大于（要显示的页码按钮数 - 一半的页码按钮数），则显示左边的more图标
      if (innerCurrentPage > paginationNum - halfPaginatioCount) {
        showPrevMore = true;
      }
      //  如果当前页码小于（要显示的页码按钮数量-一半的页码按钮数量），则显示右边的more图标
      if (innerCurrentPage < innerPageNum - halfPaginatioCount) {
        showNextMore = true;
      }
    }
    const array = [];
    // more图标：左存在，右不存在
    if (showPrevMore && !showNextMore) {
      const startPage = innerPageNum - (paginationNum - 2);
      for (let i = startPage; i < innerPageNum; i++) {
        array.push(i);
      }
    }
    // more图标：左不存在，右存在
    else if (!showPrevMore && showNextMore) {
      for (let i = 2; i < paginationNum; i++) {
        array.push(i);
      }
    }
    // more图标：都存在
    else if (showPrevMore && showNextMore) {
      const offset = Math.floor(paginationNum / 2) - 1; // 返回小于或等于一个给定数字的最大整数。
      for (
        let i = innerCurrentPage - offset;
        i <= innerCurrentPage + offset;
        i++
      ) {
        array.push(i);
      }
    }
    // more图标：都不存在
    else {
      for (let i = 2; i < innerPageNum; i++) {
        array.push(i);
      }
    }

    this.showPrevMore = showPrevMore;
    this.showNextMore = showNextMore;

    return array;
  }

  mounted () {
    this.$nextTick(() => {
      if(this.showPSselect) {
        window.onresize = debounce(50, this.initDropPosition);
        this.initDropPosition(); 
      }
    });
  }

  initDropPosition() {
    const getSelectDom = this.$refs.selectDom;
    if(getSelectDom) {
      let selHeight = getSelectDom.offsetHeight;
      let selTop = getSelectDom.offsetTop;
      let optionsListHeight = this.pageSizeConfig.length*34 + 6*2 + 8*2 + 1*2;
      let docScrollHeight = document.body.scrollTop || document.documentElement.scrollTop || 0;
      let docHeight =  document.documentElement.clientHeight || document.body.clientHeight || 0;
      if((selHeight + selTop + optionsListHeight - docScrollHeight) > docHeight ) {
        this.dropPosition = 'top';
      } else{
        this.dropPosition = 'bottom';
      }
    }
  }

  // 选择改变每页显示个数
  handlePageSizeChange(newVal: number) {
    if (newVal !== this.innerPageSize) {
      this.innerPageSize = newVal;
      // 父组件的pageSize可通过监听size-change钩子手动同步，也可使用.sync自动同步)
      this.$emit('sizeChange', newVal); // sizeChange钩子，参数为新值
      this.$emit('update:pageSize', newVal); // 若pageSize使用.sync，触发同步
    }
    this.showOptionFlag = false;
  }

  // 点击页码 或 more图标
  onPagClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'UL' || this.disabled) {  return; }
    let newPage = Number(target.textContent);
    const innerCurrentPage = this.innerCurrentPage;
    const pagerCountOffset = this.paginationNum - 2; // 点击more图标后移动的距离
    // 点击more图标
    if (target.className.indexOf('more') !== -1) {
      if (target.className.indexOf('btn-more-prev') !== -1) {
        newPage = innerCurrentPage - pagerCountOffset;
      } else if (target.className.indexOf('btn-more-next') !== -1) {
        newPage = innerCurrentPage + pagerCountOffset;
      }
    }

    if (newPage !== innerCurrentPage) {
      this.innerCurrentPage = this.checkJumpPage(newPage);
      this.emitChange();
      this.changedFlag = true;
    }
  }
  // 鼠标移入more图标显示向左或者向右的图标
  onMouseenter(direction: string) {
    if (this.disabled) return;
    if (direction === 'left') {
      this.prevIconClass = 'icon-d-arrow-left';
    } else {
      this.nextIconClass = 'icon-d-arrow-right';
    }
  }

  // 点击上一页
  clickPrev() {
    if (this.disabled) return;
    const newVal = this.innerCurrentPage - 1;
    this.innerCurrentPage = this.checkJumpPage(newVal);
    this.emitChange();
    this.$emit('prevClick', this.innerCurrentPage); // prevClick钩子(可在父组件监听)，参数为当前页码
  }
  // 点击下一页
  clickNext() {
    if (this.disabled) return;
    const newVal = this.innerCurrentPage + 1;
    this.innerCurrentPage = this.checkJumpPage(newVal);
    this.emitChange();
    this.$emit('nextClick', this.innerCurrentPage); // nextClick钩子(可在父组件监听)，参数为当前页码
  }

  handleKeyup(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.handleChange(this.inputPage);
    }
  }

  handleInputChange() {
    this.handleChange(this.inputPage);
  }

  // 当前页改变
  handleChange(value: string | number) {
    this.innerCurrentPage = this.checkJumpPage(value);
    this.emitChange();
  }

  // 每当改变当前页码时，同步父组件的currentPage值
  emitChange() {
    this.$nextTick(() => {
      if (this.innerCurrentPage !== this.lastEmittedPage || this.changedFlag) {
        // 父组件的currentPage可通过监听current-change钩子手动同步，也可使用.sync自动同步)
        this.$emit('currentChange', this.innerCurrentPage);  // currentChange钩子，参数为当前页码
        this.$emit('update:currentPage', this.innerCurrentPage); // 若currentPage使用.sync，触发同步更新
        // 记录最后传递的当前页码（用于比较）
        this.lastEmittedPage = this.innerCurrentPage;
        this.changedFlag = false;
      }
    });
  }

  // 校验要跳转的页码值
  checkJumpPage(value: string | number) {
    value = parseInt(value as string, 10);
    let jumpPage;
    if (value < 1) {
      jumpPage = 1;
    } else if (value > this.innerPageNum) {
      jumpPage = this.innerPageNum;
    } else {
      jumpPage = value;
    }
    if (jumpPage === undefined || isNaN(value) || jumpPage === 0) {
      jumpPage = 1;
    }
    return jumpPage;
  }

  handleMouseDown(event: MouseEvent) {
    event.preventDefault();
  }

  toggleShowOption(type?: string) {
    if (this.disabled) return;
    if(type === 'blur') {
      this.showOptionFlag = false;
    } else {
      this.showOptionFlag = !this.showOptionFlag;
    }
  }

  destroyed () {
    window.onresize = null;
  }
}
</script>

<style lang="scss">
.pagination-container {
  width: 100%;
  padding-top: 8px;
  text-align: center;
  color: $normalFontColor;
  font-size: $fontSizeSmall;
  font-weight: 400;
  white-space: nowrap;
  background-color: #fff;
  box-sizing: border-box;
  .total-page-text {
    margin-right: 24px;
    display: inline-block;
    min-width: 40px;
    height: 28px;
    line-height: 28px;
    vertical-align: middle;
    box-sizing: border-box;
  }
  .pagination-sizes {
    margin-right: 10px;
    display: inline-block;
    min-width: 100px;
    height: 28px;
    line-height: 28px;
    vertical-align: middle;
    box-sizing: border-box;
    .pagination-sizes-select-box {
      display: inline-block;
      position: relative;
      .pagination-sizes-select {
        position: relative;
        width: 60px;
        input.select-input {
          &.disabled {
            cursor: not-allowed;
            background-color: #F5F7FA;
            border-color: #E4E7ED;
            color: #C0C4CC;
            &:hover, &:focus {
              border-color: #E4E7ED;
            }
          }
          padding: 0 20px 0 10px;
          display: inline-block;
          width: 100%;
          height: 28px;
          line-height: 28px;
          font-size: 12px;
          color: $normalFontColor;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-color: #FFF;
          background-image: none;
          box-sizing: border-box;
          outline: 0;
          border: 1px solid $lineColor;
          border-radius: 4px;
          cursor: pointer;
          &:hover {
            border-color: #C0C4CC;
          }
          &:focus {
            border-color: $mainColor;
          }
        }
        .select-arrow {
          position: absolute;
          top: 0;
          right: 6px;
          z-index: 5;
          pointer-events: none;
          cursor: pointer;
          .iconfont {
            display: block;
            font-size: 14px;
            color: #C0C4CC;
            transform: rotateZ(0);
            transition: transform .3s;
            &.drop {
              transform: rotateZ(180deg);
            }
          }
        }
      }
      .pagination-sizes-options {
        position: absolute;
        left: 0;
        &.top {
          bottom: 28px;
        }
        &.bottom {
          top: 28px;
        }
        margin: 8px 0;
        min-width: 60px;
        background-color: #FFF;
        border: 1px solid #E4E7ED;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        overflow: hidden;
        z-index: 5;
        .options-list {
          margin: 0;
          padding: 6px 0;
          box-sizing: border-box;
          list-style: none;
          border: none;
          .options-item {
            padding: 0 20px;
            height: 34px;
            line-height: 34px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
            font-size: 14px;
            color: $normalFontColor;
            box-sizing: border-box;
            border: 1px solid #E4E7ED;
            border-radius: 4px;
            cursor: pointer;
            border: none;
            &:hover {
              background-color: #F5F7FA;
            }
            &.selected {
              color: $mainColor;
              font-weight: 700;
            }
          }
        }
      }
    }
  }
  button {
    border: none;
    outline: none;
    display: inline-block;
    margin: 0;
    padding: 0 6px;
    min-width: 30px;
    height: 28px;
    line-height: 28px;
    cursor: pointer;
    vertical-align: middle;
    box-sizing: border-box;
    color: $normalFontColor;
    background-color: transparent;
    &:disabled {
      color: $disabledColor;
      cursor: not-allowed;
      &:hover {
        color: $disabledColor;
      }
    }
    &:hover {
      color: $mainColor;
    }
    &.btn-prev {
      padding-right: 2px;
    }
    &.btn-next {
      padding-left: 2px;
    }
  }
  ul.pagination-list {
    margin: 0;
    padding: 0;
    display: inline-block;
    vertical-align: middle;
    user-select: none;
    list-style: none;
    li {
      display: inline-block;
      padding: 0 4px;
      min-width: 35px;
      height: 28px;
      line-height: 28px;
      box-sizing: border-box;
      text-align: center;
      vertical-align: middle;
      cursor: pointer;
      &.active {
        color: $mainColor;
        cursor: default;
      }
      &:hover {
        color: $mainColor;
      }
      &.disabled {
        cursor: not-allowed;
        color: $disabledColor;
        &.active, &:hover {
          color: $disabledColor;
        }
      }
    }
  }
  .pagination-jump {
    margin-left: 24px;
    display: inline-block;
    min-width: 40px;
    height: 28px;
    line-height: 28px;
    font-weight: 400;
    vertical-align: middle;
    box-sizing: border-box;
    .pagination-jump-input-container {
      margin: 0 5px;
      position: relative;
      display: inline-block;
      width: 50px;
      font-size: 12px;
      input.pagination-jump-input {
        outline: 0;
        padding: 0 3px;
        display: inline-block;
        width: 100%;
        height: 28px;
        line-height: 28px;
        font-size: inherit;
        text-align: center;
        -webkit-appearance: none;
        color: $normalFontColor;
        background-color: #FFF;
        background-image: none;
        border-radius: 4px;
        border: 1px solid $lineColor;
        box-sizing: border-box;
        &:hover {
          border-color: $disabledColor;
        }
        &:focus {
          border-color: $mainColor;
        }
        &.disabled {
          cursor: not-allowed;
          background-color: #F5F7FA;
          color: $disabledColor;
          &:focus, &:hover {
            border-color: $lineColor;
          }
        }
      }
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
      }
      input[type='number'] {
        -moz-appearance: textfield;
      }
    }
  }
  .iconfont {
    font-size: 14px;
  }
}
</style>
