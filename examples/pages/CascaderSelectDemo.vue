<template>
  <div>
    <div class="box">
      <h3 class="box-title">级联组件</h3>
      <cascader-select v-model="selected" :isGamePackage="isGamePackage" :placement="placement" :placeholder="placeholder" :multiple="multiple" :filterable="filterable"
        :firstUrl="firstUrl" :firstMap="firstMap" :secondUrl="secondUrl" :secondMap="secondMap" :secondKeywordKey="secondKeywordKey" :secondParamKey="secondParamKey" :selectAllUrl="selectAllUrl"
        @change="handleChange" :transform="transform" :transformUrl="transformUrl" :transformMap="transformMap" @transform-change="handleTransformChange" :clearable="clearable" :extParams="extParams"
        @middle-change="handleMiddleChange" :middleState="middleState" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CascaderSelectDemo',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      required: true
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String,
      default: 'bottom-start'
    },
    transform: {
      type: Boolean,
      default: false
    },
    transformUrl: {
      type: String,
      default: '/conditions/ads'
    },
    transformMap: {
      type: Function,
      default: o => o.ad_name
    },
    extParams: {
      type: Object,
      default: () => ({})
    },
    middleState: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      selected: [],
      firstUrl: '/conditions/games',
      firstMap: o => ({ label: `${o.game_name_cn || 0} (${o.game_package_counts || 0})`, value: o.game_id || 0, total: o.game_package_counts || 0, }),
      secondUrl: '/conditions/game/packages',
      secondMap: o => ({ label: o.package_name_cn || 0, value: o.package_ids || 0, parent: o.game_id || 0 }),
      secondKeywordKey: 'package_name_cn',
      secondParamKey: 'game_id',
      selectAllUrl: '/conditions/all/package',
      isGamePackage: true // 控制游戏包要特殊处理
    };
  },
  methods: {
    handleChange() {
      if (JSON.stringify(this.selected) !== JSON.stringify(this.value)) {
        this.$emit('change', this.selected);
        this.formatPackageId();
      }
    },
    handleTransformChange(value) {
      this.$emit('transform-change', value);
    },
    handleMiddleChange(middleState) {
      this.$emit('middle-change', middleState); // 向外传递中间状态
    },
    // 特殊格式化package_ids 后端要求
    formatPackageId() {
      if (this.isGamePackage) {
        let arr = [];
        this.selected.forEach(o => {
          if (o.indexOf(',') > -1) {
            arr = arr.concat(o.split(',').map(key => Number.parseInt(key, 10)));
          } else {
            arr.push(Number.parseInt(o, 10));
          }
        });
        this.$emit('convert', arr);// 游戏包需要特殊处理数据 传给后端
      }
    }
  },
  watch: {
    value: {
      handler() {
        if (JSON.stringify(this.selected) !== JSON.stringify(this.value)) {
          try {
            this.selected = JSON.parse(JSON.stringify(this.value));
            this.formatPackageId();
          } catch (error) {
            // TODO
          }
        }
      },
      immediate: true
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
