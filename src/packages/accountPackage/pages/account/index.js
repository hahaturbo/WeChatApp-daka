// miniprogram/pages/setting/account/account.js
import './index.wxss';

const awx = wx.toAsync("request", "login", "getWeRunData", "getUserInfo")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_info: "",
    btn_type: "",
    //弹窗数据
    dialogTitle: '确认执行?该操作不可逆！',
    dialogText: '该操作不可逆',
    dialogShow: false,
    dialogsButton: [{
      text: '取消'
    }, {
      text: '确定'
    }],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.GetUserInfo();
    wx.setNavigationBarTitle({
      title: "账户管理"

    })
    wx.setNavigationBarColor({
      backgroundColor: "#ffffff",
      frontColor: '#000000'
    })

  },

  async GetUserInfo() {
    let result = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/info',
      data: {
        login_key: this.$state.login_key,
      },
    })
    if (result.errMsg === "request:fail ") {
      console.log(result.errMsg)
      return
    }
    this.setData({
      user_info: result.data.data,
    })
    return Promise.resolve()
  },
  tapDialogButton: function (e) {
    if (e.detail.item.text == "确认") {
      if (this.data.btn_type == "logoff") {
        this.btn_logoff();
      } else {
        this.btn_clean();
      }
    } else {}
    this.setData({
      dialogShow: false,
    })

  },

  btn: function (e) {
    if (e.currentTarget.dataset.tap == 'btn_logoff') {
      this.setData({
        btn_type: "logoff",
        dialogTitle: "确认注销账户?操作不可逆！",
        dialogsButton: [{
          text: '确认',
          extClass: "btn_go_on"
        }, {
          text: '取消',
          extClass: "btn_cancel"
        }],
        dialogShow: true,
      })

    } else {
      this.setData({
        btn_type: "clean",
        dialogTitle: "确认清除记录？",
        dialogsButton: [{
          text: '确认',
          extClass: "btn_go_on"
        }, {
          text: '取消',
          extClass: "btn_cancel"
        }],
        dialogShow: true,
      })
    }
  },

  async btn_clean(e) {
    let result = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/clean',
      data: {
        login_key: this.$state.login_key,
      },
    })
    if (result.errMsg === "request:fail ") {
      console.error(result.errMsg)
      return
    }
    await this.GetUserInfo()
    return Promise.resolve()
  },

  async btn_logoff(e) {
    let result = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/logoff',
      data: {
        login_key: this.$state.login_key,
      },
    })
    if (result.errMsg === "request:fail ") {
      console.error(result.errMsg)
      return
    }
    await this.GetUserInfo()
    return Promise.resolve()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }




})
