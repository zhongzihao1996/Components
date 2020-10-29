<template>
  <el-dialog :title="title"
             :visible="showFlag"
             custom-class='customize-filter'
             :before-close="close">
    <div class="body-container">
      <div class="main">
        <div class="lcontent">
          <el-scrollbar class="scrollbar">
            <div class="check-group"
                 v-for="(group,gindex) in allData"
                 :key="gindex">
              <div class="check-title">
                <el-checkbox :indeterminate="group.indeterminate"
                              v-model="group.checkAll"
                              @change="handleCheckAllChange(group, gindex)">{{group.label}}</el-checkbox>
              </div>
              <el-checkbox-group v-model="group.checkedList">
                <div class="cf-row">
                  <div v-for="(item,index) in group.children"
                          :key="index"
                          class="check-item">
                    <el-checkbox :label="item.value"
                                 :disabled="item.disabled"
                                 @change="(value)=>handleCheckItemChange(value, group, gindex, index)">{{item.label}}</el-checkbox>
                  </div>
                </div>
              </el-checkbox-group>
            </div>
          </el-scrollbar>
        </div>
        <div class="rcontent">
          <div class="checked-title">
            <span>已选指标</span>
            <label v-if="checkedData.length">({{checkedData.length}})</label>
            <span v-if="checkedData.length"
                  class="checked-button clear"
                  @click="removeAll()">清空</span>
            <span v-if="isHaveDefault"
                  class="checked-button"
                  @click="reset()">恢复默认</span>
          </div>
            <div class="checked-list-box">
              <el-scrollbar class="scrollbar">
                <!-- 特殊队列 -->
                <div class="checked-list"
                     v-if="isHaveSpecial">
                  <draggable :list="specialList"
                             group="filter"
                             :options="{
                               handle: '.icon-zidingyilie, .checked-item-label',
                               draggable: keepOrderFlag? '' : '.can-drag',
                               forceFallback: true,
                               fallbackClass: 'dragging',
                               chosenClass: 'chosen'
                             }">
                    <template v-if="specialList.length > 0">
                      <div class="checked-item"
                           :class="{ 'can-drag': !item.disabled && !keepOrderFlag}"
                           v-for="(item, index) in specialList"
                           :key="index">
                        <i class="iconfont icon-zidingyilie"></i><span class="checked-item-label">{{item.label}}</span>
                        <i class="el-icon-delete remove"
                          title="删除"
                          @click="removeItem(item)"
                          v-if="!item.disabled"></i>
                      </div>
                    </template>
                    <div class="special-remind-bar">
                      <span class="line left"></span>
                      <p class="special-text">以上指标将{{specialText}}</p>
                      <span class="line left"></span>
                    </div>
                  </draggable>
                </div>
                <!-- 普通队列 -->
                <div class="checked-list">
                  <draggable :list="normalList"
                             group="filter"
                             :options="{
                               handle: '.icon-zidingyilie, .checked-item-label',
                               draggable: keepOrderFlag? '' : '.can-drag',
                               forceFallback: true,
                               fallbackClass: 'dragging',
                               chosenClass: 'chosen'
                             }">
                    <div class="checked-item"
                         :class="{ 'can-drag': !item.disabled && !keepOrderFlag }"
                         v-for="(item, index) in normalList"
                         :key="index">
                      <i class="iconfont icon-zidingyilie"></i><span class="checked-item-label">{{item.label}}</span>
                      <i class="el-icon-delete remove"
                        title="删除"
                        @click="removeItem(item)"
                        v-if="!item.disabled"></i>
                    </div>
                  </draggable>
                </div>
              </el-scrollbar>
            </div>
        </div>
      </div>
    </div>
    <div slot="footer"
         class="footer-div"
         :class="{ 'only-button': !saveTemplateFlag }">
      <div class="footer-left"
           v-if="saveTemplateFlag">
        <el-checkbox class="template-checkbox"
                     v-model="templateChecked"
                     @change="handleTemplateCheckChange">保存为常用{{title}}</el-checkbox>
        <span class="template-input-box"
              v-show="templateChecked">
          <input class="template-input"
                  type="text"
                  :placeholder="`请输入${title}名称`"
                  v-model="templateName"
                  @input="handleTemplateNameInput"/>
          <span class="input-length">{{getLength(templateName)}}/{{templateNameNum}}</span>
        </span>
        <span class="template-remind"
              v-show="templateChecked && templateRemindText">{{templateRemindText}}</span>
      </div>
      <div class="footer-right">
        <button type="button"
                class="jh-button"
                @click="close()">
          <span>取消</span>
        </button>
        <button type="button"
                class="jh-button primary"
                @click="submit()">
          <span>{{sureButtonText}}</span>
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script lang='ts'>
import draggable from 'vuedraggable';
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

