const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const jsonfile = require('jsonfile');
const cheerio = require('cheerio');
const { getPages, parseToAbsolute } = require('./utils');

/**
 * 将除了 js/css 其他依赖的文件拷贝的 outputDir 下面
 */
class CopyDependentFilePlugin {
  constructor(options) {
    this.publicPath = '';
    this.isFirst = true;
    this.appContext = null;
    this.isProd = false;
    this.isWatch = false;
    this.options = options;
    this.imageLimit = 200000;
    this.PageOrComponentDirectoryList = new Set();
    this.dependencyList = new Set(); // 存储依赖的文件，除 css/js
    this.imageOption = {}; // 存储图片转化的映射
  }

  apply(compiler) {
    const { context } = compiler.options;
    this.appContext = context;
    this.isProd = compiler.options.mode === 'production';
    this.isWatch = compiler.options.watch;
    this.publicPath = compiler.options.output.publicPath;

    if (this.isWatch) {
      chokidar
        .watch(this.options.input, {
          ignoreInitial: true,
        })
        .on('all', () => this.copyOtherFileToOutput());
    }

    compiler.hooks.done.tap('CopyDependentFilePlugin', () =>
      this.combineChunk()
    );
  }

  /**
   * 将 chunk 文件合并到 app.js 中
   */
  combineChunk() {
    // 只有首次才需要手动热更新其他资源
    if (this.isFirst) {
      this.copyOtherFileToOutput();
    }
    this.isFirst = false;
    const { output } = this.options;

    if (!fs.existsSync(path.resolve(output, 'chunk.js'))) return;

    const chunk = fs.readFileSync(path.resolve(output, 'chunk.js'));
    const app = fs.readFileSync(path.resolve(output, 'app.js'));
    fs.writeFileSync(path.resolve(output, 'app.js'), chunk + app);

    // 如果不是 --watch 打包，需要删除。热更新环境不能删除，因为需要热加载，下次还要使用
    if (!this.isWatch) {
      const chunk = path.resolve(output, 'chunk.js');
      if (fs.existsSync(chunk)) {
        fs.unlink(chunk, err => {
          if (err) throw err;
          console.log('chunk 文件已被删除');
        });
      }

      const chunkLicense = path.resolve(output, 'chunk.js.LICENSE.txt');
      if (fs.existsSync(chunkLicense)) {
        fs.unlink(chunkLicense, err => {
          if (err) throw err;
          console.log('chunk.js.LICENSE.txt 文件已被删除');
        });
      }
    }
  }

  /**
   * 将其他依赖的文件`.json/.html`拷贝到`output`中
   */
  copyOtherFileToOutput() {
    const { input, output, imageLimit } = this.options;
    this.imageLimit = imageLimit;

    const pages = getPages(this.appContext);
    pages.forEach(item =>
      this.parseDependencyList(
        input,
        path.join(input, item.split(/\/index$/)[0])
      )
    );
    this.dependencyList.add(path.join(input, 'app.json'));
    this.addAppJSONOtherSource(input);

    this.dependencyList.add(path.join(input, 'project.config.json'));

    // 拷贝 dependencyList 到 ${outputDir}
    this.dependencyList.forEach(item => {
      const file = item.replace(input, output);

      if (!fs.existsSync(file)) {
        mkdir(file);
      }

      if (
        this.isProd &&
        item.endsWith('wxml') &&
        Object.keys(this.imageOption).length
      ) {
        const regExp = new RegExp(Object.keys(this.imageOption).join('|'));
        const newTemplate = fs
          .readFileSync(item)
          .toString()
          .replace(regExp, str => this.imageOption[str].fileCDNPath);
        fs.writeFileSync(file, newTemplate);
      } else {
        fs.copyFileSync(item, file);
      }
    });
    console.log('编译其他资源成功！');
  }

