<template>
  <div class="infinite-el-select" v-infinite-scroll="scrollLoad" data-scroll-target=".el-select-dropdown .el-select-dropdown__wrap" v-infinite-scroll-disabled="busy" v-infinite-scroll-distance="250" :data-count="data.length">
    <el-select size="mini" :popper-class="showBtn&&multiple?'infinite-popper-el-select showbtn':'infinite-popper-el-select'" v-model="selfValue" :multiple="multiple" reserve-keyword collapse-tags :filterable="filterable" @visible-change="handleVisible" @change="handleChange" :filter-method="handleFilter" :placeholder="placeholder" :disabled="disabled" :clearable="clearable" @clear="handlerClear">
      <div class="count" slot="prefix" v-if="multiple&&selfValue.length>0&&!isFocus">{{multipleLabel}}</div>
      <div class="label" slot="prefix" v-if="!multiple&&!isFocus">{{selectLabel}}</div>
      <div class="option-btns" v-if="showBtn&&multiple">
        <el-button size="mini" @click="selectAll()">全选</el-button>
        <el-button size="mini" @click="selectNone()">全不选</el-button>
      </div>
      <template v-if="isgroup">
        <el-option-group v-for="group in options" :key="group.label" :label="group.label||'-'" :disabled="group.disabled" @click.native="selectGroup(group)">
          <el-option v-for="(item,index) in group.children" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled">
            <slot :row="item" :index="index"></slot>
          </el-option>
        </el-option-group>
      </template>
      <template v-else>
        <el-option v-for="(item,index) in options" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled">
          <slot :row="item" :index="index"></slot>
        </el-option>
      </template>
    </el-select>
  </div>
</template>