interface DataOption {
  value: string | number;
  label: string | number;
  [prop: string]: any;
}

interface DataGroup {
  label: string;
  indeterminate: boolean;
  checkAll: boolean;
  checkedList: Array<string | number>;
  children: Array<DataOption>;
}

interface submitDataGroup {
  label: string;
  indeterminate?: boolean;
  checkAll?: boolean;
  checkedList?: Array<string | number>;
  children: Array<DataOption>;
}

@Component({ 
  name: 'customizeFilter',
  components: {
    draggable
  }
})
export default class customizeFilter extends Vue {
  @Prop({
    type: String,
    default: '自定义指标'
  })
  title!: string;

  @Prop({
    type: String,
    default: '确定'
  })
  sureButtonText!: string;

  @Prop({
    type: Array,
    required: true
  })
  data!: Array<DataGroup> | Array<DataOption>;

  @Prop({
    type: Array,
    required: true
  })
  value!: Array<DataOption>;

  @Prop({
    type: Array,
    default() {
      return [];
    }
  })
  default!: Array<DataOption>;

  @Prop({
    type: Boolean,
    default: false // 默认为一个分组
  })
  groupFlag!: Boolean; // 是否为多分组的情况（传入数据结构不同）
  // 一个分组：只传入一个数组
  // 多个分组：传入多个对象的数组（对象属性包括label和children）

  @Prop({
    type: Boolean,
    default: false // 默认不按顺序
  })
  keepOrderFlag!: Boolean; // 在增加选择项时是否保持顺序
  // (若要保持顺序，需注意前提：不能存在带有disabled属性的指标)

  @Prop({
    type: Boolean,
    default: false
  })
  showFlag!: Boolean;

  @Prop({
    type: Boolean,
    default: false
  })
  saveTemplateFlag!: Boolean; // 是否为保存模板形式

  @Prop({
    type: String,
    default: ''
  })
  templateRemindText!: string; // 保存模板提示文本

  @Prop({
    type: Number,
    default: 10
  })
  templateNameNum!: number; // 保存的模板名称值可输入最多字符(以汉字字符为准)

  @Prop()
  specialText!: string; // 特殊队列的特点说明

  @Prop()
  specialField!: string; // 用于判断是否归类为特殊队列的字段(该字段需为boolean类型)

  allData: Array<DataGroup> = []; // 所有选择项数据

  normalList: Array<DataOption> = []; // 普通队列

  specialList: Array<DataOption> = []; // 特殊队列

  templateChecked: boolean = false; // 是否保存为模板选择框值

  templateName: string = ''; // 保存的模板名称值

  // 是否区分特殊与普通队列
  get isHaveSpecial() {
    return this.specialField !== '' && this.specialField !== undefined;
  }

  get isHaveDefault() {
    return this.default.length > 0;
  }

  get checkedData() {
    const list: Array<DataOption> = [];
    this.allData.forEach(group => {
      group.children.forEach(item => {
        if (group.checkedList.includes(item.value)) {
          list.push(item);
        }
      });
    });
    return Array.from(new Set(list)) || [];
  }

  @Watch('data', { immediate: true })
  onDataChange() {
    this.initCheck();
  }

  @Watch('value', { immediate: true })
  onValueChange() {
    this.initCheck();
  }

  @Watch('showFlag')
  onShowFlagChange() {
    this.initCheck();
  }

