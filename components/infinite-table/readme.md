# InfiniteTable 无限滚动表格

_用于展示多条结构类似的数据，可对数据进行排序、筛选、对比或其他自定义操作。（原生组件，将来做 dom 回收）_

## 基础表格

_基础的表格展示用法。_

```xml
<template>
  <infinite-table :raws="list">
    <infinite-table-header slot="header">
      <infinite-table-header-column label="日期"/>
      <infinite-table-header-column label="姓名"/>
      <infinite-table-header-column label="地址"/>
    </infinite-table-header>
    <infinite-table-body slot-scope="scope" :row="scope.row" :index="scope.index" slot="body">
      <infinite-table-body-column prop="date" />
      <infinite-table-body-column prop="name" />
      <infinite-table-body-column prop="address" />
    </infinite-table-body>
  </infinite-table>
</template>
```

```js
export default {
	data() {
		return {
			list: [
				{
					date: '2016-05-02',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1518 弄',
				},
				{
					date: '2016-05-04',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1517 弄',
				},
				{
					date: '2016-05-01',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1519 弄',
				},
				{
					date: '2016-05-03',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1516 弄',
				},
			],
		};
	},
};
```

当 `infinite-table` 元素中注入 `raws` 对象数组后，在 `infinite-table-header-column` 中用 `label` 属性来对应对象中的名称，在 `infinite-table-body-column` 中用 `prop` 属性来对应对象中的键。可以使用 `width` 属性来定义列宽。

## 索　引

_在每一行前加索引值。_

```xml
<template>
  <infinite-table :raws="list">
    <infinite-table-header slot="header">
      <infinite-table-header-index />
      <infinite-table-header-column label="日期"/>
      <infinite-table-header-column label="姓名"/>
      <infinite-table-header-column label="地址"/>
    </infinite-table-header>
    <infinite-table-body slot-scope="scope" :row="scope.row" :index="scope.index" slot="body">
      <infinite-table-body-index />
      <infinite-table-body-column prop="date" />
      <infinite-table-body-column prop="name" />
      <infinite-table-body-column prop="address" />
    </infinite-table-body>
  </infinite-table>
</template>
```

使用 `infinite-table-header-index` 和 `infinite-table-body-index` 标签可以实现索引。其中 infinite-table-header-index 表头的值默认为`#`，可传入自定义插槽。

## 多　选

_选择多行数据时使用 Selection。_

```xml
<template>
  <infinite-table :raws="list">
    <infinite-table-header slot="header">
      <infinite-table-header-selection />
      <infinite-table-header-column label="日期"/>
      <infinite-table-header-column label="姓名"/>
      <infinite-table-header-column label="地址"/>
    </infinite-table-header>
    <infinite-table-body slot-scope="scope" :row="scope.row" :index="scope.index" slot="body">
      <infinite-table-body-selection />
      <infinite-table-body-column prop="date" />
      <infinite-table-body-column prop="name" />
      <infinite-table-body-column prop="address" />
    </infinite-table-body>
  </infinite-table>
</template>
```

实现多选非常简单: 手动添加一个 `infinite-table-header-selection` 和 `infinite-table-body-selection` 即可；表头多选框可以实现全选与不全选功能，选择发生变化时触发 `selectionChange` 回调。

如果需要手动设置选中项，可调用 `setSelection` 函数进行设置。

## 排　序

_对表格进行排序，可快速查找或对比数据。_

```xml
<template>
  <infinite-table :raws="list">
    <infinite-table-header slot="header">
      <infinite-table-header-column label="日期" prop="date" sortable />
      <infinite-table-header-column label="姓名"/>
      <infinite-table-header-column label="地址"/>
    </infinite-table-header>
    <infinite-table-body slot-scope="scope" :row="scope.row" :index="scope.index" slot="body">
      <infinite-table-body-column prop="date" />
      <infinite-table-body-column prop="name" />
      <infinite-table-body-column prop="address" />
    </infinite-table-body>
  </infinite-table>
</template>
```

在 `infinite-table-header-column` 列中设置 `sortable` 和 `prop` 属性即可实现以该列为基准的排序，`sortable` 接受一个 `Boolean`，默认为 `false`；由于已经获取到原始数据，所以屏蔽了后端排序功能。默认是按照当前字段排序，如果需要自定义排序，可以一开始就对 `raws` 进行排序再赋值，或者监听 `afterSortchange` 钩子，在排序结束后再次初始化数据。

