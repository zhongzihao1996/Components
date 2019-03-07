# Vue 通用组件

## 安装

_package.json_

```json
{
	"dependencies": {
		"common-component": "git+ssh://git@gitlab.ijunhai.com:2289/moshenggui/common-component.git"
	}
}
```

```bash
npm install
```

## 使用

_main.js_

```js
import CommonComponent from 'common-component';

Object.keys(CommonComponent).forEach(key => {
	Vue.component(key, CommonComponent[key]);
});
```

## 调试

_在当期项目下开发调试。_

```bash
$ npm install
$ npm run dev
```

## 教程

_部分组件依赖于 `common-directive` 通用指令_

-   `infinite-select` 选择器  
    <http://gitlab.ijunhai.com:8989/moshenggui/common-component/tree/master/components/infinite-select>

-   `infinite-table` 表格  
    <http://gitlab.ijunhai.com:8989/moshenggui/common-component/tree/master/components/infinite-table>

-   `multiple-cascader` 级联  
    <http://gitlab.ijunhai.com:8989/moshenggui/common-component/tree/master/components/multiple-cascader>

## 更新记录

-   2019.1.14 修复了 raws 被更新后，备选项不发生变化的 bug
-   2019.1.16 修复因外部样式影响导致行高异常的 bug
-   2019.1.16 修复了外部样式影响行高的 bug
-   2019.1.17 添加自定义排序功能，可实现服务端排序
-   2019.1.17 抽离 table 渲染组件
-   2019.1.18 修复滚动加载时最后一条数据丢失的 bug
-   2019.1.23 实现 table 冻结列功能
-   2019.1.31 实现 multiple-cascader 多选级联
-   2019.1.31 修复使用冻结列功能的 table 下因 width 不足而导致空白区域的 bug
-   2019.1.31 不再使用 lodash 插件，改用原生方法
-   2019.2.25 table 组件修改表头背景色

---

## Todo

-   dom 回收 https://www.jianshu.com/p/81a6c4cb85be