  @Watch('checkedData', { immediate: true })
  onCheckedDataChange() {
    // 根据左侧选择值，更新右侧已选指标列表
    const getS: Array<DataOption> = [];
    const getN: Array<DataOption> = [];
    // 新选择值 按顺序添加到相应位置
    if (this.keepOrderFlag) {
      let allItem: Array<DataOption> = [];
      this.allData.forEach((group: DataGroup) => {
        allItem = allItem.concat(group.children);
      });
      this.specialList = [];
      this.normalList = [];
      if (this.isHaveSpecial) {
        this.checkedData.forEach(item => {
          const getItem = allItem.find(o => o.value === item.value);
          if (getItem) {
            // 特殊队列字段需与 现选择数据 同步
            getItem[this.specialField] = item[this.specialField];
            const isSpecial = getItem[this.specialField];
            if (isSpecial) {
              this.specialList.push(getItem);
            } else {
              this.normalList.push(getItem);
            }
          }
        });
      } else {
        this.checkedData.forEach(item => {
          const getItem = allItem.find(o => o.value === item.value);
          if (getItem) {
            this.normalList.push(getItem);
          }
        });
      }
    } else { // 新选择值 添加在后方（不按顺序添加）
      // 仍保留选择状态的
      this.specialList.forEach(item => {
        if (this.checkedData.find(o => o.value === item.value)) {
          getS.push(item);
        }
      })
      this.normalList.forEach(item => {
        if (this.checkedData.find(o => o.value === item.value)) {
          getN.push(item);
        }
      });
      // 新选择上的
      this.checkedData.forEach(item => {
        if (this.isHaveSpecial) {
          if (!this.normalList.find(o => o.value === item.value) && !getS.find(o => o.value === item.value)) {
            if (item[this.specialField]) {
              getS.push(item);
            } else {
              getN.push(item);
            }
          }
        } else {
          if (!this.normalList.find(o => o.value === item.value)) {
            getN.push(item);
          }
        }
      });
      this.specialList = getS;
      this.normalList = getN;
    }
  }

  mounted() {
  }

  initCheck() {
    let getPropData = this.data;
    if (getPropData.length > 0) {
      // 过滤处理单个分组情况(重新包装结构)
      if (!this.groupFlag && !({}).hasOwnProperty.call(getPropData[0], 'children')) {
        const newData = [
          {
            label: '全选',
            indeterminate: false,
            checkAll: false,
            checkedList: [],
            children: getPropData as DataOption[]
          }
        ];
        getPropData = newData;
      }
      const getData: Array<DataGroup> = JSON.parse(JSON.stringify(getPropData || []));
      const getValue: Array<DataOption> = JSON.parse(JSON.stringify(this.value || []));
      let allItem: Array<DataOption> = [];
      const allCheckedValues = getValue.map(o => o.value);
      getData.forEach((group: DataGroup) => {
        // const groupAllValues = group.children.map(o => o.value);
        // const checkedItem = getValue.filter(o => groupAllValues.includes(o.value)) || [];
        const checkedItem = group.children.filter(o => allCheckedValues.includes(o.value)) || [];
        group.checkAll = checkedItem.length > 0 && checkedItem.length === group.children.length;
        group.indeterminate = checkedItem.length > 0 && !group.checkAll;
        group.checkedList = checkedItem.map(o => o.value);

        allItem = allItem.concat(group.children);
      });
      this.allData = getData;

      // 右侧已选数据（按顺序添加）
      this.specialList = [];
      this.normalList = [];
      if (this.isHaveSpecial) {
        getValue.forEach(item => {
          const getItem = allItem.find(o => o.value === item.value);
          if (getItem) {
            // 特殊队列字段需与 现选择数据 同步
            getItem[this.specialField] = item[this.specialField];
            const isSpecial = getItem[this.specialField];
            if (isSpecial) {
              this.specialList.push(getItem);
            } else {
              this.normalList.push(getItem);
            }
          }
        });
      } else {
        getValue.forEach(item => {
          const getItem = allItem.find(o => o.value === item.value);
          if (getItem) {
            this.normalList.push(getItem);
          }
        });
      }
    }
  }