_注：排序模式下 `prop` 字段为必填_

## 筛　选

_对表格进行筛选，可快速查找到自己想看的数据。_

```xml
<template>
  <infinite-table :raws="list">
    <infinite-table-header slot="header">
      <infinite-table-header-column label="日期" prop="date" filteable />
      <infinite-table-header-column label="姓名"/>
      <infinite-table-header-column label="地址"/>
    </infinite-table-header>
    <infinite-table-body slot-scope="scope" :row="scope.row" :index="scope.index" slot="body">
      <infinite-table-body-column prop="date" />
      <infinite-table-body-column prop="name" />
      <infinite-table-body-column prop="address" />
    </infinite-table-body>
  </infinite-table>
</template>
```

在 `infinite-table-header-column` 列中设置 `filteable` 和 `prop` 属性即可实现以该列为基准的筛选，`filteable` 接受一个 `Boolean`，默认为 `false`；由于已经获取到原始数据，所以屏蔽了后端筛选功能。默认是按照当前字段排序，如果需要自定义过滤，可以一开始就对 `raws` 进行过滤再赋值，或者监听 `afterFilteChange` 钩子，在过滤结束后再次初始化数据。

_注：筛选模式下 `prop` 字段为必填_

## 自定义列模板

_自定义列的显示内容，可组合其他组件使用。_

```xml
<template>
  <infinite-table :raws="list">
    <infinite-table-header slot="header">
      <infinite-table-header-column label="日期"/>
      <infinite-table-header-column label="姓名"/>
      <infinite-table-header-column label="地址"/>
    </infinite-table-header>
    <infinite-table-body slot-scope="scope" :row="scope.row" :index="scope.index" slot="body">
      <infinite-table-body-column>
        <span>{{scope.row.date}}</span>
      </infinite-table-body-column>
      <infinite-table-body-column prop="name" />
      <infinite-table-body-column prop="address" />
    </infinite-table-body>
  </infinite-table>
</template>
```

通过 `infinite-table-body` 标签的作用域 `slot-scope` 可以获取到 `row` 当前行数据和 `index`索引数据。

_注：`infinite-table-body`标签上 `slot-scope`、`row`、`index` 均为必填_

## 展开行

_当行内容过多并且不想显示横向滚动条时，可以使用 Table 展开行功能。_

```xml
<template>
  <infinite-table :raws="list">
    <infinite-table-header slot="header">
      <infinite-table-header-expand />
      <infinite-table-header-column label="日期" />
      <infinite-table-header-column label="姓名"/>
      <infinite-table-header-column label="地址"/>
    </infinite-table-header>
    <infinite-table-body slot-scope="scope" :row="scope.row" :index="scope.index" slot="body">
      <infinite-table-body-expand>
        <p>{{scope.row}}</p>
      </infinite-table-body-expand>
      <infinite-table-body-column prop="date" />
      <infinite-table-body-column prop="name" />
      <infinite-table-body-column prop="address" />
    </infinite-table-body>
  </infinite-table>
</template>
```

添加 `infinite-table-header-expand` 和 `infinite-table-body-expand` 标签，在 `infinite-table-body-expand` 标签内可使用 `slot-scope` 进行绑定数据。

## 自定义表头

_多表头或合并表头。_

```xml
<template>
  <infinite-table :raws="list">
  <infinite-table-header slot="header">
      <infinite-table-header-column label="汇总" colspan="3" />
    </infinite-table-header>
    <infinite-table-header slot="header">
      <infinite-table-header-column label="日期"  />
      <infinite-table-header-column label="姓名"/>
      <infinite-table-header-column label="地址"/>
    </infinite-table-header>
    <infinite-table-body slot-scope="scope" :row="scope.row" :index="scope.index" slot="body">
      <infinite-table-body-column prop="date" />
      <infinite-table-body-column prop="name" />
      <infinite-table-body-column prop="address" />
    </infinite-table-body>
  </infinite-table>
</template>
```

使用多个 `header` 插槽可以实现多表头，使用 `colspan` 和 `rowspan` 属性可以实现合并

## 冻结列

_在列数过多时冻结特定列以便查看。_

