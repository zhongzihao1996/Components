const fs = require('fs');
const path = require('path');

/**
 * 判断路径是否含有index.ts
 * @param {String} dir 
 */
function hasIndexJs(dir) {
  let dirs = [];
  try {
    dirs = fs.readdirSync(dir);
  } catch (e) {
    dirs = null;
  }
  return dirs && dirs.includes('index.ts');
}

/**
 * 获取指定入口下包含index.js的文件夹的路径
 * @param {String} entryDir 
 */
const getEntry = function (entryDir) {
  const result = {
    index: entryDir
  };
  // eslint-disable-next-line no-unused-vars
  let dirs = fs.readdirSync(entryDir);
  dirs = dirs.filter(dir => {
    return hasIndexJs(path.resolve(entryDir, dir));
  }).forEach(dir => {
    result[dir] = path.resolve(entryDir, dir);
  });
  return result;
}

module.exports = getEntry;
