# multiple-cascader 多选级联组件

_当一个数据集合有清晰的层级结构时，可通过级联选择器逐级查看并选择。用于解决 element-ui 级联组件不支持多项的问题。_

## 基础用法

_有多种触发菜单的方式，默认是 click 触发。_

```xml
<multiple-cascader :options="options" :value="value" />
```

```js
export default {
	data() {
		return {
			value: [],
			options: [
				{
                    value: '0',
                    label: '指南0'
                },
                {
                    value: '1',
                    label: '指南1',
                    children: [
                        value: '2',
                        label: '指南2',
                    ]
                }
			],
		};
	},
};
```

只需为 `multiple-cascader` 的 `options` 属性指定选项数组即可渲染出一个级联选择器。通过 `trigger` 可以定义展开菜单的触发方式。通过 `change` 事件还可以接收到选中的值的最后一级的 `value`。

## 禁用选项　　

_通过在数据源中设置 disabled 字段来声明该选项是禁用的_

```js
export default {
	data() {
		return {
			value: [],
			options: [
				{
                    value: '0',
                    label: '指南0',
                    disabled: true
                },
                {
                    value: '1',
                    label: '指南1',
                    disabled: true,
                    children: [
                        value: '2',
                        label: '指南2',
                    ]
                }
			],
		};
	},
};
```

在 `options` 数组项中设置 `disable:true`,即可禁用该选项，如果该选项还有后代子项，将一律屏蔽后代执行的操作。

## 可搜索

_可以快捷地搜索选项并选择。_

```xml
<multiple-cascader :options="options" :value="value" filterable />
```

将 `filterable` 赋值为 `true` 即可打开搜索功能。

## Attributes

|    参数     |            说明            |               类型               | 默认值 |
| :---------: | :------------------------: | :------------------------------: | ------ |
|   options   | 可选项数据源（格式见说明） |              Array               | -      |
|    value    |           绑定值           |              Array               | -      |
| filterable  |       是否可搜索选项       |             Boolean              | false  |
| placeholder |       输入框占位文本       |              String              | 请选择 |
|  extraval   |          选项后缀          |              String              | -      |
|  disabled   |          是否禁用          |             Boolean              | false  |
|  clearable  |      是否支持清空选项      |             Boolean              | false  |
|    width    |            宽度            |              String              | 193px  |
|   trigger   |          触发方式          | String(click/focus/hover/manual) | click  |

## Events

| 事件名 |         说明         | 参数  |
| :----: | :------------------: | :---: |
| change | 选中项发生变化时触发 | value |

## Props

|   字段   |       说明       |                  类型                  |
| :------: | :--------------: | :------------------------------------: |
|  label   | 显示内容（必填） |                 String                 |
|  value   | 主键（提交内容） |                   -                    |
| disabled |     是否禁用     |                Boolean                 |
| children |     分组元素     | Array、{label,value,children,disabled} |
