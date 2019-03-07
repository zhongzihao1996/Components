<template>
  <th class="infinite-scroll-column" :data-infinite-fixed="fixed===''?undefined:fixed">
    <div v-if="sortable" class="sortable" @click="sortchange()">
      {{label}}
      <span class="caret-wrapper">
        <i class="el-icon-caret-top" :class="isAsc?'current':''"></i>
        <i class="el-icon-caret-bottom" :class="isDesc?'current':''"></i>
      </span>
    </div>
    <el-popover v-else-if="filteable" placement="bottom" trigger="click" popper-class="filter-popper" v-model="visible">
      <span slot="reference">{{label}} <i class="el-icon-arrow-down"></i></span>
      <el-form>
        <el-checkbox-group v-model="checkeds">
          <el-checkbox v-for="(item,index) in options" :key="'checkbox__'+index" :label="item" />
        </el-checkbox-group>
        <div class="btns">
          <el-button type="text" @click="filtechange()">筛选</el-button>
          <el-button type="text" @click="filtechange(true)">重置</el-button>
        </div>
      </el-form>
    </el-popover>
    <template v-else>
      {{label}}
    </template>
  </th>
</template>

<script>
import utils from '../utils';
export default {
  props: {
    label: {
      type: String,
      default: '　'
    },
    prop: {
      type: String
    },
    sortable: {
      type: Boolean,
      default: false
    },
    filteable: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      checkeds: []
    };
  },
  computed: {
    rootScope() {
      return this.$parent.$parent;
    },
    options() {
      if (!this.filteable) {
        return [];
      } else {
        let arr = [];
        let groups = [];
        if (this.rootScope.raws !== undefined) {
          groups = utils.groupBy(this.rootScope.raws, this.prop);
        } else {
          groups = utils.groupBy(this.rootScope.data, this.prop);
        }
        for (let key in groups) {
          arr.push(groups[key][0][this.prop]);
        }
        return arr;
      }
    },
    isAsc() {
      return (
        this.rootScope.sortProp === this.prop &&
        this.rootScope.sortOrder === 'asc'
      );
    },
    isDesc() {
      return (
        this.rootScope.sortProp === this.prop &&
        this.rootScope.sortOrder === 'desc'
      );
    }
  },
  methods: {
    sortchange() {
      this.rootScope.sortChange(this.prop);
    },
    filtechange(isreset) {
      if (isreset) {
        this.checkeds = [];
      }
      this.rootScope.filteChange({ prop: this.prop, groups: this.checkeds });
      this.visible = false;
    }
  }
};
</script>

<style lang="less" scoped>
th.infinite-scroll-column {
  .sortable {
    cursor: pointer;
    padding-right: 6px;
    .caret-wrapper {
      position: relative;
      color: #c0c4cc;
      i {
        position: absolute;
        &.current {
          color: #409eff;
        }
        &:last-child {
          top: 6px;
        }
      }
    }
  }
}
.filter-popper {
  .el-checkbox-group {
    max-height: 300px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background: rgba(0, 0, 0, 0.2);
    }
    &::-webkit-scrollbar-track {
      border-radius: 0;
      background: rgba(0, 0, 0, 0.1);
    }
  }
  label.el-checkbox {
    display: block;
    margin: 0 0 8px 0;
  }
  .btns {
    margin: 8px 0 -8px 0;
    border-top: 1px solid #ebeef5;
  }
}
</style>
