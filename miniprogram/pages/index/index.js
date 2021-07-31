//index.js
// data-to:0=主页面 1=新建页面 2=设置页面 3=目标页面 4=打卡详情页面 5=接受邀请页面 6=修改打卡页面

const app = getApp();
const awx = wx.toAsync('request', 'login', 'getWeRunData', 'getUserInfo');
Page({
  data: {
    //主页面数据
    error_code: '(。・∀・)ノ',
    nowPage: 0,
    changedPageCounts: 0,
    //新建打卡数据：邀请次数，不重复post
    //弹窗数据
    dialogTitle: '',
    dialogText: '',
    dialogShow: false,
    dialogsButton: [
      {
        text: '取消',
      },
      {
        text: '确定',
      },
    ],
    ifFirstTime: false, //是否第一次登陆（缓存）
    //新建打卡页面数据
    carditem: '',
    card_index: '',
    isScrollToTop: false,
  },

  async onLoad(options) {
    try {
      let skin = wx.getStorageSync('skin');
      let card_num = wx.getStorageSync('card_num');
      let IFT = wx.getStorageSync('IFT');
      if (IFT == null) {
        IFT = true;
      }
      this.setState({
        card_num: card_num,
      });
      if (skin) {
        this.setState({
          skin: skin,
        });
        this.setData({
          ifFirstTime: IFT,
        });
        this.ShowSkin();
      }
    } catch (e) {
      this.setState({
        skin: 0,
      });
    }
    let invite_goal_id = options.id;
    if (invite_goal_id) {
      this.setData({
        nowPage: 5,
      });
      this.setState({
        invite_goal_id: invite_goal_id,
      });
    } else {
      console.warn('not invite_goal_id');
    }
    await this.AutoCheckP(); //自动登陆授权
  },
  async onShow() {
    if (this.$state.isLogin) {
      await this.GetCardData();
    }
    this.ShowSkin();
    return Promise.resolve();
  },

  ShowSkin: function () {
    switch (this.$state.skin) {
      case '1':
      case 1:
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#FFCC66',
        });
        break;
      case '2':
      case 2:
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#ffffff',
        });
        break;
      default:
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#FFCC66',
        });
        break;
    }
  },

  //分享
  // e.target.dataset.index为传过来的下标（第几个打卡）
  onShareAppMessage: function (e) {
    console.info(JSON.stringify(e,null,2));
    const { nickname, inviteid } = e.target.dataset;
    console.info(nickname,inviteid);
    return {
      title: (nickname ? nickname : '') + '邀请您一起和TA打卡',
      desc: '分享页面的内容',
      path: 'pages/index/index?id=' + inviteid,
      // 路径，传递参数到指定页面。
    };
  },

  async AcceptInvite(e) {
    if (this.$state.card_num >= 5) {
      wx.showToast({
        icon: 'none',
        title: '不允许超过五个打卡哦',
      });
      this.changePage(e);
    }
    let result = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/group/join',
      data: {
        invite_id: this.$state.invite_goal_id,
        login_key: this.$state.login_key,
      },
    });
    if (result) {
      this.setState({
        card_num: this.$state.card_num + 1,
      });
      await wx.setStorage({
        key: 'card_num',
        data: this.$state.card_num,
      });
      wx.showLoading({
        title: '加载中',
      });
      await this.GetCardData();
      wx.hideLoading();
      wx.showToast({
        title: '成功加入',
        icon: 'success',
        duration: 1500,
      });
      this.changePage(e);
    }
  },

  async getindex(show) {
    let cardindex = [];
    let res = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/goal/get',
      data: {
        login_key: this.$state.login_key,
      },
    });
    this.setState({
      CardData: res.data.data.data,
    });
    for (let i = 0; i < show.length; i++) {
      for (let j = 0; j < this.$state.CardData.length; j++) {
        if (show[i].goal_id == this.$state.CardData[j].goal_id) {
          cardindex.push(j);
          break;
        }
      }
    }
    this.setData({
      card_index: cardindex,
    });
    return Promise.resolve();
  },
  //获取打卡信息
  async GetCardData() {
    let result = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/goal/Bget',
      data: {
        amount: 5,
        login_key: this.$state.login_key,
      },
    });
    this.ClearNewAimData();
    this.setState({
      aimCardDatas: result.data.data.data,
      card_num: result.data.data.data.length,
    });
    await this.getindex(this.$state.aimCardDatas);
    await wx.setStorage({
      key: 'card_num',
      data: this.$state.card_num,
    });
    return Promise.resolve();
  },

  //申请微信运动授权
  async NeedWerun() {
    let authorize = await wx.authorize({
      scope: 'scope.werun',
    });
    if (authorize) {
      console.log('WeRun authorize success');
    } else {
      console.log('WeRun authorize failure');
      wx.showToast({
        icon: 'none',
        title: '不要拒绝人家微信运动授权嘛qwq',
        duration: 2500,
      });
      let modal = await wx.showModal({
        title: '温馨提示',
        content: '您需要授权后，才能使用微信运动打卡功能，是否重新授权？',
        confirmColor: '#ff2d4a',
      });
      if (modal.confirm) {
        let opensetting = await wx.openSetting();
        if (opensetting['scope.werun'] === true) {
          await this.GetWeRunData();
        } else {
          console.log('user refuse werun authorize again');
          wx.showToast({
            icon: 'none',
            title: '您终究还是拒绝微信运动授权',
            duration: 2500,
          });
        }
      } else if (modal.cancel) {
        wx.showToast({
          icon: 'none',
          title: '您还是拒绝微信运动授权',
          duration: 1500,
        });
      }
    }
    return Promise.resolve();
  },
  //微信运动
  async GetWeRunData() {
    let setting = await wx.getSetting();
    if (!setting.authSetting['scope.werun']) {
      let runAuth = await wx.showModal({
        title: '[极简打卡]请求获取您的微信步数',
        content: '拒绝了无法完成自动打卡，是否同意微信运动授权',
      });
      if (runAuth.cancel) {
        await wx.showToast({
          title: '运动打卡（自动打卡）将无法使用',
          icon: 'none',
          duration: 2000,
        });
        return;
      }
    }
    let authorize = await wx
      .authorize({
        scope: 'scope.werun',
      })
      .catch((err) => {
        console.error(err);
      });
    if (authorize) {
      console.log('WeRun authorize success');
      if (!this.$state.login_key) {
        console.log('no key');
        return;
      }
      let wWeRun = await awx.getWeRunData();
      if (wWeRun.encryptedData) {
        // 微信获取运动成功
        let weRunData = await awx.request({
          method: 'POST',
          url: this.$state.apiURL + '/user/getWeRunData',
          data: {
            encryptedData: wWeRun.encryptedData,
            iv: wWeRun.iv,
            login_key: this.$state.login_key,
          },
        });
        this.setState({
          stepInfoList: weRunData.data.stepInfoList,
        });
      } else {
        wx.showToast({
          icon: 'none',
          title: '微信运动步数获取失败',
          duration: 1500,
        });
      }
    } else {
      console.log('user refuse werun authorize');
      this.NeedWerun();
    }
    return Promise.resolve();
  },

  btn_nologin: function (e) {
    this.setState({
      isTry: true,
    });
  },
  ToLogin: function (e) {
    this.setState({
      isTry: false,
    });
  },
  //自动登陆
  async AutoCheckP() {
    if (this.data.ifFirstTime != true) {
      this.checkPermission();
    } else {
      console.log('waiting user bindtap login');
    }
    return Promise.resolve();
  },

  //手动登陆
  async BtnCheckP() {
    console.log('user bindtap login');
    let userInfo = await wx.getUserProfile({
      desc: '只用于昵称头像展示',
    });
    if (userInfo.errMsg != 'getUserProfile:ok') {
      console.log('user refuse userInfo authorize');
      wx.showToast({
        icon: 'none',
        title: '请您允许授权',
        duration: 2500,
      });
      this.setData({
        error_code: userInfo.errMsg,
      });
      return;
    }
    this.checkPermission(userInfo);
    return Promise.resolve();
  },
  //总登陆
  async checkPermission(userInfo = null) {
    let storagekey = await wx
      .getStorage({
        key: 'login_key',
      })
      .catch((err) => {
        console.error(err);
      });
    let check = await wx.checkSession().catch((err) => {
      console.error(err);
    });
    if (!userInfo || !storagekey || storagekey.data == null || (check && check.errMsg != 'checkSession:ok')) {
      // first login || wx.checkSession fail || nologinkey
      // wx.login setStorage(loginkey) request user / login
      console.log('login');
      let wxLogin = await awx.login();
      if (!wxLogin.hasOwnProperty('code')) {
        console.log('wx.login failure');
        return;
      }
      console.log(wxLogin);
      let result = await awx.request({
        method: 'POST',
        url: this.$state.apiURL + '/user/login',
        data: {
          encryptedData: userInfo ? userInfo.encryptedData : null,
          iv: userInfo ? userInfo.iv : null,
          code: wxLogin.code,
        },
      });
      if (result.errMsg === 'request:fail ') {
        this.setData({
          error_code: result.errMsg,
        });
        return;
      } else if (!result.hasOwnProperty('data')) {
        this.setData({
          error_code: '请重试,code:2',
        });
        return;
      } else if (result.data.status !== 'success') {
        this.setData({
          error_code: result.data.code,
        });
        return;
      }
      this.setState({
        isLogin: true,
        login_key: result.data.data['login_key'],
      });
      await wx.setStorage({
        key: 'login_key',
        data: result.data.data['login_key'],
      });
      await wx.setStorage({
        key: 'IFT',
        data: false,
      });
    } else {
      this.setState({
        isLogin: true,
        login_key: storagekey.data,
      });
    }
    if (!this.$state.login_key) {
      return;
    }
    // user/info
    let info = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/info',
      data: {
        login_key: this.$state.login_key,
      },
    });
    let DATE = new Date();
    let DATESU = new Date(info.data.data.signed_up.replace(/-/g, '/'));
    DATE = parseInt((DATE - DATESU) / (24 * 60 * 60 * 1000));
    if (DATE == null) {
      DATE = 0;
    }
    this.setState({
      signed_up: info.data.data.signed_up,
      using_day: DATE,
    });
    await Promise.all([this.GetCardData(), this.GetWeRunData()]);
    return Promise.resolve();
  },

  changePage: function (e) {
    // 把 当前页面 设为 按钮中设置的数据的 页面
    //data-to是自定义的
    // console.log(changedPageCounts);
    this.setData({
      changedPageCounts: this.data.changedPageCounts + 1,
      nowPage: e.currentTarget.dataset.to,
      isScrollToTop: false,
    });
  },
  // 打卡详情返回
  async DetailEnd(e) {
    await this.GetCardData();
    this.changePage(e);
    return Promise.resolve();
  },

  changeNewAimPage: function (e) {
    console.log(this.$state.card_num);
    if (this.$state.card_num >= 5) {
      wx.showToast({
        icon: 'none',
        title: '不能创建超过五个打卡哦|･ω･｀)',
        duration: 2500,
      });
    } else {
      this.changePage(e);
    }
  },

  modifycard: function (e) {
    if (e.currentTarget.dataset.to == 4) {
      this.selectComponent('#modifycard').modify();
      this.setData({
        changedPageCounts: this.data.changedPageCounts + 1,
        nowPage: e.currentTarget.dataset.to,
      });
    }
  },
  ClearNewAimData: function () {
    //清理全局变量impoant！
    if (!this.$state.can_share) {
      this.setState({
        aimCardData: [],
      });
    }
    this.setData({
      team: 0,
      type: 1,
      title: null,
      date_start: '请选择',
      date_end: '请先选择开始日期',

      frequencytype: 0,
      frequencytype2: 0,
      frequency: [0, 0, 0, 0],
      frequencynum: 1,
      frequencyout: '每天',

      time_aim1: '请选择',
      time_aim2: '请选择',
      time_call: '请选择',
      normal_card_display: 0,
    });
  },
  //弹窗
  async changePage_Finish(e) {
    console.info(this.$state.aimCardData);
    if (
      this.$state.aimCardData['title'] != null &&
      ((this.$state.aimCardData['goal_type'] != 1 && this.$state.aimCardData['goal_type'] != null) ||
        (this.$state.aimCardData['end_time'] != null && this.$state.aimCardData['needed_be_signed_deadline'] != null))
    ) {
      if (this.$state.can_share == false) {
        await this.PostCardData();
      } else {
        this.setState({
          can_share: false,
        });
      }
      await this.GetCardData();
      this.changePage(e);
    } else {
      this.setData({
        dialogTitle: '打卡信息未填完哦~',
        dialogsButton: [
          {
            text: '继续填写',
            extClass: 'btn_go_on',
          },
          {
            text: '取消',
            extClass: 'btn_cancel',
          },
        ],
        dialogShow: true,
      });
    }
    return Promise.resolve();
  },

  async ChangePageGetBoard(e) {
    await this.GetBoard();
    this.changePage(e);
    return Promise.resolve();
  },

  async ChangePagePostBoard(e) {
    if (this.data.nowPage != 3) {
      this.changePage(e);
      return;
    }
    let result = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/board/change',
      data: {
        login_key: this.$state.login_key,
        data: this.$state.goalsBoardData,
      },
    });
    console.log(`上传目标板成功${JSON.stringify(result.data, null, 2)}`);
    this.changePage(e);
    return Promise.resolve();
  },

  async PostCardData() {
    let goal_type, team, num, reminder_at;
    !this.$state.aimCardData['goal_type']
      ? (goal_type = 1)
      : (goal_type = parseInt(this.$state.aimCardData['goal_type']));
    !this.$state.aimCardData['team'] ? (team = 0) : (team = this.$state.aimCardData['team']);
    !this.$state.aimCardData['reminder_at']
      ? (reminder_at = 0)
      : (reminder_at = this.$state.aimCardData['reminder_at']);
    let result;
    if (goal_type == 1) {
      // 普通打卡提交
      if (!this.$state.aimCardData['frequency']) {
        f = [0, 0, 0, 0];
        num = 1;
      } else {
        f = this.$state.aimCardData['frequency'];
        num = this.$state.aimCardData['frequencynum'];
      }
      let fre;
      if (f[2] == 2) {
        fre = f[3] + '|' + 1;
      } else {
        fre = f[3] + '|' + 0;
      }
      result = await awx.request({
        method: 'POST',
        url: this.$state.apiURL + '/user/goal/add',
        data: {
          goal_name: this.$state.aimCardData['title'],
          goal_type: 1,
          started_at: this.$state.aimCardData['start_time'],
          ended_in: this.$state.aimCardData['end_time'],
          frequency: num,
          frequency_type: fre,
          goal_is_a_group: team,
          reminder_at: reminder_at,
          needed_be_signed_at: this.$state.aimCardData['needed_be_signed_at'],
          needed_be_signed_deadline: this.$state.aimCardData['needed_be_signed_deadline'],
          signed_type: 1,
          signed_day: 0,
          login_key: this.$state.login_key,
        },
      });
    } else if (goal_type == 2) {
      result = await awx.request({
        method: 'POST',
        url: this.$state.apiURL + '/user/goal/add',
        data: {
          goal_name: `每天走${this.$state.aimCardData['title']}步`,
          goal_type: goal_type, //2
          goal_is_a_group: team,
          frequency: this.$state.aimCardData['title'],
          login_key: this.$state.login_key,
        },
      });
    } else {
      result = await awx.request({
        method: 'POST',
        url: this.$state.apiURL + '/user/goal/add',
        data: {
          goal_name: this.$state.aimCardData['title'],
          goal_type: goal_type,
          goal_is_a_group: team,
          login_key: this.$state.login_key,
        },
      });
    }
    if (result.errMsg === 'request:fail ') {
      this.setData({
        error_code: '/user/goal/add' + result.errMsg,
      });
      return;
    }
    this.setState({
      card_num: this.$state.card_num + 1,
    });
    wx.setStorageSync('card_num', this.$state.card_num);

    // 提交目标板
    let data = {
      id: this.$state.board_num + 1,
      icon: 2,
      name: goal_type == 2 ? `每天走${this.$state.aimCardData['title']}步` : this.$state.aimCardData['title'],
    };
    let boardResult = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/board/add',
      data: {
        login_key: this.$state.login_key,
        goal: data,
      },
    });
    if (boardResult.errMsg === 'request:fail ') {
      this.setData({
        error_code: '/user/board/add' + result.errMsg,
      });
      return;
    }
    this.setState({
      board_num: this.$state.board_num + 1,
    });
    console.log('board up success');
    this.setState({
      aimCardData: [],
    });
    this.ClearNewAimData();
    return Promise.resolve();
  },
  async GetBoard() {
    // 获取目标板
    let result = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/board/get',
      data: {
        login_key: this.$state.login_key,
      },
    });
    this.setState({
      goalsBoardData: result.data.data,
    });
    return Promise.resolve();
  },

  async sign_btn(e) {
    let index = e.currentTarget.dataset.index;
    if (this.$state.aimCardDatas[index].signed_day) {
      console.log(`signed`);
      return;
    } else if (this.$state.aimCardDatas[index].goal_type == 2) {
      if (
        parseInt(this.$state.aimCardDatas[index].frequency) >
        parseInt(this.$state.stepInfoList[this.$state.stepInfoList.length - 1].step)
      ) {
        wx.showToast({
          title: '您的步数不够',
          icon: 'none',
          duration: 2500,
        });
        return;
      }
    }
    let goal_id = e.currentTarget.dataset.id;
    let result = await awx.request({
      method: 'POST',
      url: this.$state.apiURL + '/user/goal/sign',
      data: {
        goal_id: goal_id,
        login_key: this.$state.login_key,
      },
    });
    console.log(`sign post ${JSON.stringify(result.data, null, 2)}`);
    await this.GetCardData();
    return Promise.resolve();
  },

  changePage_Back: function (e) {
    if (e.currentTarget.dataset.to == 0) {
      this.setData({
        dialogTitle: '打卡未保存，确认退出？',
        dialogsButton: [
          {
            text: '退出编辑',
            extClass: 'btn_go_on',
          },
          {
            text: '取消',
            extClass: 'btn_cancel',
          },
        ],
        dialogShow: true,
      });
    } else if (e.currentTarget.dataset.to == 4) {
      this.setData({
        dialogTitle: '修改未保存，确认退出？',
        dialogsButton: [
          {
            text: '退出修改',
            extClass: 'btn_go_on',
          },
          {
            text: '取消',
            extClass: 'btn_cancel',
          },
        ],
        dialogShow: true,
      });
    }
  },

  tapDialogButton: function (e) {
    if (e.detail.item.text == '退出编辑') {
      this.ClearNewAimData();
      this.setData({
        changedPageCounts: this.data.changedPageCounts + 1,
        nowPage: 0,
        dialogShow: false,
      });
    } else if (e.detail.item.text === '退出修改') {
      this.setData({
        changedPageCounts: this.data.changedPageCounts + 1,
        nowPage: 4,
        dialogShow: false,
      });
    } else {
      this.setData({
        dialogShow: false,
      });
    }
  },
  // 跳转打卡详情页面
  gotodetails: function (e) {
    this.setData({
      nowPage: 4,
      carditem: this.data.card_index[e.currentTarget.dataset.to],
    });
  },
  async getsondelete(e) {
    console.log('getsondelete');
    let page;
    if (e.detail === 'delete') {
      page = 0;
    } else if (e.detail === 'modify') {
      page = 4;
    }
    this.setData({
      nowPage: page,
      changedPageCounts: this.data.changedPageCounts + 1,
    });
    await this.GetCardData();
    return Promise.resolve();
  },
  scrollToTop() {
    console.log('accept toTop');
    this.setData({
      isScrollToTop: true,
    });
  },
});
