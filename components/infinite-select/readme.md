# InfiniteSelect 无限滚动选择器

_当选项过多时（大量数据），使用下拉菜单展示并选择内容。(基于饿了么 UI 库 el-select 组件)_

## 基础用法

_适用广泛的基础单选_

```xml
<infinite-select :raws="options" :value="value" />
```

```js
export default {
	data() {
		return {
			value: '选项1',
			options: [
				{ value: '选项1', label: '黄金糕' },
				{ value: '选项2', label: '双皮奶' },
				{ value: '选项3', label: '蚵仔煎' },
				{ value: '选项4', label: '龙须面' },
				{ value: '选项5', label: '北京烤鸭' },
			],
		};
	},
};
```

`value` 的值为当前被选中的 `options` 子项 的 `value` 属性值。  
_注：value 单向数据流，如果需要获取数据，需要监听 `change` 钩子。_

## 有禁用选项

_禁用某个选项或分组选项。_

```xml
<infinite-select :raws="options" :value="value" />
```

```js
export default {
	data() {
		return {
			value: '选项1',
			options: [
				{ value: '选项1', label: '黄金糕' },
				{ value: '选项2', label: '双皮奶', disabled: true },
				{ value: '选项3', label: '蚵仔煎' },
				{ value: '选项4', label: '龙须面' },
				{ value: '选项5', label: '北京烤鸭', disabled: true },
			],
		};
	},
};
```

在选择项或分组中，设定 `disabled` 为 `true`,即可禁用该选项或分组。

## 禁用状态

_选择器不可用状态_

```xml
<infinite-select :raws="options" :value="value" />
```

为 `infinite-select` 设置 `disabled` 属性，则整个选择器不可用。

## 基础多选

_适用性较广的基础多选，用数量表示已选项_

```xml
<infinite-select :raws="options" :value="value" multiple />
```

```js
export default {
	data() {
		return {
			value: ['选项1'],
			options: [
				{ value: '选项1', label: '黄金糕' },
				{ value: '选项2', label: '双皮奶' },
				{ value: '选项3', label: '蚵仔煎' },
				{ value: '选项4', label: '龙须面' },
				{ value: '选项5', label: '北京烤鸭' },
			],
		};
	},
};
```

为 `infinite-select` 设置 `multiple` 属性即可启用多选，此时 `value` 的值为默认选中值所组成的`数组`。

## 自定义模板

_可以自定义备选项_

```xml
<infinite-select :raws="options" :value="value">
    <button slot-scope="scope">{{scope.row.label}}</button>
</infinite-select>
```

将自定义的 `HTML` 模板插入 `infinite-select` 的 `slot` 中即可。其中通过 `slot-scope` 可以获取到作用域。

## 可搜索

_可以利用搜索功能快速查找选项_

```xml
<infinite-select :raws="options" :value="value" filterable />
```

为 `infinite-select` 添加 `filterable` 属性即可启用搜索功能。搜索情况下会遍历 `raws` 对象查找，查找规则是输入关键字与选项的 `lable` 匹配。

---

## InfiniteSelect Attributes

|    参数     |                      说明                      |        类型         | 默认值 |
| :---------: | :--------------------------------------------: | :-----------------: | ------ |
|    raws     |  原始数据，作为选择器的数据来源（格式见说明）  |        Array        | -      |
|    value    | 默认选中的值（多选时是数组，单选时是简单类型） | String/Number/Array | -      |
|   isgroup   |                  是否启动分组                  |       Boolean       | false  |
|    step     |                 一屏显示的数量                 |       Number        | 100    |
|   showBtn   |                是否显示操作按钮                |       Boolean       | false  |
|  multiple   |                   是否为多选                   |       Boolean       | false  |
| filterable  |                   是否可搜索                   |       Boolean       | false  |
| placeholder |                     占位符                     |       String        | 请选择 |
|  disabled   |                  组件不可编辑                  |       Boolean       | false  |
|  extraval   |    多选时的后缀词（默认显示选中多少条选项）    |       String        | -      |
|  clearable  |               是否可清除单选结果               |       Boolean       | false  |

## InfiniteSelect Events

| 事件名 |         说明         | 参数  |
| :----: | :------------------: | :---: |
| change | 选中项发生变化时触发 | value |

## InfiniteSelect Slots

| name |       说明       |
| :--: | :--------------: |
|  -   | 备选项自定义模板 |

## Raws Attributes

|   字段   |       说明       |             类型              |
| :------: | :--------------: | :---------------------------: |
|  label   | 显示内容（必填） |            String             |
|  value   | 主键（提交内容） |               -               |
| disabled |     是否禁用     |            Boolean            |
| children |     分组元素     | Array、{label,value,children,disabled} |

_注：分组情况下以 label 为分组名，children 为备选项。_

---

## 更新记录

-   2019.1.14 修复了 raws 被更新后，备选项不发生变化的 bug
-   2019.1.16 修复因外部样式影响导致行高异常的 bug
