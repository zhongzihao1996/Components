export function orderBy(arr, prop, rule) {
  // let array = JSON.parse(JSON.stringify(arr));
  let array = arr.slice();
  array.sort((a, b) => {
    let valueA = a[prop];
    let valueB = b[prop];
    if (valueA === '-' && valueB === '-') {
      return 0;
    }
    else if (valueA === '-') {
      return 1;
    }
    else if (valueB === '-') {
      return -1;
    }
    else if (typeof valueA === 'number') {
      return rule === 'asc' ? valueA - valueB : valueB - valueA;
    } else if (/%$/.test(valueA)) {
      valueA = Number(valueA.replace('%', ''));
      valueB = Number(valueB.replace('%', ''));
      return rule === 'asc' ? valueA - valueB : valueB - valueA;
    } else if (valueA instanceof Date) {
      return rule === 'asc' ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
    } else {
      return rule === 'asc'
        ? valueA.toString().localeCompare(valueB.toString())
        : valueB.toString().localeCompare(valueA.toString());
    }
  });
  return array;
}

export const ArrayEquals = (a, b) => {
  if (a === b) return true;
  if (!(a instanceof Array)) return false;
  if (!(b instanceof Array)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i !== a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export function parseWidth(width) {
  if (width !== undefined) {
    width = parseInt(width, 10);
    if (isNaN(width)) {
      width = null;
    }
  }
  return width;
}

export function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

export function debounce(delay, callback) {
  let timeoutID;

  return function wrapper() {
    const self = this;
    const args = arguments;

    function exec() {
      callback.apply(self, args);
    }

    clearTimeout(timeoutID);
    timeoutID = setTimeout(exec, delay);
  }
}

export function throttle(delay, callback) {
  let timeoutID;
  let lastExec = 0;

  return function wrapper() {
    const self = this;
    const elapsed = Number(new Date()) - lastExec;
    const args = arguments;

    function exec() {
      lastExec = Number(new Date());
      callback.apply(self, args);
    }

    clearTimeout(timeoutID);

    if (elapsed > delay) {
      exec();
    } else {
      timeoutID = setTimeout(exec, delay - elapsed);
    }
  }
}

export function hasClass(el, cls) {
  if (!el || !cls) return false;
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
}

export function addClass(el, cls) {
  if (!el) return;
  var curClass = el.className;
  var classes = (cls || '').split(' ');

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.add(clsName);
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

export function removeClass(el, cls) {
  if (!el || !cls) return;
  var classes = cls.split(' ');
  var curClass = ' ' + el.className + ' ';

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ');
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

const trim = function (string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};

function getPropByPath(obj, path, strict) {
  let tempObj = obj;
  path = path.replace(/\[(\w+)\]/g, '.$1');
  path = path.replace(/^\./, '');

  let keyArr = path.split('.');
  let i = 0;
  for (let len = keyArr.length; i < len - 1; ++i) {
    if (!tempObj && !strict) break;
    let key = keyArr[i];
    if (key in tempObj) {
      tempObj = tempObj[key];
    } else {
      if (strict) {
        throw new Error('please transfer a valid prop path to form item!');
      }
      break;
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj ? tempObj[keyArr[i]] : null
  };
}

function packValue(value) {
  if (typeof value === "undefined" || value === null) {
    return '';
  } else {
    return value + '';
  }
}

export function defaultRenderTdCellChild(h, { row, column, rowIndex, store }) {
  const prop = column.prop;
  let value = prop && getPropByPath(row, prop).v;
  value = packValue(value);
  if (column.type === 'select') {
    return (
      <check-box
        nativeOn-click={(event) => event.stopPropagation()}
        value={store.isSelected(row)}
        on-input={() => { store.commit('changeRowSelect', row); }} />
    )
  } else if (column.type === 'expand') {
    const classes = ['expand-icon'];
    if (store.states.expandRows.indexOf(row) > -1) {
      classes.push('expanded');
    }
    const clickExpand = function (e) {
      e.stopPropagation();
      store.commit('changeExpansion', row);
    };
    return (
      <div class={classes} on-click={clickExpand}>
        <i class='iconfont icon-arrow-right'></i>
      </div>
    );
  } else {
    // 格式化内容
    if (column && column.formatter) {
      value = column.formatter(row, column, value, rowIndex);
    }
    const maxLen = column.maxLength;
    if (maxLen > -1 && value.length > maxLen) {
      const showValue = value.substring(0, maxLen) + '...';
      return (
        <div title={value}>{showValue}</div>
      )
    } else {
      return value;
    }
  }
}

export function nestedIconRender(h, { row, nestedNode=undefined, store }) {
  if (!nestedNode) return null;
  const ele = [];
  const handleClick = function (e) {
    e.stopPropagation();
    store.handleClickNestedIcon(row);
  };
  if (nestedNode.indent) {
    ele.push(
      <span class="left-indent" style={{ 'padding-left': nestedNode.indent + 'px' }}></span>
    );
  }
  if (typeof nestedNode.expanded === 'boolean' && !nestedNode.noLazyChildren) {
    ele.push(
      <div class={['expand-icon', nestedNode.expanded ? 'expanded' : '', nestedNode.loading ? 'rotate' : '']} on-click={ handleClick }>
        <i class={['iconfont', nestedNode.loading ? 'icon-loading' : 'icon-arrow-right']} ></i>
      </div>
    );
  }
  return ele;
}

export const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

export function getValueByKey(row, rowKey) {
  if (typeof rowKey === 'string') {
    // rowKey为首层对象属性时
    if (rowKey.indexOf('.') === -1) {
      return row[rowKey];
    }
    // rowKey为多层对象属性时
    else {
      let key = rowKey.split('.');
      let result = row;
      for (let i = 0; i < key.length; i++) {
        result = result[key[i]];
      }
      return result;
    }
  } else if (typeof rowKey === 'function') {
    return rowKey.call(null, row);
  }
}

export const getKeysMap = function (array, rowKey) {
  const arrayMap = {};
  (array || []).forEach((row, index) => {
    arrayMap[getValueByKey(row, rowKey)] = { row, index };
  });
  return arrayMap;
};

export function checkTrueArray(arr) {
  return Array.isArray(arr) && arr.length
}

export function getCell(event) {
  let cell = event.target;

  while (cell && cell.tagName.toUpperCase() !== 'HTML') {
    if (cell.tagName.toUpperCase() === 'TD') {
      return cell;
    }
    cell = cell.parentNode;
  }

  return null;
}

export function getColumnById(table, columnId) {
  let column = null;
  table.columns.forEach(function (item) {
    if (item.id === columnId) {
      column = item;
    }
  });
  return column;
}

export function getColumnByCell(table, cell) {
  const matches = (cell.className || '').match(/table-box_[^\s]+/gm);
  if (matches) {
    return getColumnById(table, matches[0]);
  }
  return null;
}
