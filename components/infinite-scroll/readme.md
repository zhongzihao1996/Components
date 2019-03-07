# infinite-scroll-page 无限滚动页面（表格）

<font color=red >注：该组件已废弃，请使用 infinite-table 组件</font>

> 用于展示多条结构类似的数据，可对数据进行排序、筛选、对比或其他自定义操作。 样式基于 Element-ui，用于优化数据报表渲染慢的问题

### 基础使用

> html

```html
<infinite-scroll-page :raws="raws">
  <infinite-scroll-column-group slot="main">
    <infinite-scroll-column label="总人数">123</infinite-scroll-column>
    <infinite-scroll-column label="总充值" prop="pay_amount" />
  </infinite-scroll-column-group>
</infinite-scroll-page>
```

> js

```js
data(){
    return{
        raws:[
            {pay_num:1, pay_amount:1},
            {pay_num:2, pay_amount:2}
        ]
    }
}
```

`infinite-scroll-page` 是组件标签名，`infinite-scroll-column-group` 和 `infinite-scroll-column` 分别代表表头与列。

---

### 排　序

```html
<infinite-scroll-page :raws="raws">
  <infinite-scroll-column-group slot="main">
    <infinite-scroll-column label="总人数" prop="pay_num" sortable />
    <infinite-scroll-column label="总充值" prop="pay_amount" />
  </infinite-scroll-column-group>
</infinite-scroll-page>
```

在 `infinite-scroll-column` 标签上配置 `sortable` 属性为 `true` 即可。

排序完成后会触发 afterSortChange 钩子。

---

### 筛　选

```html
<infinite-scroll-page :raws="raws">
  <infinite-scroll-column-group slot="main">
    <infinite-scroll-column label="总人数" prop="pay_num" filteable />
    <infinite-scroll-column label="总充值" prop="pay_amount" />
  </infinite-scroll-column-group>
</infinite-scroll-page>
```

使用 `filteable` 属性,将从 raws 原始数据中分组获取数据。

筛选（分组）完成后，触发 afterFilteChange 钩子。

---

### 多　选

无

---

### 索　引

无

### 合并列

colspan、rowspan

---

### 多级表头

如果需要多表头，可以添加多个`infinite-scroll-column-group`标签，如

```html
<infinite-scroll-page :raws="raws">
  <template slot="main">
    <infinite-scroll-column-group>
      <infinite-scroll-column label="总人数" :span="2"></infinite-scroll-column>
    </infinite-scroll-column-group>
    <infinite-scroll-column-group>
      <infinite-scroll-column label="总人数" prop="pay_num" />
      <infinite-scroll-column label="总充值" prop="pay_amount" />
    </infinite-scroll-column-group>
  </template>
</infinite-scroll-page>
```

添加多个 `infinite-scroll-column-group` 代表多个表头，其中 `span` 代表横向合并数量，默认是 1。

**注：infinite-scroll-column 不添加 prop 属性，将不参与数据渲染。**

---

### 自定义列模板

无

---

### 展开行

无

---

### 属性/事件

> infinite-scroll-page

| 名称 | 类型  | 默认 |
| :--: | :---: | :--: |
| raws | Array | [ ]  |

---

### 事　件

> infinite-scroll-page

- afterSortChange  
  列排序后触发，返回参数 `sortProp` 和 `sortOrder`，代表当前排序字段与排序顺序。

  如果需要自定义排序，可以在此对 raws 进行默认排序再重新渲染组件。

- afterFilteChange  
  列分组后触发，返回参数 `filteProp` 和 `filteOptions`,代表当前筛选字段与需要分组的项

---

### 插　槽

|  名称  | 必填 |            意义            |
| :----: | :--: | :------------------------: |
| header |  否  | 头部，在主体表格上方的内容 |
|  main  |  是  |        主体表格部分        |
| fixed  |  否  | 需要固定在表格第一行的内容 |
| empty  |  否  |   表格内容为空的提示内容   |
| footer |  否  |     尾部，主体底部内容     |
