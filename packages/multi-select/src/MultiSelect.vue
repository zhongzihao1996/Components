<template>
  <el-select size="mini" v-model="val" class="multi-select" :class="type" :popper-class="`multi-select-popper ${smallSize? 'smallSize' : ''}`" multiple filterable reserve-keyword
    :filter-method="handleFilter" @visible-change="handleVisibleChange" :placeholder="placeholder">
    <template slot="prefix" v-if="countVisible">
      <span class="count">{{ countText + (smallSize? '' : placeholder) }}</span>
    </template>
    <div class="select-all">
      <button type="button" class="jh-button" @click="selectAll()">全选</button>
      <button type="button" class="jh-button" @click="selectNone()">全不选</button>
    </div>
    <template v-if="group">
      <el-option-group v-for="(group, groupName, index1) in opts" :label="groupName" :key="index1" @click.native="selectGroup(group)">
        <el-option v-for="obj in group" :label="obj[label_field]" :value="obj[value_field]" :key="obj[value_field]"></el-option>
      </el-option-group>
    </template>
    <template v-else>
      <el-option v-for="obj in opts" :label="obj[label_field]" :value="obj[value_field]" :key="obj[value_field]"></el-option>
    </template>
  </el-select>
</template>
<style lang="scss">
.multi-select-popper {
  &.smallSize {
    min-width: 180px !important;
  }
  .el-scrollbar {
    padding-top: 52px;
  }
}
</style>
<style scoped lang='scss'>
.multi-select ::v-deep .el-icon-arrow-up:before {
  content: '\e6e1';
}
.el-select-group__wrap:not(:last-of-type)::after {
  background: none;
  height: 0;
  display: none;
}
.el-select-group__wrap {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
  &:not(:last-of-type) {
    padding-bottom: 0;
  }
}
span:focus-within {
  border: none;
  outline: none;
}
.el-select-group__wrap ::v-deep.el-select-group__title {
  text-align: center;
  padding-left: 0;
  cursor: pointer;
  // background: $stripeColor;
}
.multi-select ::v-deep.el-select__tags > span {
  display: none;
}
.multi-select ::v-deep.el-input .count {
  // color: $normalFontColor;
  // background-color: $lineColor;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0 5px;
  margin: 0 2px;
  height: 20px;
  line-height: 28px;
}
.multi-select ::v-deep.el-input .el-input__prefix {
  width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}
.select-all {
  width: 100%;
  text-align: center;
  // border-bottom: 1px solid $lineColor;
  padding: 10px 0;
  position: absolute;
  top: 0;
  left: 50%;
  font-size: 0;
  background: #fff;
  z-index: 99;
  -webkit-transform: translate(-50%, 0);
  -ms-transform: translate(-50%, 0);
  transform: translate(-50%, 0);
}
</style>

<script lang='ts'>
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

interface SelectData {
  value: number;
  label: string;
}

@Component({ name: 'multiSelect' })
export default class multiSelect extends Vue {
  @Prop()
  type!: string

  @Prop({
    type: Boolean,
    default: false
  })
  smallSize!: boolean

  @Prop()
  options!: any

  @Prop()
  placeholder!: string

  @Prop()
  group!: boolean

  @Prop()
  labelField!: string

  @Prop()
  valueField!: string

  @Prop()
  parentVal!: Array<string>

  val: Array<string> = this.parentVal || []

  label_field: string = this.labelField || 'label'

  value_field: string = this.valueField || 'value'

  opts: any = this.options || []

  filter = ''

  get allVal() {
    return this.getAllVal(this.opts);
  }

  get optionsLength() {
    let length = 0;
    if (this.options) {
      if (this.group) {
        Object.keys(this.options).forEach((key) => {
          length += this.options[key].length;
        });
      } else {
        // eslint-disable-next-line prefer-destructuring
        length = this.options.length;
      }
    }
    return length;
  }

  get countVisible() {
    return this.val.length > 0;
  }

  get countText() {
    return this.val.length === this.optionsLength ? '已选全部' : `已选${this.val.length}个`;
  }

  // 父组件的值回传给子组件，保持两者始终一致
  @Watch('parentVal')
  onParentValChange(newValue: Array<string>) {
    if (typeof this.parentVal !== 'undefined') {
      this.val = newValue;
    }
  }

