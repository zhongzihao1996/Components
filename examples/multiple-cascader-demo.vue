<template>
  <div class="container">
    <h3>multiple-cascader</h3>
    <div>
      <span>所在地区：</span>
      <multiple-cascader :options="options" filterable clearable :value="selectedValues" @change="change" />
    </div>
  </div>
</template>

<script>
import Mockjs from 'mockjs';
const Random = Mockjs.Random;
export default {
  data() {
    return {
      options: [],
      selectedValues: []
    };
  },
  mounted() {
    let options = [];
    for (let i = 0; i < 3; i++) {
      options.push({
        label: Random.city(),
        value: Random.id(),
        children: []
      });
      for (let j = 0; j < 5; j++) {
        options[i].children.push({
          label: Random.city(),
          value: Random.id(),
          children: []
        });
        for (let k = 0; k < 8; k++) {
          options[i].children[j].children.push({
            label: Random.city(),
            value: Random.id(),
            disabled: k % 2 === 0
          });
        }
      }
    }
    this.options = options;
  },
  methods: {
    change(vals) {
      this.selectedValues = vals;
    }
  }
};
</script>
