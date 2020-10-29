import Vue from 'vue';
import { orderBy, getKeysMap, getValueByKey, checkTrueArray, debounce } from '../common/util';

const doFlattenColumns = (columns) => {
  const result = [];
  columns.forEach((column) => {
    if (column.children) {
      result.push.apply(result, doFlattenColumns(column.children));
    } else {
      result.push(column);
    }
  });
  return result;
};

const Store = Vue.extend({
  data() {
    return {
      states: {
        data: [],
        originalData: [], // 暂存数据（未排序）
        rowKey: null,
        rowKey2: null,
        isFixed: false,
        hoverRowIndex: null,
        // 列
        _columns: [],              // 原始列数据（初始化后不修改）
        originColumns: [],         // 列数据（带嵌套关系）（children属性嵌套）
        columns: [],               // 列数据（不带嵌套关系的）（铺平）
        leftFixedColumns: [],      // 左固定列数据（带嵌套关系）
        rightFixedColumns: [],     // 右固定列数据（带嵌套关系）
        leafColumns: [],           // 非固定列数据（不带嵌套关系）
        leftFixedLeafColumns: [],  // 左固定列数据（不带嵌套关系）
        rightFixedLeafColumns: [], // 右固定列数据（不带嵌套关系）
        leafColumnsLength: 0,
        leftFixedLeafColumnsLength: 0,
        rightFixedLeafColumnsLength: 0,
        // 排序
        sortingColumn: null,
        sortProp: null,
        sortRule: null,
        // 多选
        isAllSelected: false,
        selectConfig: [],
        keepSelectionFlag: false,
        // 展开行
        expandRows: [],
        // 嵌套方式展开行
        expandAllFlag: false,
        nestedData: {},
        indent: 32, // 展开按钮间隔
        lazyLoad: false,
        lazyNodeMap: {},
      }
    };
  },

  computed: {
    // @return { id: { children, level } }
    nestedNode() {
      if (!this.states.rowKey) return {};
      const data = this.states.data || [];
      return this.getNestedNode(data);
    },
    // @return { id: { children } }
    lazyNode() {
      const { rowKey, rowKey2, lazyNodeMap } = this.states;
      const keys = Object.keys(lazyNodeMap);
      const res = {};
      if (!keys.length) {
        return res;
      }
      keys.forEach(key => {
        if (lazyNodeMap[key].length) {
          const item = { children: [] };
          lazyNodeMap[key].forEach(row => {
            const currentRowKey = getValueByKey(row, rowKey) + (rowKey2 ? `${getValueByKey(row, rowKey2)}` : '');
            item.children.push(currentRowKey);
            if (row.lazyChildren && !res[currentRowKey]) {
              res[currentRowKey] = { children: [] };
            }
          });
          res[key] = item;
        }
      });
      return res;
    }
  },

  watch: {
    nestedNode() {
      this.updateNestedData();
    },
    lazyNode() {
      this.updateNestedData();
    }
  },

  methods: {

    // 更新列数据信息
    updateColumns() {
      const states = this.states;
      const _columns = states._columns || [];
      states.leftFixedColumns = _columns.filter((column) => column.fixed === 'left');
      states.rightFixedColumns = _columns.filter((column) => column.fixed === 'right');
      states.isFixed = states.leftFixedColumns.length > 0 || states.rightFixedColumns.length > 0;

      const notFixedColumns = _columns.filter(column => !column.fixed);
      states.originColumns = [].concat(states.leftFixedColumns).concat(notFixedColumns).concat(states.rightFixedColumns);

      const leafColumns = doFlattenColumns(notFixedColumns);
      states.leafColumnsLength = leafColumns.length;

      const leftFixedLeafColumns = doFlattenColumns(states.leftFixedColumns);
      states.leftFixedLeafColumns = leftFixedLeafColumns;
      states.leftFixedLeafColumnsLength = leftFixedLeafColumns.length;

      const rightFixedLeafColumns = doFlattenColumns(states.rightFixedColumns);
      states.rightFixedLeafColumns = rightFixedLeafColumns;
      states.rightFixedLeafColumnsLength = rightFixedLeafColumns.length;

      states.columns = [].concat(leftFixedLeafColumns).concat(leafColumns).concat(rightFixedLeafColumns);
    },

    // 设置表格数据（包括排序）
    toSetData() {
      const states = this.states;
      const sortingColumn = states.sortingColumn;
      if (sortingColumn && typeof sortingColumn.sortable !== 'string' && states.sortRule) {
        states.data = orderBy(states.originalData, states.sortProp, states.sortRule);
      } else {
        states.data = states.originalData; // 恢复原顺序
      }
    },

    updateRowStatus(statusArr, row, set) {
      let changeFlag = false;
      const index = statusArr.indexOf(row);
      const includeFlag = index !== -1;

      const addRow = () => {
        statusArr.push(row);
        changeFlag = true;
      };
      const removeRow = () => {
        statusArr.splice(index, 1);
        changeFlag = true;
      };

      if (typeof set === 'boolean') {
        if (set && !includeFlag) {
          addRow();
        } else if (!set && includeFlag) {
          removeRow();
        }
      } else {
        if (includeFlag) {
          removeRow();
        } else {
          addRow();
        }
      }
      return changeFlag;
    },

    /**** 多选 ****/
    // 判断是否选择
    isSelected(row) {
      const { selectConfig = [] } = this.states;
      return selectConfig.indexOf(row) > -1;
    },

    // 处理指定行的选择
    handleRowSelection(row, selectSet) {
      const changeFlag = this.updateRowStatus(this.states.selectConfig, row, selectSet)
      if (changeFlag) {
        const newSelectConfig = (this.states.selectConfig || []).slice();
        this.table.$emit('selectChange', newSelectConfig);
      }
    },

    // 处理全选/清空操作
    handleAllSelection() {
      const states = this.states;
      const { data = [], selectConfig } = states;
      const newSet = !states.isAllSelected
      states.isAllSelected = newSet;

      let selectChangedFlag = false;
      data.forEach((row) => {
        const changeFlag = this.updateRowStatus(selectConfig, row, newSet)
        if (changeFlag) {
          selectChangedFlag = true;
        }
      });

      if (selectChangedFlag) {
        this.table.$emit('selectChange', selectConfig ? selectConfig.slice() : []);
      }
      this.table.$emit('selectAll', selectConfig);
    },

    // 清空选择
    clearSelection() {
      const states = this.states;
      states.isAllSelected = false;
      if (states.selectConfig.length > 0) {
        states.selectConfig = [];
        this.table.$emit('selectChange', []);
      }
    },

    // 更新是否全选的值
    updateAllSelected() {
      const states = this.states;
      const data = states.data || [];
      const len = data.length;
      if (len === 0) {
        states.isAllSelected = false;
        return;
      }
      let result = true;
      for (let i = 0; i < len; i++) {
        if (states.selectConfig.indexOf(data[i]) === -1) {
          result = false;
          break;
        }
      }
      states.isAllSelected = result;
    },

    keepSelectionByRowKey() {
      const states = this.states;
      const { selectConfig, rowKey, data } = states;
      const selectedMap = getKeysMap(selectConfig, rowKey);
      // 根据已选的映射数据（以rowkey为键值），通过遍历总体数据进行选择状态的维持
      data.forEach(row => {
        const rowId = getValueByKey(row, rowKey);
        // 以rowkey值作为桥梁获取新data中对应的行数据
        const rowObj = selectedMap[rowId];
        // 若获取有，则更新selectConfig
        if (rowObj) {
          selectConfig[rowObj.index] = row;
        }
      });
    },

    /**** 展开行 ****/
    updateExpandRows() {
      this.states.expandRows = [];
    },

    checkRowExpanded(row) {
      const { expandRows = [] } = this.states;
      return expandRows.indexOf(row) !== -1;
    },

    handleRowExpansion(row, expandSet) {
      const changeFlag = this.updateRowStatus(this.states.expandRows, row, expandSet);
      if (changeFlag) {
        this.table.$emit('expandChange', row, this.states.expandRows.slice());
        this.table.updateTable();
      }
    },

    /**** 嵌套方式展开行 ****/
    getNestedNode(data) {
      const { rowKey, rowKey2, lazyLoad } = this.states;
      const res = {};

      function createNode(parent, children, level) {
        const parentId = getValueByKey(parent, rowKey) + (rowKey2 ? `${getValueByKey(parent, rowKey2)}` : '');
        if (Array.isArray(children)) {
          res[parentId] = {
            children: children.map(row => getValueByKey(row, rowKey) + (rowKey2 ? `${getValueByKey(parent, rowKey2)}` : '')),
            level
          };
        }
        // 懒加载的节点
        else if (lazyLoad) {
          res[parentId] = {
            children: [],
            lazyLoad: true,
            level
          };
        }
      }

      function dig(parent, children, level) {
        createNode(parent, children, level);
        children.forEach(item => {
          // 懒加载
          if (item.lazyChildFlag) {
            createNode(item, null, level + 1);
            return;
          }
          // 往更深一层（若仍有子节点）
          const children = item.children;
          if (checkTrueArray(children)) {
            dig(item, children, level + 1);
          }
        });
      }

      data.forEach(item => {
        // 懒加载
        if (item.lazyChildFlag) {
          createNode(item, null, 0);
          return;
        }
        const children = item.children;
        if (checkTrueArray(children)) {
          dig(item, children, 0);
        }
      });

      return res;
    },

    updateNestedData() {
      const nestedNode = this.nestedNode;
      const lazyNode = this.lazyNode;
      const keys = Object.keys(nestedNode);
      const newNestedData = {};
      if (keys.length) {
        const {
          nestedData: oldNestedData,
          expandAllFlag,
          lazyLoad
        } = this.states;
        const rootLazyRowKeys = [];
        const getExpanded = (oldValue) => {
          const included = expandAllFlag;
          return !!((oldValue && oldValue.expanded) || included);
        };
        keys.forEach(key => {
          const oldValue = oldNestedData[key];
          const newValue = { ...nestedNode[key] };
          newValue.expanded = getExpanded(oldValue);
          if (newValue.lazyLoad) {
            const { loaded = false, loading = false } = oldValue || {};
            newValue.loaded = !!loaded;
            newValue.loading = !!loading;
            rootLazyRowKeys.push(key);
          }
          newNestedData[key] = newValue;
        });
        // 根据懒加载数据更新 nestedData
        const lazyKeys = Object.keys(lazyNode);
        if (lazyLoad && lazyKeys.length && rootLazyRowKeys.length) {
          lazyKeys.forEach(key => {
            const oldValue = oldNestedData[key];
            const lazyNodeChildren = lazyNode[key].children;
            if (rootLazyRowKeys.indexOf(key) !== -1) {
              // // 懒加载的 root 节点，更新一下原有的数据，原来的 children 一定是空数组
              // if (newNestedData[key].children.length !== 0) {
              //   throw new Error('[ElTable]children must be an empty array.');
              // }
              newNestedData[key].children = lazyNodeChildren;
            } else {
              const { loaded = false, loading = false } = oldValue || {};
              newNestedData[key] = {
                lazyLoad: true,
                loaded: !!loaded,
                loading: !!loading,
                expanded: getExpanded(oldValue, key),
                children: lazyNodeChildren,
                level: ''
              };
            }
          });
        }
      }
      this.states.nestedData = newNestedData;
      Vue.nextTick(this.table.checkScrollY);
    },

    // 处理嵌套节点的展开/隐藏
    handleNestedExpansion(row, expandSet) {
      const { rowKey, rowKey2, nestedData } = this.states;
      const id = getValueByKey(row, rowKey) + (rowKey2 ? `${getValueByKey(row, rowKey2)}` : '');
      const data = id && nestedData[id];
      if (id && data && ('expanded' in data)) {
        const oldExpanded = data.expanded;
        expandSet = typeof expandSet === 'undefined' ? !data.expanded : expandSet;
        nestedData[id].expanded = expandSet;
        if (oldExpanded !== expandSet) {
          this.table.$emit('expandChange', row, expandSet);
        }
        Vue.nextTick(this.table.checkScrollY);
      }
    },

    // 点击嵌套节点的展开/隐藏按钮
    handleClickNestedIcon(row) {
      const { lazyLoad, nestedData, rowKey, rowKey2 } = this.states;
      const id = getValueByKey(row, rowKey) + (rowKey2 ? `${getValueByKey(row, rowKey2)}` : '');
      const nestedNode = nestedData[id];
      if (lazyLoad && nestedNode && 'loaded' in nestedNode && !nestedNode.loaded) {
        this.loadData(row, id, nestedNode);
      } else {
        this.handleNestedExpansion(row);
      }
    },

    // 懒加载
    loadData(row, key, nestedNode) {
      const { loadFun } = this.table;
      const { lazyNodeMap, nestedData } = this.states;
      if (loadFun && !nestedData[key].loaded) {
        nestedData[key].loading = true;
        loadFun(
          row,
          nestedNode,
          data => {
            nestedData[key].loading = false;
            nestedData[key].loaded = true;
            nestedData[key].expanded = true;
            if (data.length) {
              this.$set(lazyNodeMap, key, data);
            }
            this.table.$emit('expandChange', row, true);
          }
        );
      }
    }
  }
});