  /**
   * 添加 app.json 里面依赖的其他资源
   */
  addAppJSONOtherSource(input) {
    const { tabBar } = this.getAppJSON(input);
    const directory = path.dirname(`${input}/app.json`);
    const { list } = tabBar || {};
    if (list && list.length) {
      list.forEach(item => {
        const { iconPath, selectedIconPath } = item;
        iconPath && this.dealImagePath(iconPath, input, directory);
        selectedIconPath &&
          this.dealImagePath(selectedIconPath, input, directory);
      });
    }
  }

  getAppJSON(input) {
    return require(`${input}/app.json`);
  }

  parseDependencyList(input, appPageDirectory) {
    if (!this.PageOrComponentDirectoryList.has(appPageDirectory)) {
      this.PageOrComponentDirectoryList.add(appPageDirectory); // 保存page

      // 解析这个page下面的依赖。json、ts、less、wxml
      this.parseJson(input, path.join(appPageDirectory, 'index.json'));

      // html include的页面和图片资源
      this.parseHTML(input, path.join(appPageDirectory, 'index.wxml'));
    }
  }

  /**
   * 解析 filename 下依赖的 components
   * @param input
   * @param filename 需要转义的文件路径
   */
  parseJson(input, filename) {
    this.dependencyList.add(filename);

    const { usingComponents } = jsonfile.readFileSync(filename); // json 文件
    if (!usingComponents) {
      return;
    }
    const directory = path.dirname(filename);
    Object.values(usingComponents).forEach(item => {
      if (/miniprogram/.test(item)) return;
      if (item.match(/\/index$/g)) {
        item = item.split('/index')[0];
      }
      const absolutePath = parseToAbsolute(item, this.appContext, directory);
      return this.parseDependencyList(input, absolutePath);
    });
  }

  /**
   * 解析html里面的模版/image依赖列表保存到dependencyList里面
   * @param input
   * @param filename
   */
  parseHTML(input, filename) {
    if (this.dependencyList.has(filename)) {
      return;
    }
    this.dependencyList.add(filename);
    const directory = path.dirname(filename);
    const source = fs.readFileSync(filename);
    const $ = cheerio.load(source, {
      xmlMode: true,
    });
    const that = this;
    // 解析模版
    $('import,include').each(function () {
      that.parseHTML(input, path.join(directory, this.attribs.src));
    });
    $('include').each(function () {
      that.parseHTML(input, path.join(directory, this.attribs.src));
    });
    $('image').each(function () {
      const { src } = this.attribs;
      that.dealImagePath(src, input, directory);
    });
  }

  dealImagePath(src, input, directory) {
    if (!src.match(/^{{.*}}$/) && !src.match(/^https?:\/{2}/)) {
      let imagePath;
      if (src.startsWith('/')) {
        imagePath = path.resolve(input, `.${src}`);
      } else if (src) {
        imagePath = path.resolve(directory, src);
      }

      const imageLimit = this.imageLimit;
      if (!imagePath) {
        // 防止没有src的情况
        return;
      }

      // prod 环境，且配置了 imageLimit 和 publicPath 的时候才会使用cdn地址
      if (
        this.isProd &&
        imageLimit &&
        this.publicPath &&
        imageLimit < fs.statSync(imagePath).size
      ) {
        // 需要替换成cdn地址
        this.imageOption[src] = {
          fileAbsolutePath: imagePath,
          fileCDNPath:
            this.publicPath + imagePath.replace(this.appContext + '/', ''),
          originPathStr: src,
        };
      } else {
        this.dependencyList.add(imagePath);
      }
    }
  }
}

module.exports = CopyDependentFilePlugin;

function mkdir(file) {
  const path = file.split('/');
  path.forEach((item, index) => {
    const isLast = index === path.length - 1;
    if (isLast) return;

    const nowPath = file
      .split('/')
      .slice(0, index + 1)
      .join('/');
    if (!nowPath) return;

    if (!fs.existsSync(nowPath)) {
      fs.mkdirSync(nowPath);
    }
  });
}
