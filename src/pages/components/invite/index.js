// pages/invite/invite.js
import './index.wxss';

const awx = wx.toAsync("request");
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    invite_data: "",
    error_code: 502,
    goal_type: ["极简", "普通", "微信运动"],
  },

  async attached() {
    let timer = setInterval(async () => {
      if (!this.data.invite_data) {
        await this.GetInviteData();
      } else {
        clearInterval(timer);
      }
    }, 5000);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //受邀时获取信息
    async GetInviteData() {
      console.log(
        "id",
        this.$state.invite_goal_id,
        " login_key:",
        this.$state.login_key
      );
      if (this.$state.login_key == null) {
        console.log("无登陆无邀请");
        this.setData({
          error_code: 404,
        });
        return 404;
      }
      let result = await awx.request({
        method: "POST",
        url: this.$state.apiURL + "/user/group/get/data",
        data: {
          invite_id: this.$state.invite_goal_id,
          login_key: this.$state.login_key,
        },
      });
      if (result.errMsg === "request:fail ") {
        this.setData({
          error_code: 502,
        });
        return;
      }
      this.setData({
        invite_data: result.data,
        error_code: 200,
      });
      return Promise.resolve();
    },
  },
});
