<template>
  <div class="plugin-cascader-select-common">
    <el-popover :popper-class="firstUrl==='/conditions/releaseStaff/department'?'plugin-cascader-select-common-popover':''" trigger="click" :placement="placement" @show="handlePopoverShow"
      @hide="handlePopoverHide" ref="popover" v-clickoutside="handleClickOutSide">
      <div slot="reference" class="plugin-cascader-select-common-input"
        :class="[firstUrl==='/conditions/releaseStaff/department'?'plugin-cascader-select-common-input-release':'',{'is-focus':isFocus}]">
        <div class="tags" v-if="shouldShowTags">
          <label class="el-tag el-tag--info el-tag--mini el-tag--light">已选择{{secondSelected.length}}个</label>
        </div>
        <el-input v-model="keyword" size="mini" :placeholder="secondSelected.length>0?'':placeholder" ref="input" :readonly="!filterable" @input="handleInputChange" :suffix-icon="suffixIcon" />
      </div>
      <div class="plugin-cascader-select-common-panel" v-loading="loading" element-loading-text="加载中">
        <div class="panel-item first-panel-item">
          <el-scrollbar class="scrollbar" ref="first">
            <div class="btns" v-if="multiple">
              <el-button size="mini" @click="handleSelectAll()" v-trackevent="['全局级联组件-'+placeholder,'点击全选按钮']">全选</el-button>
              <el-button size="mini" @click="handleRemoveAll()" v-trackevent="['全局级联组件-'+placeholder,'点击全不选按钮']">全不选</el-button>
            </div>
            <div class="item" :class="{'lineheight':index===firstIndex}" v-for="(item,index) in firstRecords" :key="item.value+'_'+index" @click="handleFirstClick(item,$event,index)"
              :style="{marginTop:multiple&&index===0?'40px':'0'}">
              <el-checkbox v-if="multiple" :indeterminate="firstSelectedObj[item.value.toString()]===2" :value="firstSelectedObj[item.value.toString()]===1" />
              <span :ref="'firstItem_'+index">{{item.label}}</span>
              <i class="el-icon-arrow-right"></i>
            </div>
            <div class="item-null" v-if="firstRecords.length===0&&!loading"> 无匹配数据 </div>
          </el-scrollbar>
        </div>
        <div class="panel-item" v-if="isOpenSecond&&secondRecords.length>0">
          <el-scrollbar class="scrollbar" ref="second">
            <div class="item" v-for="(item,index) in secondRecords" :key="item.value+'_'+index" @click="handleSecondClick(item,$event)">
              <el-checkbox v-model="secondSelectedObj[item.value]" />
              <span>{{item.label}}</span>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
import Clickoutside from '../../../node_modules/element-ui/src/utils/clickoutside';