  handleCheckAllChange(group: DataGroup, gindex: number) {
    // this.$set(this.allData[gindex], 'checkedList', group.checkAll ? group.children.map(o => o.value) : []);
    // this.$set(this.allData[gindex], 'indeterminate', false);

    // 考虑选择项有disable属性的情况（不可更改其选择状态）
    const getC = group.children;
    let checkAllList: Array<string | number> = [];
    let notCheckAllList: Array<string | number> = [];
    getC.forEach(o => {
      if (!o.disabled) {
        checkAllList.push(o.value);
      }
      if (o.disabled && group.checkedList.includes(o.value)) {
        checkAllList.push(o.value);
        notCheckAllList.push(o.value);
      }
    });
    this.$set(this.allData[gindex], 'checkedList', group.checkAll ? checkAllList : notCheckAllList);
    const checkedCount = this.allData[gindex].checkedList.length;
    this.$set(this.allData[gindex], 'checkAll', checkedCount === getC.length);
    this.$set(this.allData[gindex], 'indeterminate', checkedCount > 0 && checkedCount < getC.length);
  }

  handleCheckItemChange(value: boolean, group: DataGroup, gindex: number, index: number) {
    const checkedCount = group.checkedList.length;
    this.$set(this.allData[gindex], 'checkAll', checkedCount === group.children.length);
    this.$set(this.allData[gindex], 'indeterminate', checkedCount > 0 && checkedCount < group.children.length);
    // 取消勾选时，指标状态还原为普通
    if (this.isHaveSpecial && !value) {
      const getItem = this.allData[gindex].children[index];
      if (!getItem.disabled) {
        getItem[this.specialField] = false;
      }
    }
  }

  // 取消勾选时，清空输入框值
  handleTemplateCheckChange(val: boolean) {
    if (!val) {
      this.templateName = '';
    }
  }

  removeAll() {
    this.allData.forEach((group, gindex) => {
      const getChildren = group.children;
      getChildren.forEach(item => {
        const getIndex = group.checkedList.indexOf(item.value);
        if (getIndex !== -1 && !item.disabled) {
          group.checkedList.splice(getIndex, 1);
          // 指标状态还原为普通
          if (this.isHaveSpecial) {
            item[this.specialField] = false;
          }
        }
      });
      const checkedCount = group.checkedList.length;
      this.$set(this.allData[gindex], 'checkAll', checkedCount === getChildren.length);
      this.$set(this.allData[gindex], 'indeterminate', checkedCount > 0 && checkedCount < getChildren.length);
    });
  }

  removeItem(item: DataOption) {
    // 指标状态还原为普通
    if (this.isHaveSpecial && !item.disabled) {
      item[this.specialField] = false;
    }

    this.allData.forEach((group, gindex) => {
      if (group.checkedList.includes(item.value) && !item.disabled) {
        group.checkedList = group.checkedList.filter(o => o !== item.value);

        const getChildren = group.children;
        const checkedCount = group.checkedList.length;
        this.$set(this.allData[gindex], 'checkAll', checkedCount === getChildren.length);
        this.$set(this.allData[gindex], 'indeterminate', checkedCount > 0 && checkedCount < getChildren.length);
      }
    })
  }

  // TODO：现逻辑恢复默认时是按总配置数据的顺序来的，不按默认配置数据顺序，需优化
  // 恢复默认（模板）----现逻辑为：仍然覆盖不可编辑的指标
  reset() {
    const dfValues = this.default.map(o => o.value);
    this.allData.forEach(group => {
      group.checkedList = [];
      group.children.forEach(child => {
        if (dfValues.includes(child.value)) {
          group.checkedList.push(child.value);
        }
      });
      const len = group.checkedList.length;
      group.checkAll = len > 0 && len === group.children.length;
      group.indeterminate = len > 0 && !group.checkAll;
    });
  }

