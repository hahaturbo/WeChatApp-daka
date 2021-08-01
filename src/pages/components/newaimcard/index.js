// pages/newaimcard/newaimcard.js
import './index.wxss';

const awx = wx.toAsync('request', 'login', 'getWeRunData', 'getUserInfo');
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    //弹窗
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
    share_text: ['(新建打卡后可邀请)', '新建打卡'],
    //新建打卡页面数据
    team: 0,
    type_array: ['极简', '普通', '微信运动'],
    type: 1,
    title: '',
    date_start: '请选择',
    date_end: '请先选择开始日期',

    frequencytype: 0,
    frequencytype2: 0, //0天1月目前都没用
    frequency: [0, 0, 0, 0],
    frequencynum: 1,
    frequencyout: '每天',
    // frequencyArray: [['普通','自定义'],['每天','每周','每月']],
    frequencyArray: [
      ['每'],
      [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        31,
      ],
      ['天', '周', '月'],
      ['任意一天', '仅当天'],
    ],
    // freinputValue: "",
    time_aim1: '请选择',
    time_aim2: '请选择',
    time_call: '请选择',
    fre_diy_display: 'none',
    reminder_Array: ['打卡时', '提前5分钟', '提前10分钟', '提前15分钟', '提前30分钟', '提前一小时'],
    reminder: 0,
    reminder_num: [0, 5, 10, 15, 30, 60],
    invite_id: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    ClearNewAimData: function () {
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
        reminder: 0,
      });
    },

    onLoad: function (options) {},

    bindPickerTypeChange: function (e) {
      if (e.detail.value == 0) {
        this.setData({
          type: e.detail.value,
        });
      } else {
        this.setData({
          type: e.detail.value,
        });
      }
    },

    //select
    click_single_btn: function (e) {
      let data = this.$state.aimCardData;
      if (this.data.team != 0) {
        data['team'] = 0;
        this.setData({
          team: '0',
        });
        this.setState({
          aimCardData: data,
        });
      } else {
      }
    },
    click_team_btn: function (e) {
      let data = this.$state.aimCardData;
      if (this.data.team != 1) {
        data['team'] = 1;
        this.setData({
          team: '1',
        });
        this.setState({
          aimCardData: data,
        });
      } else {
      }
    },
    //标题输入
    async valueChanged(e) {
      switch (e.target.dataset.name) {
        case 'goal_type':
          if (e.detail.value != 2) {
            this.setData({
              type: e.detail.value,
            });
          } else {
            let setting = await wx.getSetting();
            if (!setting.authSetting['scope.werun']) {
              let runAuth = await wx.showModal({
                title: '[极简打卡]请求获取您的运动权限',
                content: '拒绝了无法完成使用运动打卡，是否同意微信运动授权',
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
              .catch(async (err) => {
                console.error(err);
                let opensetting = await wx.openSetting();
                if (opensetting['scope.werun'] !== true) {
                  return;
                }
              });
            if (authorize) {
              console.log('WeRun authorize success');
            } else {
              return;
            }
            this.setData({
              type: e.detail.value,
            });
          }
          break;
        case 'start_time':
          let start_date_temp = new Date(e.detail.value);
          let now_date_temp = new Date().getTime(); //获取时间戳
          let now_time = new Date().getHours() * 3600 + new Date().getMinutes() * 60; //当日时间
          now_time *= 1000;
          if (now_date_temp - now_time > start_date_temp) {
          } else {
            this.setData({
              date_start: e.detail.value,
              date_end: '请选择',
            });
          }
          break;
        case 'end_time':
          if (this.data.date_start !== '请选择') {
            //  在已选开始日期条件下，不早于开始日期
            let start_date_temp = new Date(this.data.date_start);
            let end_date_temp = new Date(e.detail.value).setHours(0, 0, 0, 0);
            let now_date_temp = new Date().setHours(0, 0, 0, 0);
            if (start_date_temp > end_date_temp) return;
            if (end_date_temp < now_date_temp) return;
            this.setData({
              date_end: e.detail.value,
            });
          }
          break;
        case 'frequency':
          var f = e.detail.value;
          let d = 1;
          switch (f[2]) {
            case 0:
              d = 1 * f[1] + 1;
              break;
            case 1:
              d = 7 * f[1] + 7;
              break;
            case 2:
              d = 1 * f[1] + 1;
              break;
            default:
              console.log('error-34');
          }

          let data = this.$state.aimCardData;
          data['frequencynum'] = d;
          data['frequency'] = f;

          this.setState({
            aimCardData: data,
          });
          this.setData({
            frequency: f,
            frequencynum: d,
            frequencyout:
              this.data.frequencyArray[0][0] +
              this.data.frequencyArray[1][f[1]] +
              this.data.frequencyArray[2][f[2]] +
              this.data.frequencyArray[3][f[3]],
          });
          break;
        case 'needed_be_signed_at':
          this.setData({
            time_aim1: e.detail.value,
          });
          break;
        case 'needed_be_signed_deadline':
          if (this.data.time_aim1 == '请选择') return;
          let startTotalMinutes =
            parseInt(this.data.time_aim1.split(':')[0]) * 60 + parseInt(this.data.time_aim1.split(':')[1]);
          let endTotalMinutes = parseInt(e.detail.value.split(':')[0]) * 60 + parseInt(e.detail.value.split(':')[1]);
          if (endTotalMinutes <= startTotalMinutes) {
            return;
          } else {
            this.setData({
              time_aim2: e.detail.value,
            });
          }
          break;
        case 'reminder_at':
          this.setData({
            reminder: e.detail.value,
          });
          let data2 = this.$state.aimCardData;
          data2['reminder_at'] = this.data.reminder_num[e.detail.value];
          this.setState({
            aimCardData: data2,
          });
          break;
        default:
          break;
      }
      if (e.target.dataset.name != 'frequency' && e.target.dataset.name != 'reminder_at') {
        let data_name = e.target.dataset.name;
        let data = this.$state.aimCardData;
        if (e.target.dataset.name == 'title' && this.data.type == 2) {
          // 微信步数
          data[data_name] = '每天走' + e.detail.value + '步';
        } else {
          data[data_name] = e.detail.value;
        }

        this.setState({
          aimCardData: data,
        });
      }
      return Promise.resolve();
    },
    TitleInput: function (e) {
      if (e.detail.value) {
        this.setData({
          title: e.detail.value,
        });
        let data = this.$state.aimCardData;
        data['title'] = e.detail.value;
        this.setState({
          aimCardData: data,
        });
      }
    },
    //打卡频率
    bindPickerFrequencyChange: function (e) {
      var f;
      let d = 1;
      f = e.detail.value;
      switch (f[2]) {
        case 0:
          d = 1 * f[1] + 1;
          break;
        case 1:
          d = 7 * f[1] + 7;
          break;
        case 2:
          d = 1 * f[1] + 1;
          break;
        default:
          console.log('error-34');
      }

      this.setData({
        frequency: f,
        frequencynum: d,
        frequencyout:
          this.data.frequencyArray[0][0] +
          this.data.frequencyArray[1][f[1]] +
          this.data.frequencyArray[2][f[2]] +
          this.data.frequencyArray[3][f[3]],
      });
    },
    bindMultiPickerColumnChange: function (e) {},

    // 日期选择器
    bindDatestartChange: function (e) {
      let start_date_temp = new Date(e.detail.value);
      let now_date_temp = new Date().getTime(); //获取时间戳
      let now_time = new Date().getHours() * 3600 + new Date().getMinutes() * 60; //当日时间
      now_time *= 1000;
      if (now_date_temp - now_time > start_date_temp) {
      } else {
        this.setData({
          date_start: e.detail.value,
        });
      }
    },
    bindDateendChange: function (e) {
      if (this.data.date_start !== '请选择') {
        //  在已选开始日期条件下，不早于开始日期
        let start_date_temp = new Date(this.data.date_start);
        let end_date_temp = new Date(e.detail.value);
        let now_date_temp = new Date().getTime();

        if (start_date_temp > end_date_temp) return;
        if (end_date_temp < now_date_temp) return;
        this.setData({
          date_end: e.detail.value,
        });
      }
    },
    bindTimeAim1Change: function (e) {
      this.setData({
        time_aim1: e.detail.value,
      });
    },

    bindTimeAim2Change: function (e) {
      if (this.data.time_aim1 == '请选择') return;
      let startTotalMinutes =
        parseInt(this.data.time_aim1.split(':')[0]) * 60 + parseInt(this.data.time_aim1.split(':')[1]);
      let endTotalMinutes = parseInt(e.detail.value.split(':')[0]) * 60 + parseInt(e.detail.value.split(':')[1]);

      if (endTotalMinutes < startTotalMinutes) {
        return;
      } else {
        this.setData({
          time_aim2: e.detail.value,
        });
      }
    },

    bindTimeCallChange: function (e) {
      this.setData({
        time_call: e.detail.value,
      });
    },

    //分享
    async btn_share(e) {
      if (this.$state.can_share) {
        return;
      }
      let invite_id = '';
      if (
        this.$state.aimCardData['title'] != null &&
        ((this.$state.aimCardData['goal_type'] != 1 && this.$state.aimCardData['goal_type'] != null) ||
          (this.$state.aimCardData['end_time'] != null && this.$state.aimCardData['needed_be_signed_deadline'] != null))
      ) {
        this.setData({
          share_text: ['(共可邀请4人)', '请等待'],
        });
        let goal_type, team, num, reminder_at;
        !this.$state.aimCardData['goal_type']
          ? (goal_type = 1)
          : (goal_type = parseInt(this.$state.aimCardData['goal_type']));
        !this.$state.aimCardData['team'] ? (team = 0) : (team = this.$state.aimCardData['team']);
        !this.$state.aimCardData['reminder_at']
          ? (reminder_at = 0)
          : (reminder_at = this.$state.aimCardData['reminder_at']);
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
          let result = await awx.request({
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
          if (result.errMsg === 'request:fail ') {
            return;
          }
          invite_id = result.data.data.invite_id;
        } else if (goal_type == 2) {
          // 微信运动
          let result = await awx.request({
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
          console.log(result);
          if (result.errMsg === 'request:fail ') {
            return;
          }
          invite_id = result.data.data.invite_id;
        } else if (goal_type == 0) {
          let result = await awx.request({
            method: 'POST',
            url: this.$state.apiURL + '/user/goal/add',
            data: {
              goal_name: this.$state.aimCardData['title'],
              goal_type: goal_type,
              goal_is_a_group: team,
              login_key: this.$state.login_key,
            },
          });
          if (result.errMsg === 'request:fail ') {
            return;
          }
          invite_id = result.data.data.invite_id;
        }
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
          can_share: true,
        })
        this.setData({
          invite_id: invite_id,
          share_text: ['(共可邀请4人)', '发送邀请'],
        });
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
        this.setState({
          can_share: false,
        })
        this.setData({
          share_text: ['(新建打卡后可邀请)', '新建打卡'],
        });
      }
      return Promise.resolve();
    },
    tapDialogButton: function () {
      this.setData({
        dialogShow: false,
      });
    },
  },
});
