<template>
  <tr class="tr">
    <slot></slot>
  </tr>
</template>

<script>
export default {
  props: {
    row: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  }
};
</script>
