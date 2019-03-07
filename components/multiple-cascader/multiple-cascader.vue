<template>
  <el-popover :trigger="trigger" class="multiple-cascader" popper-class="multiple-cascader-container" ref="popover" @show="handleShow" @hide="handleHidden" :disabled="disabled">
    <el-input slot="reference" size="mini" class="input" :placeholder="selectedValues.length>0?'':placeholder" v-model="keyword" :clearable="clearable" :suffix-icon="suffixCls[0]" @keyup.native="handleInputChange($event)" @clear="handleInputClear()" @focus="handleInputFocus()" @blur="handleInputBlur()" :disabled="disabled" :readonly="!filterable" :style="{width:width}">
      <span slot="prefix" v-if="(!isFocus&&!keyword)&&selectedValues.length>0">
        已选择{{selectedValues.length}}个{{extraval}}
      </span>
    </el-input>
    <div class="no-filter" v-if="keyword&&cascaderOptions[0].length===0">无匹配数据</div>
    <el-checkbox-group v-model="selectedValues" class="cascader-checkbox-group" @change="change">
      <div class="cascader-column" v-for="(columnOptions,i1) in cascaderOptions" :key="i1">
        <div class="cascader-column-cell" v-for="(item,i2) in columnOptions" :key="i2" :class="currentLevels.includes(item.value)?'current':''">
          <div v-if="item.children" class="el-checkbox" @click="optionClick(item,i1)">
            <span class="el-checkbox__label" :class="item.disabled?'disabled':''">{{item.label}}</span><i class="el-icon-arrow-right" @dblclick="optionDbclick(item,i1)" :title="item.disabled?'':'全选/全不选'"></i>
          </div>
          <el-checkbox :label="item.value" v-else :checked="currentLevels.includes(item.value)" :disabled="item.disabled">{{item.label}}</el-checkbox>
        </div>
      </div>
    </el-checkbox-group>
  </el-popover>
</template>

<script>
let inputTimer = false;
export default {
  props: {
    options: {
      type: Array,
      required: true
    },
    value: {
      type: Array,
      required: true
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
    },
    width: {
      type: String,
      default: '193px'
    },
    trigger: {
      type: String,
      default: 'click' //click/focus/hover/manual
    }
  },
  data() {
    return {
      cascaderOptions: [],
      selectedValues: [],
      currentLevels: [],
      keyword: '',
      suffixCls: ['el-icon-arrow-down', 'el-icon-arrow-up'],
      isFocus: false
    };
  },
  methods: {
    optionClick(item, level) {
      if (!item.children || item.disabled) return false;
      level = level + 1;
      this.currentLevels.splice(level, this.currentLevels.length - level);
      this.cascaderOptions.splice(level, this.cascaderOptions.length - level);
      this.$set(this.currentLevels, level - 1, item.value);
      this.cascaderOptions.push(item.children);
    },
    optionDbclick(item, level) {
      if (!item.children || item.disabled) return false;
      let getChildren = meun => {
        let ids = [];
        if (meun.children) {
          meun.children.forEach(child => {
            ids.push(...getChildren(child));
          });
        } else {
          if (!meun.disabled) {
            ids.push(meun.value);
          }
        }
        return ids;
      };
      let isall = true;
      let ids = getChildren(item);
      for (let i = 0; i < ids.length; i++) {
        if (!this.selectedValues.includes(ids[i])) {
          isall = false;
          break;
        }
      }
      if (isall) {
        this.selectedValues = this.selectedValues.filter(o => !ids.includes(o));
      } else {
        this.selectedValues = Array.from(
          new Set(this.selectedValues.concat(ids))
        );
      }
      this.change();
    },
    handleInputChange(e) {
      clearTimeout(inputTimer);
      inputTimer = setTimeout(() => {
        this.$refs.popover.showPopper = true;
        this.keyword = e.target.value;
        this.setOptions(e.target.value);
      }, 300);
    },
    handleInputClear() {
      this.setOptions();
      this.change();
    },
    handleInputFocus() {
      this.isFocus = true;
    },
    handleInputBlur() {
      this.isFocus = false;
    },
    handleShow() {
      this.suffixCls.reverse();
    },
    handleHidden() {
      this.suffixCls.reverse();
      if (!this.isFocus) {
        this.keyword = '';
        console.log('清空');
      }
    },
    setOptions(keyword) {
      let raws = JSON.parse(JSON.stringify(this.options));
      let getKeywordOptions = menu => {
        let obj = null;
        if (menu.label.includes(keyword)) {
          obj = menu;
        } else {
          if (menu.children) {
            obj = JSON.parse(JSON.stringify(menu));
            obj.children = [];
            menu.children.forEach(child => {
              let tmp = getKeywordOptions(child);
              if (tmp) {
                obj.children.push(tmp);
              }
            });
            obj = obj.children.length === 0 ? null : obj;
          }
        }
        return obj;
      };
      if (keyword) {
        let os = [];
        raws.forEach(menu => {
          let tmp = getKeywordOptions(menu);
          if (tmp) {
            os.push(tmp);
          }
        });
        raws = os;
      }
      this.currentLevels = [];
      this.cascaderOptions = [raws];
      this.$refs.popover.createPopper(); // 重新定位
    },
    change() {
      this.$emit('change', this.selectedValues);
    }
  },
  watch: {
    options() {
      this.setOptions();
    },
    value() {
      this.selectedValues = JSON.parse(JSON.stringify(this.value));
    }
  }
};
</script>

<style lang="less">
.multiple-cascader {
  line-height: normal;
  .input {
    position: relative;
    outline: none;
    .el-input__prefix {
      cursor: pointer;
      text-align: left;
      z-index: 5;
      width: 80%;
      display: flex;
      align-items: center;
      > span {
        margin-left: 5px;
        display: block;
        background: #f0f2f5;
        padding: 1px 6px;
        border-radius: 3px;
        color: #909399;
      }
    }
    .el-input__inner {
      position: relative;
      z-index: 12;
      padding-left: 15px;
      background: transparent;
      cursor: pointer;
    }
    .el-input__suffix {
      z-index: 12;
    }
  }
}
.multiple-cascader-container {
  line-height: normal;
  overflow: hidden;
  .cascader-checkbox-group {
    height: 100%;
    overflow: auto;
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
    .cascader-column {
      height: 100%;
      min-width: 160px;
      display: inline-table;
      .cascader-column-cell {
        position: relative;
        &:hover {
          background: #f5f7fa;
          cursor: pointer;
        }
        &.current {
          span.el-checkbox__label {
            color: #409eff;
          }
        }
        .el-checkbox {
          display: block;
          padding: 8px 10px;
        }
        .el-checkbox__label {
          padding-right: 15px;
          &.disabled {
            color: #c0c4cc;
            cursor: not-allowed;
          }
        }
        .el-icon-arrow-right {
          font-size: 12px;
          position: absolute;
          right: 10px;
          top: 12px;
          color: #bfcbd9;
        }
      }
    }
  }
  .no-filter {
    color: #c0c4cc;
    background-color: #fff;
    cursor: not-allowed;
    font-size: 14px;
    padding: 5px;
  }
}
</style>