  submit() {
    if (this.specialList.length === 0 && this.normalList.length === 0 ) {
      this.$message({
        message: '请至少勾选一个指标',
        type: 'info',
        customClass: 'customize-filter-message'
      });
      return;
    }
    let emitResult = {};
    if (this.saveTemplateFlag && this.templateChecked) {
      if (this.templateName.length === 0) {
        this.$message({
          message: '保存名称不能为空',
          type: 'info',
          customClass: 'customize-filter-message'
        });
        return;
      } else {
        emitResult = Object.assign({
          templateName: this.templateName // 保存的模板名称
        }, emitResult);
      }
    }
    // 更新特殊队列字段的值
    if (this.isHaveSpecial) {
      this.specialList.forEach(item => {
        item[this.specialField] = true;
      });
      this.normalList.forEach(item => {
        item[this.specialField] = false;
      });
    }
    const getData: Array<submitDataGroup> = JSON.parse(JSON.stringify(this.allData || []));
    getData.forEach(group => {
      delete group.checkedList;
      delete group.checkAll;
      delete group.indeterminate;
    });
    emitResult = Object.assign({
      data: this.groupFlag? getData.slice() : getData[0].children.slice(), // 总配置数据
      specialList: this.specialList.slice(), // 已选择的特殊队列数据
      normalList: this.normalList.slice(), // 已选择的普通队列数据
    }, emitResult);
    this.$emit('change', emitResult);
    this.close();
  }

  close() {
    // 还原状态
    this.allData = [];
    this.normalList = [];
    this.specialList = [];
    this.templateChecked = false;
    this.templateName = '';
    this.$emit('update:showFlag', false);
    this.$emit('close');
  }

  handleTemplateNameInput() {
    const limit = this.templateNameNum;
    while (this.getLength(this.templateName) > limit) {
      this.templateName = this.templateName.substr(0, this.templateName.length - 1);
    }
  }

  // 获取字符串长度（汉字1字符，其他0.5字符）
  getLength(str: string) {
    let cnReg = /([\u4e00-\u9fa5]|[\u3000-\u303F]|[\uFF00-\uFF60])/g;
    const matchStr = str.match(cnReg);
    if (matchStr) {
        return matchStr.length + (str.length - matchStr.length) * 0.5;
    }
    return str.length * 0.5;
  }
}
</script>