Store.prototype.mutations = {
  setData(states, data) {
    const dataChangeFlag = states.originalData !== data;
    states.originalData = data;  // 保存原序数据
    this.toSetData(); // 根据当前配置（排序或其他）进行数据赋值
    if (states.keepSelectionFlag && states.rowKey) {
      this.keepSelectionByRowKey();
    } else {
      if (dataChangeFlag) {
        this.clearSelection();
      }
    }
    this.updateAllSelected();
    this.updateExpandRows();
    Vue.nextTick(this.table.checkScrollY);
  },

  insertColumn(states, column, index, parent) {
    let array = states._columns;
    if (parent) {
      array = parent.children;
      if (!array) array = parent.children = [];
    }

    if (typeof index !== 'undefined') {
      array.splice(index, 0, column);
    } else {
      array.push(column);
    }

    if (column.type === 'select') {
      states.keepSelectionFlag = column.keepSelectionFlag;
    }

    if (this.table.initFlag) {
      this.updateColumns();
      // this.table.updateTable();
    }
  },

  removeColumn(states, column, parent) {
    let array = states._columns;
    if (parent) {
      array = parent.children;
      if (!array) array = parent.children = [];
    }
    if (array) {
      array.splice(array.indexOf(column), 1);
    }

    if (this.table.initFlag) {
      this.updateColumns();
      // this.table.updateTable();
    }
  },

  changeSortCondition(states, sortSet) {
    const column = sortSet.sortingColumn;
    const prop = sortSet.sortProp;
    let rule = sortSet.sortRule;
    // 没指定规则时
    if (!rule) {
      // 点击新的一列
      if (column !== states.sortingColumn) {
        rule = 'asc'; // 默认升序
      } 
      // 点击同一列
      else {
        const r = states.sortRule;
        if (r === 'asc') {
          rule = 'desc';
        } else if (r === 'desc') {
          rule = null;
        } else {
          rule = 'asc'; // 默认升序
        }
      }
    }
    // 指定规则时(主要处理默认排序时传入非指定的排序方式，此情况取作升序)
    else {
      rule = (rule === 'asc' || rule === 'desc') ? rule : 'asc';
    }
    // 保存当次排序数据（用于比较）
    states.sortingColumn = column;
    states.sortProp = prop;
    states.sortRule = rule;
    // 执行排序
    this.toSetData();
    // 触发钩子
    this.table.$emit('sortChange', { column, prop, rule });

    Vue.nextTick(this.table.checkScrollY);
  },

  setHoverRowIndex(states, row) {
    states.hoverRowIndex = row;
  },

  changeRowSelect(states, row, selectSet) {
    this.handleRowSelection(row, selectSet);
    this.updateAllSelected();
  },
  
  changeAllSelect() {
    const that = this;
    debounce(10, function () {
      that.handleAllSelection();
    })();
  },

  handleClearSelection() {
    const that = this;
    debounce(10, function () {
      that.clearSelection();
    })();
  },

  changeExpansion(states, row, expandSet) {
    const hasExpandColumn = states.columns.some(({ type }) => type === 'expand');
    if (hasExpandColumn) {
      this.handleRowExpansion(row, expandSet);
    } else {
      this.handleNestedExpansion(row, expandSet);
    }
  },

  clearAllSort(states) {
    const getStates = states;
    if (!getStates.sortingColumn) return;
    if (getStates.sortingColumn && getStates.sortingColumn !== null) {
      getStates.sortingColumn.rule = null;
    }
    getStates.sortingColumn = null;
    getStates.sortProp = null;
    getStates.sortRule = null;
    this.toSetData();
    Vue.nextTick(this.table.checkScrollY);
  }
};

Store.prototype.commit = function (name, ...args) {
  this.mutations[name].apply(this, [this.states].concat(args));
};

export default Store;
