const path = require('path');
const replaceExt = require('replace-ext');
const fs = require('fs');

/**
 * @description 获取所有需要打包的 pages
 * @param appContext {string} 应用路径
 */

function getPages(appContext) {
  const {
    pages: page = [],
    subpackages: subpackage = [],
  } = require(path.resolve(appContext, 'app.json'));
  const pages = [...page];
  const subpackages = [...subpackage];
  if (!pages.length) {
    console.error('Error in "app.json": no pages found');
    process.exit();
  }
  if (subpackages.length) {
    subpackages.forEach(item => {
      const { root, pages: subPages = [] } = item;
      if (!root) {
        console.error('Error in "app.json": subpackages root not found');
        process.exit();
      }
      if (!subPages.length) {
        console.error('Error in "app.json": subpackages no pages found');
        process.exit();
      }
      subPages.forEach(item => pages.push(`${root}/${item}`));
    });
  }
  return pages;
  // ['pages/xxx/xxx'，'xxpackage/xxx/xxx']
}

/**
 * @description 将 file 的路径转成绝对路径
 * @param filePath
 * @param appContext
 * @param context
 * @return {string}
 */
function parseToAbsolute(filePath, appContext, context) {
  const isAbsolute = filePath[0] === '/'; // src = appContext 下
  const isRelative = filePath[0] === '.'; // 当前文件
  let absolutePath = '';
  if (isAbsolute) {
    absolutePath = path.resolve(appContext, filePath.slice(1));
  } else if (isRelative) {
    absolutePath = path.resolve(context, filePath);
  } else {
    // 使用 webpack alias todo
    absolutePath = path.resolve(context, filePath);
  }
  return absolutePath;
}

/**
 * @description 以page 为起始点递归寻找使用的组件
 * @param {String} context 当前文件的上下文路径
 * @param {String} page 依赖路径
 * @param {Array<string>} entries 包含全部入口的数组
 * @param {string} appContext
 */
function addDependencies(context, page, entries, appContext) {
  const absolutePath = parseToAbsolute(page, appContext, context);

  const relativePath = path.relative(appContext, absolutePath);
  const jsPath = replaceExt(absolutePath, '.js');
  const tsPath = replaceExt(absolutePath, '.ts');
  const isQualification = fs.existsSync(jsPath) || fs.existsSync(tsPath);
  if (!isQualification) {
    console.error(`ERROR: in "${relativePath}": 当前文件缺失`);
    process.exit();
  }

  const isExistEntry = entries.includes(entry => entry === absolutePath);
  if (!isExistEntry) {
    entries.push(relativePath);
  }

  const jsonPath = replaceExt(absolutePath, '.json');
  const isJsonExistence = fs.existsSync(jsonPath);
  if (!isJsonExistence) {
    console.error(
      `ERROR: in "${replaceExt(relativePath, '.json')}": 当前文件缺失`
    );
    process.exit();
  }

  try {
    const content = fs.readFileSync(jsonPath, 'utf8');
    const { usingComponents = {} } = JSON.parse(content);
    const components = Object.values(usingComponents);
    const { length } = components;
    if (length) {
      const absoluteDir = path.dirname(absolutePath);
      components.forEach(
        component =>
          !/miniprogram/.test(component) &&
          addDependencies(absoluteDir, component, entries, appContext)
      );
    }
  } catch (e) {
    console.error(
      `ERROR: in "${replaceExt(
        relativePath,
        '.json'
      )}": 当前文件内容为空或书写不正确`
    );
    process.exit();
  }
}

module.exports = {
  getPages,
  parseToAbsolute,
  addDependencies,
};