  @Watch('val')
  onValChange(newValue: Record<string, any>) {
    // val改变时改变输入框光标位置
    this.$nextTick(() => {
      const input = document.querySelectorAll(`.${this.type} .el-select__input`) as any;
      const span = document.querySelectorAll(`.${this.type} .el-input__prefix .count`) as any;
      if (this.val.length > 0) {
        if (span[0]) {
          input[0].style.marginLeft = `${span[0].offsetWidth + 10}px`;
        }
      } else {
        input[0].style.marginLeft = '15px';
      }
    });
    this.$emit('update', this.type, newValue);
  }

  @Watch('options')
  onOptionsChange() {
    // 父组件传进来的options有变化时，更新子组件的opts
    this.opts = this.options;
    this.filterVal();
  }

  mounted() {
    // 初始化输入框
    // this.getSelectInput();
  }

  // 下拉菜单选项联动变化后，之前选中的选项有可能会被去掉，过滤掉这部分选项的值
  // eslint-disable-next-line consistent-return
  filterVal() {
    if (this.val.length > 0) {
      const allVal = this.getAllVal(this.options);
      this.val = this.val.filter(val => allVal.indexOf(val) !== -1);
    } else {
      return [];
    }
  }

  // 获取选项中所有的值，返回数组
  getAllVal(opts: any) {
    if (opts) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const vm = this;
      const allVal = [];
      if (this.group) {
        Object.keys(opts).forEach((key) => {
          for (let i = 0; i < opts[key].length; i += 1) {
            allVal.push(opts[key][i][vm.value_field]);
          }
        });
      } else {
        // 不分组的数据
        for (let i = 0; i < opts.length; i += 1) {
          allVal.push(opts[i][vm.value_field]);
        }
      }
      return allVal;
    }
    return [];
  }

  handleFilter(query: string) {
    this.filter = query;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const vm = this;
    if (query !== '' && this.options) {
      if (this.group) {
        // 分组
        this.opts = {};
        Object.keys(this.options).forEach((key) => {
          const newGroup = this.options[key].filter(
            // toLowerCase是String对象的方法，要先转成字符串才能使用，否则报错function不存在
            (obj: any) => `${obj[vm.label_field]}`.toLowerCase().indexOf(query.toLowerCase()) > -1
              || `${obj[vm.value_field]}`.toLowerCase().indexOf(query.toLowerCase()) > -1
          );
          if (newGroup.length > 0) {
            vm.opts[key] = newGroup;
          }
        });
      } else {
        // 不分组
        this.opts = this.options.filter(
          // toLowerCase是String对象的方法，要先转成字符串才能使用，否则报错function不存在
          (obj: any) => `${obj[vm.label_field]}`.toLowerCase().indexOf(query.toLowerCase()) > -1
            || `${obj[vm.value_field]}`.toLowerCase().indexOf(query.toLowerCase()) > -1
        );
      }
    } else {
      this.opts = this.options;
    }
  }

  handleVisibleChange(isVisible: boolean) {
    // 下拉菜单关闭时，把下拉菜单更新回未筛选状态
    if (!isVisible) {
      this.handleFilter('');
    }
    this.$emit('visible-change', isVisible);
  }

  selectAll() {
    // 创建一个新数组再赋值，避免this.val 和 this.allVal 存的地址相同（最后找到同一个数组数据）
    this.val = [...this.allVal];
  }

  selectNone() {
    this.val = [];
  }

  selectGroup(group: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const vm = this;
    // 单击的组里所有选项的值集合
    const groupAllVal = [];
    for (let i = 0; i < group.length; i += 1) {
      groupAllVal.push(group[i][vm.value_field]);
    }
    // 单击的组里目前被选中的选项的个数
    let num = 0;
    // 匹配上的值在已选中的值的集合数组中的索引，用于删除单元
    // let index = -1;
    const valCopy = [...vm.val];
    for (let i = 0; i < groupAllVal.length; i += 1) {
      for (let j = 0; j < valCopy.length; j += 1) {
        if (groupAllVal[i] === valCopy[j]) {
          valCopy.splice(j, 1);
          num += 1;
        }
      }
    }
    // 如果num小于组里选项的个数，表示当前没有全选组里的选项，单击组头时全选组里的选项
    if (num < groupAllVal.length) {
      this.val = [...valCopy, ...groupAllVal];
    } else {
      this.val = valCopy;
    }
  }

  getSelectInput() {
    // 缓存初始化
    // const storage = localStorage.getItem('searchForm');
    // if (storage) {
    //   const searchStorge = JSON.parse(storage);
    // }
  }
}
</script>