```xml
<template>
  <infinite-table :raws="list" width="2000px" fixedable>
    <infinite-table-header slot="header">
      <infinite-table-header-column label="日期" fixed="left" />
      <infinite-table-header-column label="姓名"/>
      <infinite-table-header-column label="地址"/>
    </infinite-table-header>
    <infinite-table-body slot-scope="scope" :row="scope.row" :index="scope.index" slot="body">
      <infinite-table-body-column prop="date" fixed="left" />
      <infinite-table-body-column prop="name" />
      <infinite-table-body-column prop="address" />
    </infinite-table-body>
  </infinite-table>
</template>
```

配合使用 `width`、`fixedable`、`fixed` 可实现冻结列功能。

---

## InfiniteTable Attributes

|    参数    |                  说明                  |  类型   | 默认值 |
| :--------: | :------------------------------------: | :-----: | ------ |
|    raws    | 原始数据，作为表格内容的数据源（必填） |  Array  | -      |
|    step    |             一屏显示的数量             | Number  | 100    |
|   border   |             表格边框/边距              | Number  | 20     |
| isloading  |               数据加载中               | Boolean | false  |
|   width    |                表格宽度                | String  | 100%   |
| fixedable  |            是否启用冻结功能            | Boolean | false  |
| sortcustom |        排序时是否启动自定义排序        | Boolean | false  |
|  tablecls  |               自定义类名               | String  | \_     |

_开启 `sortcustom` 自定义排序后，触发排序时将不再进行默认排序，应该在 `afterSortChange` 钩子上监听排序状态，并更新 `raws` 数据源_

## InfiniteTable Events

|      事件名      |            说明            |          参数           |
| :--------------: | :------------------------: | :---------------------: |
| afterSortChange  |   排序完成后触发（钩子）   |   sortProp、sortOrder   |
| afterFilteChange |   筛选完成后触发（钩子）   | filteProp、filteOptions |
| selectionChange  | 选中发生变化时触发（钩子） |      选中索引数组       |
|  clearSelection  |    清除选中（ref 调用）    |            -            |
|   setSelection   |   设置选中项（ref 调用）   |        索引数组         |
|  renderingFull   |          全量渲染          |        callback         |

## InfiniteTable Slot

|  name  |                说明                |
| :----: | :--------------------------------: |
|  top   |        头部内容，可添加多个        |
| header |   表头，可添加多个实现自定义表头   |
| fixed  |               固定行               |
|  body  |              表格主体              |
| append |               末尾行               |
| empty  | 表格内容为空的提示，默认为暂无数据 |
| bottom |        底部内容，可添加多个        |

## InfiniteTableHeaderColumn Attributes

|   参数    |          说明          |     类型      | 默认值        |
| :-------: | :--------------------: | :-----------: | ------------- |
|   label   |          名称          |    String     | -             |
|   prop    | 键名(排序和筛选时必填) |    String     | 100           |
|   width   |          宽度          | String/Number | -             |
|   fixed   |       是否冻结列       |    String     | -(left/right) |
|  colspan  |        跨列合并        | String/Number | 1             |
|  rowspan  |        跨行合并        | String/Number | 1             |
| sortable  |      是否开启排序      |    Boolean    | false         |
| filteable |      是否开启筛选      |    Boolean    | false         |

## InfiniteTableBody Attributes

| 参数  |                   说明                    |  类型  | 默认值 |
| :---: | :---------------------------------------: | :----: | ------ |
|  row  | 当前行的数据（必填）,通过 slot-scope 获取 | Array  | -      |
| index |                当前行索引                 | Number | -      |

## InfiniteTableBodyColumn Attributes

|  参数   |    说明    |     类型      | 默认值        |
| :-----: | :--------: | :-----------: | ------------- |
|  prop   |     键     |    String     | -             |
|  width  |    宽度    | String/Number | -             |
|  fixed  | 是否冻结列 |    String     | -(left/right) |
| colspan |  跨列合并  | String/Number | 1             |
| rowspan |  跨行合并  | String/Number | 1             |

## InfiniteTableBodyColumn Slot

| name |                 说明                 |
| :--: | :----------------------------------: |
|  -   | 默认根据键名显示内容，可自定义列模板 |

## 更新记录

-   2019.1.16 修复了外部样式影响行高的 bug
-   2019.1.17 添加自定义排序功能，可实现服务端排序
-   2019.1.17 抽离 table 渲染组件
-   2019.1.18 修复滚动加载时最后一条数据丢失的 bug
-   2019.1.23 实现 table 冻结列功能
