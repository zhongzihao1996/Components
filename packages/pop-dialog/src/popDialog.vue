<template>
  <div class="dialog-bg" @click.self="clickBg" v-show="showFlag">
    <transition name="dialog-transition">
      <div class="dialog-container" :class="[dialogType]" :style="{width: width+'px'}" v-show="showFlag">
        <div class="dialog-header">
          <p class="dialog-title">{{title}}</p>
          <div class="dialog-close-btn" v-if="showCloseFlag" @click="handleHide">
            <i class="el-icon-close"></i>
          </div>
        </div>
        <div class="dialog-body" :class="[{'center': centerStyle, 'scorll': height}]" :style="{height: height+'px'}">
          <slot></slot>
        </div>
        <div class="dialog-footer">
          <template v-if="dialogType==='inform'">
            <button type="button" class="jh-button primary" @click="clickBtn('sure')">{{buttonText}}</button>
          </template>
          <template v-if="dialogType === 'confirm' || dialogType === 'form'">
            <button type="button" class="jh-button cancel-button" @click="clickBtn('cancel')">{{cancelbuttonText}}</button>
            <button type="button" :class="['jh-button', 'sure-button', sureButtonType, { 'is-disabled': sureButtonDisabled }]" :disabled="sureButtonDisabled"
              @click="clickBtn('sure')">{{buttonText}}</button>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({ name: 'popDialog' })
export default class popDialog extends Vue {
  @Prop({
    type: String,
    default: 'inform'
  }) dialogType!: string;

  @Prop({
    type: Boolean,
    default: false
  }) showFlag!: boolean;

  @Prop({
    type: Boolean,
    default: false
  }) showCloseFlag!: boolean;

  @Prop({
    type: Boolean,
    default: false
  }) clickBgCloseFlag!: boolean;

  @Prop({
    type: String,
    default: ''
  }) title!: string;

  @Prop({
    type: Boolean, // 父组件传递给子组件的数据类型
    default: false // 默认值， 如果传入的是 Object，则要 default: ()=>({}) 参数为函数
  }) centerStyle!: boolean;

  @Prop({
    type: String,
    default: '取消'
  }) cancelbuttonText!: string;

  @Prop({
    type: String, // 父组件传递给子组件的数据类型
    default: '确定' // 默认值， 如果传入的是 Object，则要 default: ()=>({}) 参数为函数
  }) buttonText!: string;

  @Prop({
    type: Boolean,
    default: false
  }) sureButtonDisabled!: boolean;

  @Prop({
    type: String,
    default: 'primary'
  }) sureButtonType!: string;

  @Prop({
    type: Number // 父组件传递给子组件的数据类型
  }) width!: number;

  @Prop({
    type: Number // 父组件传递给子组件的数据类型
  }) height!: number;

  @Prop({
    type: Function
  })
  beforeCloseFun!: Function;

  clickBtn(type: string) {
    if (type === 'sure') {
      this.$emit('sureClick');
    }
    if (type === 'cancel') {
      this.$emit('cancelClick');
    }
  }

  clickBg() {
    if (this.clickBgCloseFlag) {
      this.handleHide();
    }
  }

  handleHide() {
    if (typeof this.beforeCloseFun === 'function') {
      this.beforeCloseFun(this.hideIt);
    } else {
      this.hideIt();
    }
  }

  hideIt() {
    this.$emit('update:showFlag', false);
    this.$emit('close');
  }
}
</script>

<style lang="scss" scoped>
.el-icon-close:before {
  content: '\e6db';
}
.dialog-bg {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  .dialog-container {
    &.form {
      width: 600px;
    }
    &.confirm {
      width: 370px;
      .dialog-body {
        text-align: left;
      }
    }
    &.inform {
      width: 500px;
    }
    margin: 10vh auto 50px;
    min-width: 350px;
    line-height: 17px;
    border-radius: 4px;
    box-shadow: 0px 6px 6px -1px rgba(56, 132, 194, 0.1);
    box-sizing: border-box;
    background: #fff;
    font-size: 12px;
    .dialog-header {
      position: relative;
      text-align: left;
      line-height: 1;
      // border-bottom: 1px solid $lineColor;
      padding: 16px;
      .dialog-title {
        font-size: 16px;
        font-weight: 600;
        // color: $mainFontColor;
      }
      .dialog-close-btn {
        position: absolute;
        top: 0;
        right: 0;
        padding: 16px;
        cursor: pointer;
        font-size: 16px;
        i {
          // color: $mainFontColor;
        }
        &:hover {
          i {
            // color: $mainColor;
          }
        }
      }
    }
    .dialog-body {
      padding: 16px;
      text-align: left;
      // color: $normalFontColor;
      box-sizing: border-box;
      word-break: break-all;
      // border-bottom: 1px solid $lineColor;
      &.scorll {
        overflow: auto;
      }
    }
    .dialog-footer {
      padding: 16px;
      text-align: right;
      font-size: 0;
    }
  }
}
.dialog-transition-enter-active {
  animation: dialog-transition-in 0.3s;
}

.dialog-transition-leave-active {
  animation: dialog-transition-out 0.3s;
}

@keyframes dialog-transition-in {
  0% {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes dialog-transition-out {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }
}
</style>