<style lang="scss">
.el-message--info.customize-filter-message {
  z-index: 5000 !important;
}
.el-icon-info:before { content:"\e7a1" }
</style>
<style lang="scss" scoped>
/deep/ .customize-filter {
  width: 1096px;
  border-radius: 10px;
  .el-dialog__header {
    padding: 16px 24px;
    box-sizing: border-box;
    .el-dialog__title {
      line-height: 22px;
      font-size: 16px;
      font-weight: bold;
    }
    .el-dialog__headerbtn {
      display: none;
    }
  }
  .el-dialog__body {
    padding: 16px 16px 16px 24px;
    border-top: 1px solid $lineColor;
    border-bottom: 1px solid $lineColor;
    .body-container {
      .scrollbar {
        box-sizing: border-box;
        height: 100%;
        .el-scrollbar__wrap {
          overflow-x: hidden;
        }
      }
      .main {
        display: flex;
        margin-bottom: 1px;
        .lcontent {
          flex: 1;
          margin-right: 16px;
          padding-left: 16px;
          overflow: auto;
          height: 522px;
          border: 1px solid $lineColor;
          box-sizing: border-box;
          .check-title {
            padding: 16px 16px 8px 0;
            border-bottom: 1px solid $lineColor;
            label.el-checkbox {
              color: #303331;
            }
          }
          .el-checkbox-group {
            padding: 8px 0;
            box-sizing: border-box;
            .cf-row {
              position: relative;
              box-sizing: border-box;
              &::before, &::after {
                display: table;
                content: "";
              }
              &::after {
                clear: both;
              }
              .check-item {
                display: inline-block;
                width: 25%;
                margin-bottom: 8px;
                padding-right: 8px;
                box-sizing: border-box;
                .el-checkbox {
                  display: flex;
                  justify-content: flex-start;
                  align-items: center;
                  white-space: normal;
                  .el-checkbox__label {
                    font-size: 12px;
                    vertical-align: middle;
                  }
                }
              }
            }
          }
        }
        .rcontent {
          flex: none;
          width: 354px;
          border: 1px solid $lineColor;
          border-radius: 4px;
          box-sizing: border-box;
          .checked-title {
            border-bottom: 1px solid $lineColor;
            padding: 10px 16px;
            background: rgba(73, 169, 248, 0.1);
            box-sizing: border-box;
            label {
              font-size: 14px;
              color: $mainFontColor;
            }
            .checked-button {
              float: right;
              color: #0062FF;
              font-size: 14px;
              cursor: pointer;
              &.clear {
                margin-left:10px;
              }
            }
          }
          .checked-list-box {
            padding: 12px 0 12px 16px;
            height: 481px;
            box-sizing: border-box;
            .checked-list {
              .checked-item {
                margin: 5px 0;
                margin-right: 16px;
                padding: 6px 10px;
                display: flex;
                justify-content: center;
                align-items: baseline;
                box-sizing: border-box;
                &:hover {
                  background: rgba(73, 169, 248, 0.1);
                  &.can-drag {
                    cursor: grab;
                  }
                  .remove {
                    visibility: visible;
                  }
                }
                &.dragging {
                  background: rgba(73, 169, 248, 0.1);
                  opacity: 0.8;
                }
                &.chosen {
                  &:hover {
                    background: transparent;
                  }
                }
                i {
                  flex: none;
                  padding-right: 10px;
                  &.icon-zidingyilie {
                    font-size: 12px;
                    color: #606266;
                  }
                }
                .checked-item-label {
                  flex: 1;
                  font-size: 12px;
                  color: $mainFontColor;
                }
                .remove {
                  padding-right: 0;
                  color: #F56C6C;
                  visibility: hidden;
                  cursor: pointer;
                }
              }
            }
            .special-remind-bar {
              width: 100%;
              padding: 15px 16px 15px 0;
              box-sizing: border-box;
              display: flex;
              justify-content: center;
              align-items: center;
              .line {
                display: inline-block;
                width: 100%;
                height: 1px;
                background-color:$disabledColor;
              }
              .special-text {
                flex: none;
                margin: 0 4px;
                font-size: 12px;
                color: $disabledColor;
              }
            }
          }
        }
      }
    }
  }
  .el-dialog__footer {
    padding: 0 16px;
    text-align: left;
    
    font-size: 0;
    .footer-div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 62px;
      &.only-button {
        justify-content: flex-end;
      }
      .footer-left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-left: 8px;
        box-sizing: border-box;
        .template-checkbox {
          .el-checkbox__label {
            font-size: 12px;
            color: $mainFontColor;
          }
        }
        .template-input-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-left: 19px;
          padding: 0 12px;
          height: 28px;
          font-size: 0;
          border: 1px solid rgba(220, 222, 230, 1);
          border-radius: 2px;
          box-sizing: border-box;
          overflow: hidden;
          &:hover {
            border-color: $disabledColor;
          }
          .template-input {
            outline: 0;
            display: inline-block;
            width: 150px;
            font-size: 12px;
            color: $mainFontColor;
            text-align: left;
            -webkit-appearance: none;
            background-image: none;
            border: none;
            box-sizing: border-box;
          }
          input::placeholder {
            color: $disabledColor;
          }
          .input-length {
            display: inline-block;
            width: 40px;
            text-align: center;
            font-size: 12px;
            color: $disabledColor;
          }
        }
        .template-remind {
          margin-left: 16px;
          font-size: 12px;
          color: #E6A23C;
        }
      }
      .footer-right {
        flex: none;
      }
    }
  }
  .el-icon-arrow-up:before { content:"\e6e1" }
  .el-icon-arrow-down:before { content:"\e6df" }
  .el-icon-delete:before { content:"\e6d7" }
}
@media screen and (max-height: 900px) {
  .lcontent {
    height: 450px !important;
  }
  .rcontent {
    .checked-list-box {
      height: 409px !important;
    }
  }
}
@media screen and (max-height: 650px) {
  .lcontent {
    height: 340px !important;
  }
  .rcontent {
    .checked-list-box {
      height: 299px !important;
    }
  }
}
</style>
