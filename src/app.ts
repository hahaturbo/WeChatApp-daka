//app.js
import 'utils/store.js';
import { toAsync } from './utils/request.js';
import './app.less';
App({
  onLaunch: function () {
    wx.toAsync = toAsync;
    this.globalData = {};
  },
});
