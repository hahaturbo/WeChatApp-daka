// miniprogram/pages/cardrecord/cardrecord.js
import './index.wxss';

const awx = wx.toAsync("request")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    carddatas: [],
    user_info: '',
    cardend: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.GetCardData();
    wx.setNavigationBarTitle({
      title: "打卡记录"

    })
    wx.setNavigationBarColor({
      backgroundColor: this.$state.skin == 1 ? "#FFCC66" : "#ffffff",
      frontColor: '#000000'
    })
  },
  endjudge: function (item) {
    if (this.data.carddatas[item]) {
      if (this.data.carddatas[item].goal_type >= 3) {
        return 2;
      }
      let today = new Date().setHours(0, 0, 0, 0);
      let end = new Date(this.data.carddatas[item].ended_in);
      if (today > end && this.data.carddatas[item].goal_type == 1) {
        return 1;
      }
      return 0;
    }
  },
  async GetCardData(e) {
    let result = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/goal/get',
      data: {
        login_key: this.$state.login_key,
      },
    })
    this.setState({
      CardData: result.data.data.data
    })
    this.setData({
      carddatas: result.data.data.data
    })
    let cardend = [];
    for (let i = 0; i < this.$state.CardData.length; i++) {
      cardend[i] = this.endjudge(i)
    }
    console.log('cardend', cardend);
    this.setData({
      cardend: cardend
    })
  },
  async slideButtonTap(e) {
    let result = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/goal/delete',
      data: {
        login_key: this.$state.login_key,
        goal_id: e.detail.data[0],
        title: e.detail.data[1],
      },
    })
    if (result.errMsg === "request:fail ") {
      console.log(`delete fail ${result.errMsg}`)
      return
    }
    this.GetCardData()
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
