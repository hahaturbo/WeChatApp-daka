// pages/modifycard/modifycard.js
import './index.wxss';

const awx = wx.toAsync("request", "login", "getWeRunData", "getUserInfo")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    carditem: {
      type: Number,
      value: ''
    },
  },
  observers: {
    carditem(carditem) {
      this.setData({
        item: carditem,
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    item: '',
    type_array: ['极简', '普通', '微信运动'],
    reminder_Array: ['打卡时', '提前5分钟', '提前10分钟', '提前15分钟', '提前30分钟', '提前一小时'],
    frequencyArray: [
      ['每'],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
      ['天', '周', '月'],
      ['任意一天', '仅当天'],
    ],
    // frequency_typeArray: ['天 任意一天', '月 任意一天', '天 仅当天', '月 仅当天'],
    goal_type: '',
    goal_name: '',
    started_at: '',
    ended_in: '',
    frequency: '',
    frequency_type: '',
    frequency_typeformat: '',
    // frequency_typeindex: '',
    reminder_at: '',
    reminder_atindex: '',
    needed_be_signed_at: '',
    needed_be_signed_deadline: '',

  },

  attached: function () {
    this.initdata();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // initialization
    initdata: function () {
      this.setData({
        goal_type: this.$state.CardData[this.data.item].goal_type,
        goal_name: this.$state.CardData[this.data.item].goal_type == 2 ? parseInt(this.$state.CardData[this.data.item].goal_name.replace(/[^0-9]/ig, '')) : this.$state.CardData[this.data.item].goal_name,

      })
      if (this.data.goal_type != 0) {
        this.setData({
          frequency: this.$state.CardData[this.data.item].frequency,
        })
      }
      if (this.data.goal_type == 1) {
        this.setData({
          started_at: this.$state.CardData[this.data.item].started_at,
          ended_in: this.$state.CardData[this.data.item].ended_in,
          frequency_type: this.$state.CardData[this.data.item].frequency_type,
          frequency_typeformat: this.frequency_typeformat(this.$state.CardData[this.data.item].frequency, this.$state.CardData[this.data.item].frequency_type),
          // frequency_typeindex: parseInt(this.$state.CardData[this.data.item].frequency_type.replace(/[^0-9]/ig, ''), 2),
          reminder_at: this.$state.CardData[this.data.item].reminder_at,
          reminder_atindex: this.reminderformat(this.$state.CardData[this.data.item].reminder_at),
          needed_be_signed_at: this.$state.CardData[this.data.item].needed_be_signed_at,
          needed_be_signed_deadline: this.$state.CardData[this.data.item].needed_be_signed_deadline,
        })
      }
    },
    reminderformat: function (reminder_at) {
      return reminder_at >= 30 ? reminder_at / 30 + 3 : reminder_at / 5;
    },
    frequency_typeformat: function (frequency, frequency_type) {
      let format = [0, 0, 0, 0];
      format[0] = 0;
      format[3] = frequency_type[0];
      if (frequency_type[2] != 1) {
        format[1] = frequency % 7 == 0 ? frequency / 7 - 1 : frequency - 1;
        format[2] = frequency % 7 == 0 ? 1 : 0;
      } else {
        format[1] = frequency - 1;
        format[2] = 2;
      }
      return format;
    },
    // picker
    valueChanged: function (e) {
      switch (e.target.dataset.name) {
        case 'goal_name':
          this.setData({
            goal_name: e.detail.value,
          })
          console.log('goal_name', this.data.goal_name);
          break;
        case 'started_at':
          if (parseInt(e.detail.value.replace(/[^0-9]/ig, '')) >= parseInt(this.data.ended_in.replace(/[^0-9]/ig, ''))) {
            this.setData({
              started_at: this.data.started_at,
            })
            break;
          }
          this.setData({
            started_at: e.detail.value,
          })
          console.log('started_at', this.data.started_at);
          break;
        case 'ended_in':
          if (parseInt(e.detail.value.replace(/[^0-9]/ig, '')) <= parseInt(this.data.started_at.replace(/[^0-9]/ig, '')) || (new Date(e.detail.value.replace(/-/g, '/')) <= (new Date()))) {
            this.setData({
              ended_in: this.data.ended_in,
            })
            break;
          }
          this.setData({
            ended_in: e.detail.value,
          })
          console.log('ended_in', this.data.ended_in);
          break;
        case 'frequency':
          this.setData({
            frequency: e.detail.value[2] == 1 ? e.detail.value[1] * 7 + 7 : e.detail.value[1] + 1,
            frequency_type: e.detail.value[3] + '|' + parseInt(e.detail.value[2] / 2),
            // frequency_typeindex: e.detail.value[3] * 2 + parseInt(e.detail.value[2] / 2),
            frequency_typeformat: e.detail.value,
          })
          console.log('frequency', this.data.frequency, this.data.frequency_type /* , this.data.frequency_typeindex */ );
          break;
        case 'needed_be_signed_at':
          if (parseInt(e.detail.value.replace(/[^0-9]/ig, '')) >= parseInt(this.data.needed_be_signed_deadline.replace(/[^0-9]/ig, ''))) {
            this.setData({
              needed_be_signed_at: this.data.needed_be_signed_at,
            })
            break;
          }
          this.setData({
            needed_be_signed_at: e.detail.value,
          })
          console.log('needed_be_signed_at', this.data.needed_be_signed_at);
          break;
        case 'needed_be_signed_deadline':
          if (parseInt(e.detail.value.replace(/[^0-9]/ig, '')) <= parseInt(this.data.needed_be_signed_at.replace(/[^0-9]/ig, ''))) {
            this.setData({
              needed_be_signed_deadline: this.data.needed_be_signed_deadline,
            })
            break;
          }
          this.setData({
            needed_be_signed_deadline: e.detail.value,
          })
          console.log('needed_be_signed_deadline', this.data.needed_be_signed_deadline);
          break;
        case 'reminder_at':
          this.setData({
            reminder_at: e.detail.value != 5 ? parseInt(this.data.reminder_Array[e.detail.value].replace(/[^0-9]/ig, '')) : 60,
            reminder_atindex: e.detail.value,
          })
          console.log('reminder_at', this.data.reminder_at, this.data.reminder_atindex);
          break;
      }
    },
    // modify-父组件调用
    async modify() {
      let icon = "success"
      wx.showLoading({
        title: icon,
      })
      let result
      switch (this.data.goal_type) {
        case 0:
          result = awx.request({
            url: this.$state.apiURL + '/user/goal/edit',
            method: 'POST',
            data: {
              goal_id: this.$state.CardData[this.data.item].goal_id,
              login_key: this.$state.login_key,
              now_type: this.data.goal_type,
              goal_type: this.data.goal_type,
              goal_name: this.data.goal_name,
              old_name: this.$state.CardData[this.data.item].goal_name,
            },
          })
          break;
        case 2:
          result = await awx.request({
            url: this.$state.apiURL + '/user/goal/edit',
            method: 'POST',
            data: {
              goal_id: this.$state.CardData[this.data.item].goal_id,
              login_key: this.$state.login_key,
              now_type: this.data.goal_type,
              goal_type: this.data.goal_type,
              goal_name: `每天走${this.data.goal_name}步`,
              frequency: this.data.goal_name,
              old_name: this.$state.CardData[this.data.item].goal_name,
            },
          })
          break
        case 1:
          result = await awx.request({
            url: this.$state.apiURL + '/user/goal/edit',
            method: 'POST',
            data: {
              goal_id: this.$state.CardData[this.data.item].goal_id,
              login_key: this.$state.login_key,
              now_type: this.data.goal_type,
              goal_type: this.data.goal_type,
              goal_name: this.data.goal_name,
              started_at: this.data.started_at,
              ended_in: this.data.ended_in,
              frequency: this.data.frequency,
              frequency_type: this.data.frequency_type,
              reminder_at: this.data.reminder_at,
              needed_be_signed_at: this.data.needed_be_signed_at,
              needed_be_signed_deadline: this.data.needed_be_signed_deadline,
              old_name: this.$state.CardData[this.data.item].goal_name,
            },
          })
          break;
      }
      if (result.errMsg === "request:fail ") {
        console.log(result.errMsg)
        icon = "error"
      }
      console.log(result.data)
      await wx.showToast({
        title: icon,
        icon: icon,
        duration: 2000,
      })
      if (icon === "success") {
        this.triggerEvent('deleteEvent', 'modify')
      }
    },
  }
})