export default {
  directives: { Clickoutside },
  name: 'cascader-select',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      required: true
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    shouldClose: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    firstUrl: {
      type: String,
      default: '/conditions/games'
    },
    firstMap: {
      type: Function,
      default: o => ({ label: o.game_name_cn, value: o.game_id })
    },
    firstCountKey: {
      type: String,
      default: 'game_package_counts'
    },
    secondUrl: {
      type: String,
      default: '/conditions/game/packages'
    },
    secondMap: {
      type: Function,
      default: o => ({ label: o.package_name_cn, value: o.package_ids })
    },
    secondKeywordKey: {
      type: String,
      default: 'package_name_cn'
    },
    secondParamKey: {
      type: String,
      default: 'game_id'
    },
    selectAllUrl: {
      type: String,
      default: '/conditions/all/package'
    },
    distance: {
      type: Number,
      default: 200
    },
    placement: {
      type: String,
      default: 'bottom-start'
    },
    transform: {
      type: Boolean,
      default: false
    },
    transformUrl: {
      type: String,
      default: '/conditions/ads'
    },
    transformMap: {
      type: Function,
      default: o => ({ label: o.package_name_cn, value: o.package_ids })
    },
    extParams: {
      type: Object,
      default: () => ({})
    },
    middleState: {
      type: Object,
      default: () => ({})
    },
    filter_key: {
      type: String,
    },
    filter_param: {
      type: Array,
      default: () => ([])
    },
    more_filter_key: {
      type: String,
    },
    more_filter_param: {
      type: Array,
      default: () => ([]),
    },
    isGamePackage: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      firstPage: 1,
      firstPer_page: 150, // 加大页数，避免边界问题（分页数据有严重bug，接口不分数组和对象）
      firstTotal: 0,
      currentFirst: '',
      saveCurrentFirst: '',
      firstRecords: [],
      firstSelectedObj: {},
      secondPage: 1,
      secondPer_page: 150, // 加大页数，避免边界问题（分页数据有严重bug，接口不分数组和对象）
      secondTotal: 0,
      secondRecords: [],
      secondSelectedObj: {},
      loading: false,
      isFocus: false,
      firstBusying: false,
      keyword: '',
      timer: -1,
      firstIndex: -1,
      isOpenSecond: false, // 是否展开第二级
      isKeyWords: false, // 是否是查询状态
    };
  },
  computed: {
    isFirstAllowNext() {
      return !this.loading && this.firstRecords.length !== this.firstTotal && this.firstTotal > 0;
    },
    isSecondAllowNext() {
      return !this.loading && this.secondRecords.length < this.secondTotal && this.secondTotal > 0;
    },
    secondSelected() {
      // package_ids字段按升序格式化 例'1,2,3'
      return this.isGamePackage ? Object.keys(this.secondSelectedObj).filter(key => this.secondSelectedObj[key]).map(key => (key.indexOf(',') !== -1 ? key.split(',').sort((a, b) => a - b).join(',') : key)) : Object.keys(this.secondSelectedObj).filter(key => this.secondSelectedObj[key]).map(key => Number.parseInt(key, 10));
    },
    suffixIcon() {
      // eslint-disable-next-line no-nested-ternary
      return this.isFocus ? ((this.clearable && this.secondSelected.length > 0) || this.keyword !== '' ? 'el-icon-circle-close' : 'el-icon-arrow-up') : 'el-icon-arrow-down';
    },
    shouldShowTags() {
      return this.secondSelected.length > 0;
    }
  },
  mounted() {
    if (this.clearable) {
      const suffixBtn = this.$refs.input.$el.querySelector('span.el-input__suffix');
      if (suffixBtn) {
        suffixBtn.addEventListener('click', e => {
          this.handleSuffixClick(e); // 注册尾部icon点击事件
        });
      }
    }
  },
  methods: {
    handleClickOutSide() {
      const releaseStaffDom = document.querySelector('.plugin-cascader-select-common-popover');
      const allSelectDom = document.querySelector('.allSearchItem');
      const inputDom = document.querySelector('.plugin-cascader-select-common-input-release');
      let flag = false;
      if (releaseStaffDom && !flag) {
        allSelectDom.addEventListener('click', (e) => {
          if ((!releaseStaffDom.contains(e.target) && !inputDom.contains(e.target))) {
            this.$refs.popover.doClose();
          }
        });
        flag = true;
      }
    },
    // 获取第一级列表
    getFirstRecords() {
      if (this.loading) { return false; }
      this.loading = true;
      const params = {
        page: this.firstPage,
        per_page: this.firstPer_page,
      };
      if (this.keyword) {
        params[this.secondKeywordKey] = this.keyword; // 第一级查第二级的信息
      }
      if (this.filter_key && this.filter_param.length !== 0) {
        params[this.filter_key] = this.filter_param;
      }
      if (this.more_filter_key && this.more_filter_param.length !== 0) {
        params[this.more_filter_key] = this.more_filter_param;
      }
      // 传入外部参数作为查询条件
      Object.keys(this.extParams).forEach(key => {
        params[key] = this.extParams[key];
      });
      this.$http.post(this.firstUrl, params).then(({ data: res }) => {
        this.rememberScrollbarHeight(() => {
          if (res.content.current_page === 1) {
            this.firstRecords = []; // 第一页清空
          }
          this.firstRecords.push(...res.content.data.map(this.firstMap));
          this.saveCurrentFirst = (this.firstRecords[0] || {}).value;
          this.firstTotal = res.content.total;
          this.firstPage++; // 自增页码
          // this.formatFirstSelectStatus();
          if (this.isKeyWords) {
            // 如果为查询状态时自动展开第二级 v1.4.6
            this.autoShowSecondList(); // 自动展开第二级 v1.4.5把此功能屏蔽
          }
        });
      }).finally(() => {
        this.$nextTick(() => {
          this.loading = false;
        });
      });
    },
    // 获取第二级列表
    getSecondRecords() {
      this.loading = true;
      const params = {
        page: this.secondPage,
        per_page: this.secondPer_page,
      };
      params[this.secondParamKey] = this.currentFirst;
      if (this.keyword) {
        params[this.secondKeywordKey] = this.keyword;
      }
      if (this.filter_key && this.filter_param.length !== 0) {
        params[this.filter_key] = this.filter_param;
      }
      if (this.more_filter_key && this.more_filter_param.length !== 0) {
        params[this.more_filter_key] = this.more_filter_param;
      }
      // 传入外部参数作为查询条件
      Object.keys(this.extParams).forEach(key => {
        params[key] = this.extParams[key];
      });
      this.$http.post(this.secondUrl, params).then(({ data: res }) => {
        if (res.content.current_page === 1) {
          this.secondRecords = []; // 第一页清空
        }
        this.secondRecords.push(...res.content.data.map(this.secondMap).map(o => {
          if (!o.parent) {
            o.parent = this.currentFirst; // 如果没有返回所属父级，人为兼容【属于冗余代码】
          }
          // package_ids字段按升序格式化 例'1,2,3'
          if (this.isGamePackage && o.value.indexOf(',') !== -1) {
            o.value = o.value.split(',').sort((a, b) => a - b).join(',');
          }
          return o;
        }));
        this.secondTotal = res.content.total;
        this.secondPage++; // 自增页码
        this.handleSecondShow(); // 监听第二级
      }).finally(() => {
        this.$nextTick(() => {
          this.loading = false;
          this.formatFirstSelectStatus();
        });
        this.rememberScrollbarHeight(() => {
          this.$refs.popover.createPopper(); // 自适应定位，避免边界时二级内容被折叠（会重置滚动高度）
        });
      });
    },
    // 第一级列表点击时触发
    handleFirstClick(item, event, index) {
      const lastIndex = this.firstIndex;
      this.firstIndex = index;
      // 扩大热区范围
      if (['SPAN', 'I', 'DIV'].includes(event.target.nodeName)) {
        const isCheckBox = !event.target.className.includes('el-icon-arrow-right');
        this.currentFirst = item.value;
        this.secondRecords = [];
        this.secondPage = 1;
        this.isFocus = true;
        this.getSecondRecords();
        if (isCheckBox) {
          if (this.firstSelectedObj[item.value.toString()] === 1) {
            this.handleFirstSelectAll(item.value.toString(), false); // 全不选当前一级
          } else {
            this.handleFirstSelectAll(item.value.toString(), true); // 全选当前一级
          }
        } else if (this.isKeyWords) {
          this.isOpenSecond = true; // 查询状态时自动展开第二级
          this.isKeyWords = false;
        } else if (lastIndex === index) {
          this.isOpenSecond = !this.isOpenSecond; // 点击同一个箭头关闭或展开第二级
        } else {
          this.isOpenSecond = true; // 点击不同项的箭头展开第二级
        }
      }
    },
    // 处理第一级全选
    handleFirstSelectAll(firstKey, shouldChecked) {
      if (this.firstRecords.length === 0) return;
      if (this.firstBusying) { return false; } // 避免重复点击
      this.$nextTick(() => {
        this.$set(this.firstSelectedObj, firstKey, shouldChecked ? 1 : 0); // 强制设置当前一级状态,选中/不选中
      });
      const params = {};
      if (firstKey) {
        params[this.secondParamKey] = firstKey; // 是否为指定的第一级
      }
      if (this.keyword) {
        params[this.secondKeywordKey] = this.keyword; // 是否带关键词
      }
      if (this.filter_key && this.filter_param.length !== 0) {
        params[this.filter_key] = this.filter_param;
      }
      if (this.more_filter_key && this.more_filter_param.length !== 0) {
        params[this.more_filter_key] = this.more_filter_param;
      }
      // 传入外部参数作为查询条件
      Object.keys(this.extParams).forEach(key => {
        params[key] = this.extParams[key];
      });
      this.firstBusying = true; // 第一级正在忙于获取全部key
      this.$http.post(this.selectAllUrl, params).then(({ data: res }) => {
        (res.content || []).forEach(key => {
          // package_ids字段按升序格式化 例'1,2,3'
          this.$set(this.secondSelectedObj, this.isGamePackage && key.indexOf(',') !== -1 ? key.split(',').sort((a, b) => a - b).join(',') : key.toString(), shouldChecked);
        });
        if (!firstKey) {
          this.currentFirst = 'no';
        }
        this.formatFirstSelectStatus();
      }).finally(() => {
        this.firstBusying = false; // 第一级正在忙于获取全部key
      });
    },
    // 处理下拉框显示
    handlePopoverShow() {
      if (this.keyword !== '') {
        this.isKeyWords = true;
      }
      this.$nextTick(() => {
        this.isFocus = true;
        this.getFirstRecords();
        const scrollBar = this.$refs.first.$el.querySelector('.el-scrollbar__wrap');
        if (!scrollBar.dataset.isBindScroll) {
          scrollBar.addEventListener('scroll', ({ target }) => {
            const { scrollTop } = target;
            const { clientHeight } = scrollBar.querySelector('.el-scrollbar__view');
            if (clientHeight - scrollTop <= this.distance && this.isFirstAllowNext) {
              this.getFirstRecords();
            }
          });
          scrollBar.dataset.isBindScroll = true; // 标注已绑定滚动事件，无需重复绑定
        }
      });
    },
    // 自动展开第二级
    autoShowSecondList() {
      if (this.firstRecords.length === 0) return;
      this.$nextTick(() => {
        const defaultFirstItem = this.$refs.firstItem_0[0].nextSibling.nextSibling; // 第一级的箭头元素
        this.currentFirst = this.saveCurrentFirst;
        try {
          defaultFirstItem.click(); // 人为点击，触发显示第二级
        } catch (error) {
          // TODO
        }
      });
    },
    // 第二级显示时触发
    handleSecondShow() {
      this.$nextTick(() => {
        if (!this.$refs.second) { return false; }
        const scrollBar = this.$refs.second.$el.querySelector('.el-scrollbar__wrap');
        if (!scrollBar.dataset.isBindScroll) {
          scrollBar.addEventListener('scroll', ({ target }) => {
            const { scrollTop } = target;
            const { scrollHeight } = target;
            const pureHeight = target.clientHeight;
            if (Math.abs(scrollHeight - scrollTop - pureHeight) <= this.distance && this.isSecondAllowNext) {
              this.getSecondRecords();
            }
          });
          scrollBar.dataset.isBindScroll = true; // 标注已绑定滚动事件，无需重复绑定
        }
      });
    },
    // 处理第二级点击
    handleSecondClick(item, event) {
      if (['SPAN', 'I'].includes(event.target.nodeName)) {
        const isCheckBox = event.target.className.includes('checkbox');
        if (!isCheckBox) {
          this.$set(this.secondSelectedObj, item.value.toString(), !this.secondSelectedObj[item.value.toString()]);
        }
        if (!this.multiple) {
          this.$nextTick(() => {
            // TODO 不循环set视图不更新，直接覆盖secondSelectedObj没效果
            Object.keys(this.secondSelectedObj).forEach(key => {
              if (key !== item.value.toString()) {
                this.$set(this.secondSelectedObj, key, false);
              }
            });
          });
        }
      }
    },
    // 下拉框隐藏时触发
    handlePopoverHide() {
      this.firstPage = 1;
      this.isFocus = false;
      setTimeout(() => {
        if (!this.isFocus) {
          this.$set(this, 'secondRecords', []); // 如果过了一会后的确是收起状态，那就清空二级，避免再次点击时二级闪一下
          this.isOpenSecond = false; // 二级展开状态设为关闭
        }
      }, 300);
    },
    // 查询时触发
    handleInputChange() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.firstRecords = [];
        this.firstPage = 1;
        this.secondRecords = [];
        this.$refs.popover.createPopper(); // 自适应定位，避免边界时二级内容被折叠（会重置滚动高度）
        this.secondPage = 1;
        if (!this.$refs.popover.value) {
          this.$refs.popover.doShow();
        }
        this.isKeyWords = true;
        this.getFirstRecords();
      }, 250);
    },
    // 翻译已选名字
    transformName() {
      if (this.transform) {
        // this.loading = true;
        if (this.secondSelected.length === 0) {
          return this.$emit('transform-change', this.multiple ? [] : ''); // 发送改变时通知外部
        }
        const params = {
          per_page: Number.MAX_SAFE_INTEGER,
        };
        // 传入外部参数作为查询条件
        Object.keys(this.extParams).forEach(key => {
          params[key] = this.extParams[key];
        });
        params.ad_ids = this.secondSelected; // TODO 写死 临时
        this.$http.post(this.transformUrl, params).then(({ data: res }) => {
          const names = res.content.data.map(this.transformMap);
          this.$emit('transform-change', this.multiple ? names : (names[0] || '')); // 发送改变时通知外部
        }).finally(() => {
          // this.loading = false;
        });
      }
    },
    // 输入框尾部点击时触发
    handleSuffixClick({ target }) {
      this.$nextTick(() => {
        if (this.clearable && target.className.includes('el-icon-circle-close')) {
          this.firstSelectedObj = {};
          this.$set(this, 'firstSelectedObj', {});
          this.secondSelectedObj = {};
          this.$set(this, 'secondSelectedObj', {});
          this.keyword = '';// 清除筛选条件
        }
      });
    },
    // 处理全选
    handleSelectAll() {
      this.handleFirstSelectAll(false, true); // 不指定第一级，全选
      this.firstRecords.map(o => o.value).forEach(value => {
        this.$set(this.firstSelectedObj, value.toString(), 1); // 全选（如果查询获取全部里面可以返回带父亲信息会更好）
      });
      this.$emit('middle-change', this.firstSelectedObj); // 向外传递中间状态
    },
    // 处理全不选
    handleRemoveAll() {
      if (this.keyword !== '') {
        this.keyword = '';// 清除筛选条件
        this.handleInputChange();// 重新请求列表 否则清除不了已选数据
        this.$nextTick(() => {
          setTimeout(() => {
            this.handleRemoveAll();
            return false;
          }, 1000);
        });
      } else {
        this.handleFirstSelectAll(false, false); // 不指定第一级，全不选
        this.$set(this, 'firstSelectedObj', {}); // 全不选
        this.$emit('middle-change', this.firstSelectedObj); // 向外传递中间状态
      }
    },
    // 自动格式化第一级勾选状态
    // TODO 使用webworker对复杂耗时的逻辑进行运算，提高主线程性能
    formatFirstSelectStatus() {
      setTimeout(() => {
        const formatFirstItem = _currentFirst => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const currentMaxTotal = ((this.firstRecords.find(o => o.value === _currentFirst)) || { total: 0 }).total; // 当前一级最大能选多少个
          const currentSecondMaxValue = this.secondRecords.filter(o => o.parent === _currentFirst).map(o => o.value); // 当前展开的二级能选的全部值
          const currentSecondHasValue = this.secondSelected.filter(o => currentSecondMaxValue.includes(o)); // 当前展开的二级已选的值（交集）
          if (currentSecondHasValue.length === 0) {
            return 0; // 不选
          } else if (currentSecondHasValue.length === currentSecondMaxValue.length) {
            return 1; // 选中
          } else {
            return 2; // 半选
          }
        };
        if (this.multiple) {
          this.$nextTick(() => {
            this.firstRecords.forEach(item => {
              // 只能监听到当前展开的二级中间状态，非展开的无法判断，需要后续优化【需要留意的地方1】
              if (this.currentFirst === item.value) {
                this.$set(this.firstSelectedObj, item.value.toString(), formatFirstItem(item.value)); // 强制触发一级选中状态
              }
            });
            this.$emit('middle-change', this.firstSelectedObj); // 向外传递中间状态
          });
        }
      }, 25);
    },
    // 记住当前滚动条高度，避免自适应后高度变化
    rememberScrollbarHeight(callback = () => { }) {
      const firstScrollbarDom = this.$refs.first.$el.querySelector('.el-scrollbar__wrap');
      const firstBeforeScrollTop = firstScrollbarDom.scrollTop; // 缓存当前一级滚动高度
      let secondScrollbarDom;
      let secondBeforeScrollTop;
      if (this.$refs.second) {
        secondScrollbarDom = this.$refs.second.$el.querySelector('.el-scrollbar__wrap');
        secondBeforeScrollTop = secondScrollbarDom.scrollTop; // 缓存当前二级滚动高度
      }
      callback();
      this.$nextTick(() => {
        firstScrollbarDom.scrollTo(0, firstBeforeScrollTop); // 恢复一级滚动高度
        if (this.$refs.second) {
          secondScrollbarDom.scrollTo(0, secondBeforeScrollTop); // 恢复二级滚动高度
        }
      });
    }
  },
  watch: {
    value: {
      handler() {
        if (this.secondSelected.toString() !== this.value.toString()) {
          const objs = {};
          if (this.multiple) {
            this.value.forEach(o => {
              objs[o.toString()] = true;
            });
            if (this.value.length === 0) {
              Object.keys(this.firstSelectedObj).forEach(key => {
                this.$set(this.firstSelectedObj, key, 0); // 当外部强制变成空时，内部也修改中间状态【需要留意的地方2】
              });
              this.$emit('middle-change', this.firstSelectedObj); // 向外传递中间状态
            }
          } else {
            objs[this.value.toString()] = true;
          }
          this.$set(this, 'secondSelectedObj', objs);
        }
      },
      immediate: true
    },
    secondSelected() {
      if (this.secondSelected.toString() !== this.value.toString()) {
        this.$emit('change', this.multiple ? this.secondSelected : (this.secondSelected[0] || '')); // 发送改变时通知外部
      }
      this.transformName();
      this.formatFirstSelectStatus();
    },
    middleState: {
      handler() {
        if (JSON.stringify(this.firstSelectedObj) !== JSON.stringify(this.middleState)) {
          this.$set(this, 'firstSelectedObj', JSON.parse(JSON.stringify(this.middleState)));
        }
      },
      immediate: true,
      deep: true
    },
    shouldClose: {
      handler() {
        if (this.shouldClose) {
          this.$refs.popover.doClose();
        }
      },
    },
  }
};
</script>

