<template>
  <label class="checkbox-container"
        :class="{
          'is-disabled': disabled,
          'is-checked': isChecked,
          'is-indeterminate': indeterminate,
          'is-focus': focus
        }">
    <span class="checkbox-inner"></span>
    <input class="checkbox-original"
          type="checkbox"
          :disabled="disabled"
          :name="name"
          v-model="isChecked"
          @change="handleChange"
          @focus="focus = true"
          @blur="focus = false">
  </label>
</template>

<script>
export default {
  name: 'checkBox',

  data() {
    return {
      innerValue: false,
      focus: false
    };
  },

  props: {
    value: {},
    indeterminate: Boolean,
    disabled: Boolean,
    checked: Boolean,
    name: String
  },
  
  computed: {
    isChecked: {
      get() {
        return this.value !== undefined ? this.value : this.innerValue;
      },
      set(val) {
        this.$emit('input', val);
        this.innerValue = val;
      }
    }
  },

  created() {
    if (this.checked) {
      this.isChecked = true;
    }
  },

  methods: {
    handleChange(e) {
      let value = e.target.checked;
      this.$emit('change', value, e);
    }
  },
}
</script>

<style lang="scss" scoped>
.checkbox-container {
  display: inline-block;
  position: relative;
  line-height: 1;
  vertical-align: middle;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
  user-select: none;
  &.is-checked {
    .checkbox-inner {
      background-color: $mainColor;
      border-color: $mainColor;
      &::after {
        transform: rotate(45deg) scaleY(1);
      }
    }
  }
  &.is-disabled {
    .checkbox-inner {
      background-color: #edf2fc;
      border-color: $lineColor;
      cursor: not-allowed;
      &:hover {
        border-color: $lineColor;
      }
      &::after {
        cursor: not-allowed;
        border-color: $disabledColor;
      }
    }
    &.is-checked {
      .checkbox-inner {
        background-color: #f2f6fc;
        border-color: $lineColor;
        &::after {
          border-color: $disabledColor;
        }
      }
    }
    &.is-indeterminate {
      .checkbox-inner {
        background-color: #f2f6fc;
        border-color: $lineColor;
        &::before {
          background-color: $disabledColor;
          border-color: $disabledColor;
        }
      }
    }
  }
  &.is-focus {
    .checkbox-inner {
      border-color: $mainColor;
    }
  }
  &.is-indeterminate {
    .checkbox-inner {
      background-color: $mainColor;
      border-color: $mainColor;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 5px;
        display: block;
        height: 2px;
        background-color: #fff;
        transform: scale(0.5);
      }

      &::after {
        display: none;
      }
    }
  }
  .checkbox-inner {
    display: inline-block;
    position: relative;
    border: 1px solid $lineColor;
    border-radius: 2px;
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    background-color: #fff;
    z-index: 1;
    transition: border-color .25s cubic-bezier(.71, -.46, .29, 1.46),
    background-color .25s cubic-bezier(.71, -.46, .29, 1.46);

    &:hover {
      border-color: $mainColor;
    }

    &::after {
      position: absolute;
      left: 4px;
      top: 1px;
      box-sizing: content-box;
      content: "";
      border: 1px solid #fff;
      border-left: 0;
      border-top: 0;
      height: 7px;
      width: 3px;
      transform: rotate(45deg) scaleY(0);
      transition: transform .15s ease-in .05s;
      transform-origin: center;
    }
  }
  .checkbox-original {
    position: absolute;
    margin: 0;
    width: 0;
    height: 0;
    opacity: 0;
    outline: none;
    z-index: -1;
  }
}
</style>