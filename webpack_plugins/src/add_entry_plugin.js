const { difference } = require('lodash');
const { EntryPlugin } = require('webpack');
const { getPages, addDependencies } = require('./utils');

class AddEntryPlugin {
  constructor() {
    this.appContext = null;
    this.pages = [];
    this.entries = [];
  }

  apply(compiler) {
    const { context } = compiler.options;
    this.appContext = context;
    // hook entry
    compiler.hooks.entryOption.tap('AddEntryPlugin', () => {
      getPages(this.appContext).forEach(page =>
        addDependencies(context, page, this.entries, this.appContext)
      );
      this.applyEntry(this.entries, context, compiler);
    });

    // hook watch
    compiler.hooks.watchRun.tap('AddEntryPlugin', () => {
      const pages = getPages(this.appContext);
      const diffPages = difference(pages, this.pages);
      const { length } = diffPages;
      if (!length) return;

      this.pages = this.pages.concat(diffPages);
      const entries = [];
      diffPages.forEach(page =>
        addDependencies(context, page, entries, this.appContext)
      );
      const diffEntries = difference(entries, this.entries);
      this.applyEntry(diffEntries, context, compiler);
      this.entries = this.entries.concat(diffEntries);
    });
  }

  applyEntry(entries, context, compiler) {
    entries.forEach(entry =>
      new EntryPlugin(context, `${this.appContext}/${entry}.js`, entry).apply(
        compiler
      )
    );
  }
}

module.exports = AddEntryPlugin;
