<template>
  <div>
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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class PopDialogDemo extends Vue {
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
}
</script>

<style lang="scss" scoped>
</style>
