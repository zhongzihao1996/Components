<template>
  <td>
    <slot>{{index}}</slot>
  </td>
</template>

<script>
export default {
  computed: {
    index() {
      return this.$parent.index === undefined ? "-" : this.$parent.index;
    }
  }
};
</script>

