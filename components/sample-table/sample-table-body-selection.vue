<template>
  <td>
    <el-checkbox v-model="checked" @change="selectionChange"></el-checkbox>
  </td>
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
    index() {
      return this.$parent.index === undefined ? '-' : this.$parent.index;
    }
  },
  methods: {
    selectionChange(checked) {
      this.rootScope.selectionChange({
        checked: checked,
        index: this.index
      });
    }
  },
  watch: {
    'rootScope.selections'() {
      this.checked = this.rootScope.selections.includes(this.index);
    }
  }
};
</script>