<style lang="less">
.plugin-cascader-select-common {
  display: inline-block;
  position: relative;
}
.plugin-cascader-select-common-input {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding-left: 15px;
  width: 146px;
  outline: none;
  &.is-focus {
    border-color: #409eff;
  }
  &[readonly] {
    cursor: default;
  }
  .tags {
    flex: none;
    margin-right: 10px;
    font-size: 12px;
    margin-left: -10px;
  }
  .el-input {
    flex: 1;
    input {
      padding-left: 0px;
      padding-right: 26px;
      border: none;
      outline: none;
      line-height: 26px;
      height: 26px;
    }
  }
}
.plugin-cascader-select-common-panel {
  margin: -6px -12px;
  display: flex;
  max-width: 100vw;
  overflow: auto;
  .panel-item {
    height: 186px; // 修复底部遮挡问题
    min-width: 180px;
    border-left: 1px solid #e4e7ed;
    &:first-child {
      border-left: none;
    }
    .scrollbar {
      box-sizing: border-box;
      height: 100%;
      /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
      }
      // 修复滚动条遮挡最后一项
      /deep/ .is-horizontal {
        bottom: -6px;
      }
    }
    .btns {
      text-align: center;
      padding: 6px 0;
      margin-top: -6px;
      border-bottom: 1px solid #f2f2f2;
      position: absolute;
      top: 0;
      z-index: 2;
      background: #fff;
      width: 100%;
    }
    .lineheight {
      background: #f5f7fa;
    }
    .item {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2px 9px 2px 15px;
      min-height: 34px;
      outline: none;
      color: #606266;
      font-size: 14px;
      cursor: pointer;
      &:hover {
        background: #f5f7fa;
      }
      .el-checkbox {
        flex: none;
        margin-right: 8px;
      }
      span {
        flex: 1;
        font-size: 12px;
      }
      i {
        flex: none;
        // margin-left: 8px;
      }
      .el-icon-arrow-right {
        padding: 10px 11px;
        &:hover {
          color: #409eff;
        }
      }
    }
    .item-null {
      padding: 10px 0;
      margin: 40px 0 0 0;
      text-align: center;
      color: #999;
      font-size: 14px;
    }
  }
}
</style>
