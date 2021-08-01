/**
 * @description: webpack自定义插件，用于指定多个入口和打包非js css的文件
 */

const AddEntryPlugin = require('./add_entry_plugin');
const CopyDependentFilePlugin = require('./copy_dependent_file_plugin');
module.exports = {
  AddEntryPlugin,
  CopyDependentFilePlugin,
};