<script>
export default {
  props: {
    raws: {
      type: Array,
      required: true
    },
    value: {
      required: true
    },
    isgroup: {
      type: Boolean,
      default: false
    },
    step: {
      type: Number,
      default: 100
    },
    showBtn: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    extraval: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      busy: false,
      selfValue: undefined,
      options: [],
      isFocus: false,
      keyword: undefined
    };
  },
  computed: {
    data() {
      //数据源（统一转成一维数组）
      let arr = [];
      if (this.isgroup) {
        this.raws.forEach(group => {
          group.children.forEach(item => {
            if (
              !this.keyword ||
              item.label.toLowerCase().includes(this.keyword.toLowerCase())
            ) {
              arr.push({
                label: item.label,
                value: item.value,
                disabled: item.disabled ? true : false,
                _label: group.label,
                _value: group.value,
                _disabled: group.disabled ? true : false
              });
            }
          });
        });
      } else {
        this.raws.forEach(item => {
          if (
            !this.keyword ||
            item.label.toLowerCase().includes(this.keyword.toLowerCase())
          ) {
            arr.push({
              label: item.label,
              value: item.value,
              disabled: item.disabled ? true : false
            });
          }
        });
      }
      setTimeout(() => {
        this.init(); //修复raws被替换时，options无法及时更新的bug
      });
      return arr;
    },
    count() {
      let count = 0;
      if (this.isgroup) {
        this.options.forEach(group => {
          count += group.children.length;
        });
      } else {
        count = this.options.length;
      }
      return count;
    },
    selectLabel() {
      let label = '';
      if (this.isgroup) {
        for (let i = 0; i < this.raws.length; i++) {
          let group = this.raws[i];
          if (label) break;
          for (let j = 0; j < group.children.length; j++) {
            if (group.children[j].value === this.selfValue) {
              label = group.children[j].label;
              break;
            }
          }
        }
      } else {
        for (let i = 0; i < this.raws.length; i++) {
          if (this.raws[i].value === this.selfValue) {
            label = this.raws[i].label;
            break;
          }
        }
      }
      return label || this.selfValue;
    },
    multipleLabel() {
      if (this.selfValue.length === this.data.length && this.data.length > 0) {
        return '已选择全部' + this.extraval;
      } else {
        return '已选择' + this.selfValue.length + '个' + this.extraval;
      }
    }
  },
  mounted() {
    this.selfValue = this.value;
    if (this.$el.querySelector('input')) {
      this.$el.querySelector('input').addEventListener('keyup', e => {
        this.isFocus = e.target.value.length === 0 ? false : true;
      });
    }
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.options = [];
        this.busy = false;
        this.scrollLoad();
      });
    },
    scrollLoad() {
      this.busy = true;
      if (this.raws.length === 0 || this.count === this.data.length) {
        return false;
      }
      let start = this.count;
      let tmp = this.data.slice(start, start + this.step);
      if (tmp.length > 0) {
        if (this.isgroup) {
          let glabels = [];
          let groups = [];
          tmp.forEach(item => {
            if (!glabels.includes(item._label)) {
              glabels.push(item._label);
              groups.push({
                label: item._label,
                value: item._value,
                disabled: item._disabled ? true : false,
                children: []
              });
            }
            groups[glabels.indexOf(item._label)].children.push({
              label: item.label,
              value: item.value,
              disabled: item.disabled ? true : false
            });
          });
          if (
            this.options.length === 0 ||
            this.options[this.options.length - 1].label !== groups[0].label
          ) {
            //新数据与已显示数据不存在组交集
            this.options.push(...groups);
          } else {
            //新数据与已显示数据存在组交集
            let first = groups.splice(0, 1)[0];
            let children = this.options[this.options.length - 1].children;
            children = children.concat(first.children);
            this.$set(
              this.options[this.options.length - 1],
              'children',
              children
            );
            if (groups.length > 0) {
              this.options.push(...groups);
            }
          }
          this.$nextTick(() => {
            this.busy = false;
          });
        } else {
          this.options.push(...tmp);
          this.$nextTick(() => {
            this.busy = false;
          });
        }
      }
    },
    selectAll() {
      if (!this.multiple) return false;
      let vals = [];
      if (this.isgroup) {
        this.data.forEach(item => {
          if (!item.disabled && !item._disabled) {
            vals.push(item.value);
          }
        });
      } else {
        this.data.forEach(item => {
          if (!item.disabled) {
            vals.push(item.value);
          }
        });
      }
      this.selfValue = vals;
      this.handleChange();
    },
    selectNone() {
      this.selfValue = [];
      this.handleChange();
    },
    selectGroup(group) {
      if (!this.multiple) return false;
      let ids = [];
      let isfull = true;
      let children = [];
      this.data.forEach(item => {
        if (item._label === group.label) {
          if (!item.disabled && !item._disabled) {
            children.push(item.value);
          }
        }
      });
      children.forEach(item => {
        isfull = isfull && this.selfValue.includes(item);
        ids.push(item);
      });
      if (isfull) {
        let _tmp = [];
        this.selfValue.forEach(n => {
          if (!ids.includes(n)) {
            _tmp.push(n);
          }
        });
        this.selfValue = _tmp;
      } else {
        let list = JSON.parse(JSON.stringify(this.selfValue));
        list.push(...ids);
        this.selfValue = Array.from(new Set(list));
      }
      this.handleChange();
    },
    handleVisible(visible) {
      this.isFocus = false;
      if (!visible && this.filterable) {
        this.handleFilter();
      }
    },
    handleChange() {
      this.$emit('change', this.selfValue);
    },
    handleFilter(keyword) {
      if (this.keyword !== keyword) {
        this.keyword = keyword;
        this.init();
      }
    },
    handlerClear() {
      this.selfValue = this.multiple ? [] : undefined;
      this.handleChange();
    }
  },
  watch: {
    value() {
      this.selfValue = this.value;
    }
  }
};
</script>

<style lang="less">
.infinite-el-select {
  display: inline-block;
  position: relative;
  line-height: normal;
  .el-select__tags {
    > span {
      display: none;
    }
  }
  .el-input__prefix {
    display: flex;
    align-items: center;
    width: calc(100% - 30px);
    .count {
      background: #f0f2f5;
      padding: 1px 6px;
      border-radius: 3px;
      color: #909399;
      margin-left: 7px;
      height: 18px;
      line-height: 18px;
    }
    .label {
      color: #606266;
      padding-left: 10px;
      width: 100%;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      background: #fff;
      line-height: normal;
    }
  }
  .el-input {
    input {
      padding-left: 15px;
    }
  }
}
.infinite-popper-el-select {
  line-height: normal;
  &.showbtn {
    .el-select-dropdown__list {
      padding-top: 39px;
      .option-btns {
        width: 100%;
        text-align: center;
        position: absolute;
        top: 0;
        z-index: 10;
        padding: 5px 0;
        border-bottom: 1px solid #f2f2f2;
        background: #fff;
        .el-button {
          padding: 7px 8px;
          + .el-button {
            margin-left: 3px;
          }
        }
      }
    }
  }
  .el-select-group__title {
    border-bottom: 1px solid #fff;
  }
}
</style>

