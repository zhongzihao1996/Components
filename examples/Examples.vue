<template>
  <div>
    <p class="demo-main-title">后台组件demo</p>

    <date-picker-demo></date-picker-demo>

    <pop-dialog-demo></pop-dialog-demo>

    <multi-select-demo></multi-select-demo>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class demoExample extends Vue {

}
</script>

<style lang="scss">
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
