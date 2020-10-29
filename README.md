# components-junhai

君海后台组件库

#### 安装
- package.json
```
"dependencies": {
    "components-junhai": "git+ssh://git@gitlab.ijunhai.com:2289/official-web-and-activity/components-junhai.git"
}
```

#### 导入
- 完整引入
```
// 入口文件
import 'components-junhai/lib/style/index.css'; // 样式文件需单独引入
import componentsJunhai from 'components-junhai';
// ...
Vue.use(componentsJunhai);
```
- 按需引入
配置：使用 **babel-plugin-component**（typescript项目使用 **ts-import-plugin**）
```
// 入口文件
import { TableComponent, Pagination } from 'components-junhai';
Vue.use(TableComponent);
Vue.use(Pagination);
```

#### API
###### `TableComponent` 表格组件
[readme](http://gitlab.ijunhai.com:8989/official-web-and-activity/table-component)  

---
###### `Pagination` 分页组件
[readme](http://gitlab.ijunhai.com:8989/official-web-and-activity/table-component)  

---
###### `<date-picker>` 日期选择组件
- 属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|:---:|:----:|:----:|:------:|:------:|
| size | 尺寸(同element-ui) | string | - | mini |
| disabled | 是否禁用| boolean | - | false |
| editable | 文本框是否可输入| boolean | - | true |
| searchFormDate | 绑定值（使用.sync会自动更新值；否则需监听dateChange事件手动更新）| string[] 或 string | - | - |
| type | 显示类型(同element-ui) | string | - | daterange |
| isLimit | 是否禁止选择未来时间 | boolean | - | true |
| dateType | 配置element-ui组件中format与value-format的值 | string | - | yyyy-MM-dd |
| defaultTime | 配置element-ui组件中default-time的值 | string[] | - | - |
| rangeSeparator | 选择范围时的分隔符 | string | - | 至 |
| placeholder | 非范围选择时的占位内容 | string | - | - |
| startPlaceholder | 范围选择时开始日期的占位内容 | string | - | 开始日期 |
| endPlaceholder | 范围选择时结束日期的占位内容 | string | - | 结束日期 |
| pickerOptionsData | 配置element-ui组件中picker-options的shortcuts值 | Object[]（object为{ text, onClick } 对象） | - | - |

- 事件

| 事件名 | 说明 | 参数 |
|:-----:|:----:|:----:|
| dateChange | 用户确认选定的值时触发，用户若没使用.sync则需监听来手动更新 | 组件绑定值（格式与绑定值一致） |


---
###### `<pop-dialog>` 弹窗组件
- 属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|:---:|:----:|:----:|:------:|:------:|
| dialogType | 弹窗形式 | string | inform 或 confirm 或 form | inform |
| showFlag | 是否显示 | Boolean | - | false |
| showCloseFlag | 是否显示右上角关闭按钮 | Boolean | - | false |
| clickBgCloseFlag | 是否可点击遮罩关闭 | Boolean | - | false |
| title | 标题 | string | - | '' |
| centerStyle | 内容是否居中显示 | Boolean | - | false |
| cancelbuttonText | “取消”按钮文案 | string | - | 取消 |
| buttonText | “确定”按钮文案 | string | - | 确定 |
| sureButtonDisabled | “确定”按钮是否禁用 | Boolean | - | false |
| sureButtonType | element-ui按钮类型 | string | - | primary |
| width | 宽度（每种形式有各自的默认宽度） | number | - | - |
| height | 高度 | number | - | - |
| beforeCloseFun | 关闭前的回调，会暂停关闭 | function(closeFun)，调用closeFun即可关闭 | - | - |

- 事件

| 事件名 | 说明 | 参数 |
|:-----:|:----:|:----:|
| sureClick | 用户点击确定时触发 | - |
| cancelClick | 用户点击取消时触发 | - |
| close | 用户点击右上角关闭按钮 或 点击遮罩 关闭时触发 | - |


---
###### `<multi-select>` 多选选择器组件
- 属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|:---:|:----:|:----:|:------:|:------:|
| type | 配置唯一标识，在update回调中通过该标识获取选择值 | string | - | - |
| disabled | 是否禁用 | boolean | - | false |
| smallSize | (宽度)是否默认为小尺寸 | boolean | - | false |
| options | 选择数据 | any[] 或 object | - | - |
| placeholder | 占位符 | string | - | - |
| group | 选择是否分组 | boolean | - | false |
| labelField | 选择项数据的标签属性名 | string | - | label |
| valueField | 选择项数据的值属性名 | string | - | value |
| parentVal | 绑定值 | string[] | - | - |

- 事件

| 事件名 | 说明 | 参数 |
|:-----:|:----:|:----:|
| update | 选中值发生变化时触发 | (type绑定值: string, 目前的选中值: string[]) |
| visible-change | 下拉框出现/隐藏时触发 | 出现则为 true，隐藏则为 false |


---
###### `<customize-filter>` 自定义筛选组件
- 属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|:---:|:----:|:----:|:------:|:------:|
| title | 标题 | string | - | 自定义指标 |
| sureButtonText | “确定”按钮文案 | string | - | 确定 |
| data | 选择数据 | object[](object根据是否分组不同形式) | - | - |
| value | 绑定值 | object[] | - | - |
| default | 用于恢复默认的值 | object[] | - | [] |
| groupFlag | 是否为多分组的情况（传入数据结构不同） | Boolean | - | false |
| keepOrderFlag | 在增加选择项时是否保持顺序(若要保持顺序，需注意前提：不能存在带有disabled属性的指标) | Boolean | - | false |
| showFlag | 是否显示弹框（使用.sync会自动更新值；否则需监听change事件手动更新）| Boolean | - | false |
| saveTemplateFlag | 是否为保存模板形式 | Boolean | - | false |
| templateRemindText | 保存模板提示文本 | string | - | '' |
| templateNameNum | 保存的模板名称值可输入最多字符(以汉字字符为准) | number | - | 10 |
| specialText | 特殊队列的特点说明 | string | - | '' |
| specialField | 用于判断是否归类为特殊队列的字段(该字段需为boolean类型) | string | - | - |

- 事件

| 事件名 | 说明 | 参数 |
|:-----:|:----:|:----:|
| change | 用户点击确定时触发 | 结果对象（包括属性：总配置数据data，已选特殊队列specialList，已选普通队列normalList） |
| close | 用户点击确定或取消时触发 | - |

