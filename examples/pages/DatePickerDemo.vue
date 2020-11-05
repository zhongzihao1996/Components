<template>
  <div>
    <div class="box">
      <h3 class="box-title">日期时间选择组件</h3>
      <date-picker :searchFormDate.sync="date" type="datetimerange" :isLimit='false' dateType="yyyy-MM-dd HH:mm:ss" @dateChange="dateChange"></date-picker>
      <p>当前选择时间: {{date}}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { DateValueType } from '../../types/date-picker';

@Component({})
export default class DatePickerDemo extends Vue {
  date: DateValueType = [];

  // 绑定值时若没有添加.sync修饰符，则需要手动监听dateChange来更新值
  dateChange(val: DateValueType) {
    this.date = val;
  }
}
</script>

<style lang="scss" scoped>
</style>
