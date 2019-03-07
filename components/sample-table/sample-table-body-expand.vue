<template>
  <td class="expand" style="width:38px;" @click="toggle()">
    <i v-if="!isexpand" class="el-icon-arrow-right"></i>
    <i v-if="isexpand" class="el-icon-arrow-down"></i>
    <div class="hidden" style="display:none;">
      <tr class="expand_content">
        <td class="null"> </td>
        <td :colspan="expandSpan" style="padding:0;">
          <slot></slot>
        </td>
      </tr>
    </div>
  </td>
</template>

<script>
export default {
  data() {
    return {
      isexpand: false,
      childred: null
    };
  },
  computed: {
    expandSpan() {
      return 100;
      //this.$parent.$el.parentNode.rows[0].cells.length; //table列数
    }
  },
  methods: {
    toggle() {
      if (this.isexpand) {
        this.reduce();
      } else {
        this.expand();
      }
    },
    expand() {
      let slots = this.$el.querySelector('div.hidden');
      if (!slots || slots.length === 0) return false;
      let parent = this.$parent.$el;
      let sibling = this.$parent.$el.nextSibling;
      this.childred = this.childred || slots.children[0]; //使用cloneNode(true)克隆会导致事件丢失
      parent.parentNode.insertBefore(this.childred, sibling);
      this.isexpand = true;
    },
    reduce() {
      this.$parent.$el.parentNode.removeChild(this.childred);
      this.isexpand = false;
    }
  }
};
</script>
