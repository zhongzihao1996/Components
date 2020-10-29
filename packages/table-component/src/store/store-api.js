import Store from './index';

export function createStore(vueInstance, initialState = {}) {
  const store = new Store();
  store.table = vueInstance; // 保存vue实例，用于mutation中使用
  Object.keys(initialState).forEach(key => {
    store.states[key] = initialState[key];
  });
  return store;
}

export function mapStates(vue, mapper) {
  const res = {};
  Object.keys(mapper).forEach(key => {
    const value = mapper[key];
    let fn;
    if (typeof value === 'string') {
      fn = function() {
        return vue.store.states[value];
      };
    } else if (typeof value === 'function') {
      fn = function() {
        return value.call(vue, vue.store.states);
      };
    } else {
      console.error('invalid value type');
    }
    if (fn) {
      res[key] = fn;
    }
  });
  return res;
}
