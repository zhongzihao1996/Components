<template>
  <th>
    <el-checkbox :indeterminate="isIndeterminate" v-model="checked" @change="selectionChange" :disabled="isDisable"></el-checkbox>
  </th>
</template>

<script>
export default {
  data() {
    return {
      checked: false
    };
  },
  computed: {
    rootScope() {
      return this.$parent.$parent;
    },
    isIndeterminate() {
      if (this.rootScope.raws !== undefined) {
        if (
          this.rootScope.raws.length === this.rootScope.selections.length &&
          this.rootScope.raws.length > 0
        ) {
          return false;
        } else if (this.rootScope.selections.length === 0) {
          return false;
        } else {
          return true;
        }
      } else {
        if (
          this.rootScope.data.length === this.rootScope.selections.length &&
          this.rootScope.data.length > 0
        ) {
          return false;
        } else if (this.rootScope.selections.length === 0) {
          return false;
        } else {
          return true;
        }
      }
    },
    isDisable() {
      if (this.rootScope.raws !== undefined) {
        return this.rootScope.raws.length === 0;
      } else {
        return this.rootScope.data.length === 0;
      }
    }
  },
  methods: {
    selectionChange(checked) {
      this.rootScope.selectionChange(checked);
    }
  }
};
</script>

