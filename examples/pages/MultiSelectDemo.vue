<template>
  <div>
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
import { Component, Vue } from 'vue-property-decorator';

import { OptionData, OptionsGroup } from '../../types/multi-select';

@Component({})
export default class MultiSelectDemo extends Vue {
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
}
</script>

<style lang="scss" scoped>
</style>
