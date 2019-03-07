<template>
  <td :data-infinite-fixed="fixed===''?undefined:fixed">
    <slot>{{getValue()}}</slot>
  </td>
</template>

<script>
export default {
  props: {
    prop: {
      type: String
    },
    fixed: {
      type: String,
      default: ''
    }
  },
  computed: {
    row() {
      return this.$parent.row;
    }
  },
  methods: {
    getValue() {
      let val = '';
      if (this.prop === undefined) return '';
      this.prop.split('.').forEach(k => {
        val = val === '' ? this.row[k] : val[k];
      });
      return val === undefined ? '　' : val;
    }
  }
};
</script>
