<template>
  <div>
    <el-date-picker unlink-panels
                    :picker-options="pickerOptions"
                    v-model="innerDate"
                    @change="dateChange"
                    :type="type"
                    :format="dateType"
                    :value-format="dateType"
                    :default-time="defaultTime"
                    :range-separator="rangeSeparator"
                    :placeholder="placeholder"
                    :start-placeholder="startPlaceholder"
                    :end-placeholder="endPlaceholder"
                    :size="size"
                    :editable="editable"
                    :disabled="disabled"
                    popper-class="date-picker-pop-panel"
                    :class="{ 'has-second': dateType === 'yyyy-MM-dd HH:mm:ss' }">
    </el-date-picker>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

interface PickerOptionsData {
  text: string,
  onClick?: Function
}

interface DisabledDateFun {
  (date: Date): boolean
}

interface PickerOptions {
  shortcuts?: PickerOptionsData[]
  disabledDate?: DisabledDateFun
}

type DateValueType = Array<string> | string | null;

@Component({ name: 'datePicker'})
export default class datePicker extends Vue {
  @Prop({ default: 'mini' })
  size!: string;

  @Prop()
  disabled!: boolean;

  @Prop({ default: true })
  editable!: boolean;

  @Prop()
  searchFormDate!: DateValueType;

  @Prop({ default: 'daterange' })
  type!: string;

  @Prop({ default: true })
  isLimit!: boolean;

  @Prop({ default: 'yyyy-MM-dd' })
  dateType!: string;

  @Prop()
  defaultTime!: Array<string>;

  @Prop({ default: '至' })
  rangeSeparator!: string;

  @Prop()
  placeholder!: string;

  @Prop({ default: '开始日期' })
  startPlaceholder!: string;

  @Prop({ default: '结束日期' })
  endPlaceholder!: string;

  @Prop()
  pickerOptionsData!: PickerOptionsData[];

  innerDate: DateValueType = null;

  pickerOptions: PickerOptions = Object.assign(
    this.isLimit? 
      {
        disabledDate(time: Date) {
          return time.getTime() > Date.now() - 8.64e6;
        }
      }
      : {},
    this.type === 'datetimerange' ? {} : { shortcuts: this.pickerOptionsData || undefined }
  );

  @Watch('searchFormDate', { immediate: true })
  onSearchFormDateChange() {
    this.innerDate = this.searchFormDate;
  }

  dateChange(val: DateValueType) {
    this.$emit('dateChange', val);
    // 父组件使用：searchFormDate.sync 绑定时会自动更新值，否则需要监听dateChange事件来更新
    this.$emit('update:searchFormDate', val);
  }
}
</script>

<style scoped lang="scss">
/deep/.el-range-editor {
  .el-icon-time:before { content: "\e71f"; }
  .el-icon-date:before { content: "\e78e"; }
  .el-range-separator {
    line-height: 26px;
  }
  .el-range__close-icon {
    display: none;
  }
}
.el-range-editor.el-input__inner {
  padding: 0 10px;
  width: 200px;
  &.el-date-editor--datetimerange {
    width: 280px;
    &.has-second {
      width: 310px;
    }
  }
}
</style>

<style lang="scss">
.date-picker-pop-panel.el-picker-panel {
  .el-icon-d-arrow-left:before { content:"\e6dd" }
  .el-icon-arrow-left:before { content:"\e6de" }
  .el-icon-arrow-right:before { content:"\e6e0" }
  .el-icon-d-arrow-right:before { content:"\e6dc" }
  .el-button+.el-button {
    margin-left: 10px;
  }
  .el-button {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    background: #FFF;
    border: 1px solid #DCDFE6;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
    -webkit-transition: .1s;
    transition: .1s;
    font-weight: 500;
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 4px;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
    vertical-align: middle;
    &.el-button--mini {
      padding: 7px 15px;
      font-size: 12px;
      border-radius: 3px;
    }
    &:hover, &:focus {
      color: $mainColor;
      border-color: #c6e2ff;
      background-color: #ecf5ff;
      &.is-plain {
        background: #FFF;
        border-color: $mainColor;
        color: $mainColor;
      }
    }
    &:active {
      color: #3a8ee6;
      border-color: #3a8ee6;
      outline: none;
      &.is-plain {
        border-color: #3a8ee6;
        color: #3a8ee6;
        background: #fff;
        outline: none;
      }
    }
    &.is-disabled, &.is-disabled:focus, &.is-disabled:hover {
      color: #C0C4CC;
      cursor: not-allowed;
      background-image: none;
      background-color: #FFF;
      border-color: #EBEEF5;
      &.is-plain {
        background-color: #FFF;
        border-color: #EBEEF5;
        color: #C0C4CC;
      }
    }
    &.el-button--text {
      color: $mainColor;
      background: 0 0;
      padding-left: 0;
      padding-right: 0;
      border-color: transparent;
      &:hover, &:focus {
        color: #66b1ff;
        border-color: transparent;
        background-color: transparent;
      }
    }
  }
}
</style>
