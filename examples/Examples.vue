<template>
  <div>
    <!-- <p class="demo-main-title">后台组件demo</p> -->
    <!-- <div class="demo-content">
      <p class="demo-title">弹窗组件</p>
      <div>
        <span class="button-span" @click="popFormDialog">打开confirm形式弹窗</span>
        <span class="button-span" @click="popInformDialog">打开inform形式弹窗</span>
      </div>
      <pop-dialog dialogType="form" title="弹窗标题" :showFlag.sync="showFormDialogFlag" centerStyle showCloseFlag :width="500" cancelbuttonText="取消" buttonText="确定"
        :beforeCloseFun="handleBeforeCloseDialog" @sureClick="handleSure()" @cancelClick="showFormDialogFlag = false">
        <p>自定义内容</p>
      </pop-dialog>
      <pop-dialog dialogType="inform" title="弹窗标题" :height="100" clickBgCloseFlag @close="handleCloseDialog" :showFlag.sync="showInformDialogFlag" @sureClick="showInformDialogFlag = false">
        <p>自定义内容</p>
      </pop-dialog>
    </div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class Examples extends Vue {
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
}
</script>

<style lang="scss" scoped>
.demo-main-title {
  margin-bottom: 20px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}
.demo-content {
  padding: 32px;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 0 5px #cecece;
}
.demo-title {
  margin: 50px 0 10px;
  font-size: 16px;
  &:first-child {
    margin-top: 0;
  }
}
.button-span {
  display: inline-block;
  width: 135px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: #409eff;
  color: #fff;
  font-size: 12px;
  border-radius: 5px;
  cursor: pointer;
  & + .pop-button {
    margin-left: 10px;
  }
}
.el-select {
  width: 160px;
}
.label-span {
  margin-right: 5px;
  display: inline-block;
  font-size: 14px;
}
</style>
