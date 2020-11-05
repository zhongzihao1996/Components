<template>
  <div>
    <p class="demo-main-title">后台组件demo</p>
    <div class="box">
      <h3 class="box-title">日期时间选择组件</h3>
      <date-picker :searchFormDate.sync="date" type="datetimerange" :isLimit='false' dateType="yyyy-MM-dd HH:mm:ss" @dateChange="dateChange"></date-picker>
      <p>当前选择时间: {{date}}</p>
    </div>

    <div class="box">
      <h3 class="box-title">弹窗组件</h3>
      <div>
        <span class="button-span" @click="popFormDialog">打开confirm形式弹窗</span>
        <span class="button-span" @click="popInformDialog">打开inform形式弹窗</span>
      </div>
      <pop-dialog dialogType="form" title="弹窗标题" :showFlag.sync="showFormDialogFlag" centerStyle showCloseFlag :width="500" cancelbuttonText="取消" buttonText="确定"
        :beforeCloseFun="handleBeforeCloseDialog" @sureClick="handleSure()" @cancelClick="showFormDialogFlag = false">
        <p>自定义内容</p>
      </pop-dialog>
    </div>

    <div class="box">
      <h3 class="box-title">多选选择器组件</h3>
      <span class="label-span">多选普通: </span>
      <multi-select :type="'game'" :options="optionsList" :placeholder="'游戏'" :parentVal="selectValue" @update="updateSelect"></multi-select>
      <span class="label-span">多选分组: </span>
      <multi-select :type="'channel'" :options="optionsGroup" :placeholder="'渠道'" :group="true" :parentVal="selectValueGroup" @update="updateSelect"></multi-select>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-vars */
import { Component, Vue } from 'vue-property-decorator';

import { OptionData, OptionsGroup } from '../types/multi-select';
import { DateValueType } from '../types/date-picker';

@Component({})
export default class demoExample extends Vue {
  /** date-picker */
  date: DateValueType = [];

  // 绑定值时若没有添加.sync修饰符，则需要手动监听dateChange来更新值
  dateChange(val: DateValueType) {
    this.date = val;
  }

  /** pop-dialog */
  showFormDialogFlag = false;

  showInformDialogFlag = false;

  popFormDialog() {
    this.showFormDialogFlag = true;
  }

  popInformDialog() {
    this.showInformDialogFlag = true;
  }

  handleSure() {
    console.log('点击确定按钮！');
    this.showFormDialogFlag = false;
  }

  // 拦截dialog关闭的处理函数，可调用方法参数进行关闭（仅限点击右上角关闭按钮以及点击遮罩背景关闭的情况）
  handleBeforeCloseDialog(closeFun: Function) {
    closeFun();
  }

  // 仅限点击右上角关闭按钮以及点击遮罩背景关闭的情况
  handleCloseDialog() {
    console.log('关闭了弹窗');
  }

  /** multi-select */
  selectValue: [] | string = [];

  optionsList: Array<OptionData> = [
    {
      label: '游戏1',
      value: 'value1',
    },
    {
      label: '游戏2',
      value: 'value2',
    },
    {
      label: '游戏3',
      value: 666,
    },
    {
      label: '游戏4',
      value: 888,
    },
  ];

  selectValueGroup: [] | string = [];

  optionsGroup: OptionsGroup = {
    分组1: [
      {
        label: '渠道1',
        value: 'value1',
      },
      {
        label: '渠道2',
        value: 'value2',
      },
    ],
    分组2: [
      {
        label: '渠道3',
        value: 666,
      },
      {
        label: '渠道4',
        value: 888,
      },
    ],
  };

  // 更新选择值
  updateSelect(type: string, value: []) {
    if (type === 'game') {
      this.selectValue = value;
      console.log(`选择的游戏：${this.selectValue}`);
    } else if (type === 'channel') {
      this.selectValueGroup = value;
      console.log(`选择的渠道：${this.selectValueGroup}`);
    }
  }

  /** customize-filter */
  curColumnConfig: object[] = [
    {
      label: '筛选项5',
      value: '555',
      fixed: true,
      disabled: true,
    },
    {
      label: '筛选项2',
      value: '222',
      fixed: true,
    },
    {
      label: '筛选项8',
      value: '888',
      disabled: true,
    },
    {
      label: '筛选项7',
      value: '777',
    },
  ];

  columnConfig: object[] = [
    {
      label: '分组1',
      children: [
        {
          label: '筛选项1',
          value: '111',
        },
        {
          label: '筛选项2',
          value: '222',
          fixed: true,
        },
        {
          label: '筛选项3',
          value: '333',
        },
        {
          label: '筛选项4',
          value: '444',
        },
      ],
    },
    {
      label: '分组2',
      children: [
        {
          label: '筛选项5',
          value: '555',
          fixed: true,
          disabled: true,
        },
        {
          label: '筛选项6',
          value: '666',
        },
      ],
    },
    {
      label: '分组3',
      children: [
        {
          label: '筛选项7',
          value: '777',
        },
        {
          label: '筛选项8',
          value: '888',
          disabled: true,
        },
        {
          label: '筛选项9',
          value: '999',
          fixed: true,
        },
        {
          label: '筛选项10',
          value: '101010',
        },
      ],
    },
  ];

  defaultColumnConfig: object[] = [
    {
      label: '筛选项5',
      value: '555',
      fixed: true,
      disabled: true,
    },
    {
      label: '筛选项2',
      value: '222',
      fixed: true,
    },
    {
      label: '筛选项8',
      value: '888',
      disabled: true,
    },
    {
      label: '筛选项7',
      value: '777',
    },
  ];

  showFilterFlag = false;

  showFilter() {
    this.showFilterFlag = true;
  }

  handleFilterChange(result: any) {
    // // 若不区分特殊队列，则选择数据直接通过 normalList属性 获取即可
    // this.curColumnConfig = result.normalList;
    // 若区分特殊队列，则特殊队列的选择数据通过 specialList属性 获取
    this.curColumnConfig = result.specialList.concat(result.normalList);
    console.log(this.curColumnConfig);
    // 若区分特殊队列，则需要通过 data属性 更新总数据（在弹框中可能通过拖动更改指标的属性）
    this.columnConfig = result.data;
    console.log(this.columnConfig);
    // 若需要保存模板，则通过 templateName属性 获取
    console.log(`模板名称:${result.templateName}`);
  }
}
</script>

<style lang="scss" scoped>
.box {
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 0 5px #cecece;
  margin-bottom: 30px;
  background: #fff;
  .box-title {
    font-size: 20px;
  }
}

.demo-main-title {
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
}
</style>
