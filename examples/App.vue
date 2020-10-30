<template>
  <div>
    <example />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import example from './Examples.vue';

@Component({
  components: {
    example,
  }
})
export default class AppClass extends Vue {
}
</script>

<style lang="scss" scoped>
* {
  padding: 0;
  margin: 0;
}
</style>
