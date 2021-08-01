// components/cardDetails/cardDetail.js
import './index.wxss';

const awx = wx.toAsync("request", "login", "getWeRunData", "getUserInfo");
const throttle = (fun, delay) => {
  let pre = 0;
  let timer = null;
  return function (...args) {
    if (Date.now() - pre > delay) {
      clearTimeout(timer);
      timer = null;
      pre = Date.now();
      fun.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        fun.apply(this, args);
      }, delay);
    }
  };
};
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    carditem: {
      type: Number,
      value: "",
    },
    endtime: {
      type: String,
      value: "",
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    item: 0,
    reminder_Array: [
      "打卡时",
      "提前5分钟",
      "提前10分钟",
      "提前15分钟",
      "提前30分钟",
      "提前一小时",
    ],
    // 星期
    weektext: ["日", "一", "二", "三", "四", "五", "六"],
    // 上月格子
    lastmonthgrid: [],
    // 当月格子
    thismonthday: [
      {
        date: 1,
      },
      {
        date: 2,
      },
      {
        date: 3,
      },
      {
        date: 4,
      },
      {
        date: 5,
      },
      {
        date: 6,
      },
      {
        date: 7,
      },
      {
        date: 8,
      },
      {
        date: 9,
      },
      {
        date: 10,
      },
      {
        date: 11,
      },
      {
        date: 12,
      },
      {
        date: 13,
      },
      {
        date: 14,
      },
      {
        date: 15,
      },
      {
        date: 16,
      },
      {
        date: 17,
      },
      {
        date: 18,
      },
      {
        date: 19,
      },
      {
        date: 20,
      },
      {
        date: 21,
      },
      {
        date: 22,
      },
      {
        date: 23,
      },
      {
        date: 24,
      },
      {
        date: 25,
      },
      {
        date: 26,
      },
      {
        date: 27,
      },
      {
        date: 28,
      },
      {
        date: 29,
      },
      {
        date: 30,
      },
    ],
    // 下月格子
    nextmonthgrid: [],
    year: 0,
    month: 0,
    date: 0,
    datetitle: "",
    format: "",
    YEAR: 0,
    MONTH: 0,
    DATE: 0,
    secondselect: 0,
    todaysigned: true,
    cardend: false,
    membersnum: 0,
    share: false,
    goal_type: ["极简", "普通", "微信运动"],
    signLoading: false,
    scrollToTop: false,
  },

  observers: {
    carditem: function (carditem) {
      this.setData({
        item: carditem,
      });
    },
  },
  attached: function () {
    this.initCardDetail();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    async initCardDetail() {
      // 获取打卡记录
      await this.getCardDetail();
      this.today();
      const endflag = this.comparedate();
      if (endflag) {
        this.setData({
          cardend: endflag,
        });
      }
      if (this.$state.CardData[this.data.item].goal_type == 2) {
        await this.getWeRunData();
      }
      return Promise.resolve();
    },
    display: function (year, month, date) {
      this.setData({
        year: year,
        month: month,
        date: date,
        datetitle: year + "年" + this.zero(month) + "月",
      });
      this.createday(year, month);
      this.createmptygrid(year, month);
    },
    // 比较当天和结束时间选择
    comparedate: function () {
      if (this.$state.CardData[this.data.item].goal_type >= 3) return true;
      if (this.$state.CardData[this.data.item].goal_type != 1) return false;
      // goal_type==1
      let end = new Date(this.$state.CardData[this.data.item].ended_in);
      let today = new Date(this.data.select);
      if (end > today) {
        return false;
      }
      today = end;
      this.setData({
        select: this.$state.CardData[this.data.item].ended_in,
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        date: today.getDate(),
        datetitle:
          today.getFullYear() + "年" + this.zero(today.getMonth() + 1) + "月",
      });
      this.display(today.getFullYear(), today.getMonth() + 1, today.getDate());
      return true;
    },
    // 默认选中当天
    today: function () {
      let DATE = new Date(),
        year = DATE.getFullYear(),
        month = DATE.getMonth() + 1,
        date = DATE.getDate(),
        select = year + "-" + this.zero(month) + "-" + this.zero(date);
      this.setData({
        format: select,
        select: select,
        year: year,
        month: month,
        date: date,
        DATE: date,
        YEAR: year,
        MONTH: month,
      });
      this.display(year, month, date);
    },
    // 选择对应方法
    select: function (e) {
      let second = this.data.secondselect;
      if (second == 0 && this.data.date == e.currentTarget.dataset.date) {
        second = 1;
      } else if (second == 1) {
        second = 0;
      }
      let date = e.currentTarget.dataset.date,
        select =
          this.data.year +
          "-" +
          this.zero(this.data.month) +
          "-" +
          this.zero(date);
      this.setData({
        datetitle: this.data.year + "年" + this.zero(this.data.month) + "月",
        select: select,
        year: this.data.year,
        month: this.data.month,
        date: date,
        secondselect: second,
      });
    },
    // 上个月
    lastmonth: function () {
      let month = this.data.month == 1 ? 12 : this.data.month - 1;
      let year = this.data.month == 1 ? this.data.year - 1 : this.data.year;
      this.display(year, month, 0);
    },
    // 下个月
    nextmonth: function () {
      let month = this.data.month == 12 ? 1 : this.data.month + 1;
      let year = this.data.month == 12 ? this.data.year + 1 : this.data.year;
      this.display(year, month, 0);
    },
    // 获取当月天数
    Getthismonthday: function (year, month) {
      return new Date(year, month, 0).getDate();
    },
    zero: function (i) {
      return i >= 10 ? i : "0" + i;
    },
    // 绘制空格
    createday: function (year, month) {
      let thismonthday = [],
        days = this.Getthismonthday(year, month);
      for (let i = 1; i <= days; i++) {
        thismonthday.push({
          date: i,
          dateFormat: this.zero(i),
          monthFormat: this.zero(month),
          week: new Date(Date.UTC(year, month - 1, i)).getDay(),
          signed: this.todaysigned(year, month, i),
          signedmembers: this.todaysignedmembers(year, month, i),
          othersigned: this.data.membersnum > 0 ? true : false,
        });
      }
      this.setData({
        thismonthday,
      });
    },

    // 获取当月空出天数
    createmptygrid: function (year, month) {
      let week = new Date(Date.UTC(year, month - 1, 1)).getDay(),
        lastmonthgrid = [],
        nextmonthgrid = [],
        emptyday = week == 0 ? 7 : week;
      let thismonthday = this.Getthismonthday(year, month);
      let lastmonthday =
        month - 1 < 0
          ? this.Getthismonthday(year - 1, 12)
          : this.Getthismonthday(year, month - 1);
      for (let i = 1; i <= emptyday; i++) {
        lastmonthgrid.push(lastmonthday - (emptyday - i));
      }
      let next =
        42 - thismonthday - emptyday - 7 >= 0
          ? 42 - thismonthday - emptyday - 7
          : 42 - thismonthday - emptyday;
      for (let i = 1; i <= next; i++) {
        nextmonthgrid.push(i);
      }
      this.setData({
        lastmonthgrid,
        nextmonthgrid,
      });
    },
    async getCardDetail() {
      // 获取打卡记录
      let record = await awx.request({
        method: "POST",
        url: this.$state.apiURL + "/user/getSignedRecord",
        data: {
          goal_id: this.$state.CardData[this.data.item].goal_id,
          login_key: this.$state.login_key,
        },
      });
      if (record.errMsg === "request:fail ") {
        console.error(record.errMsg);
        return;
      }
      this.setState({
        CardDetail: record.data.data,
      });
      return Promise.resolve();
    },

    async getWeRunData() {
      let wWeRun = await awx.getWeRunData();
      if (wWeRun.encryptedData) {
        // 微信获取运动成功
        let weRunData = await awx.request({
          method: "POST",
          url: this.$state.apiURL + "/user/getWeRunData",
          data: {
            encryptedData: wWeRun.encryptedData,
            iv: wWeRun.iv,
            login_key: this.$state.login_key,
          },
        });
        if (weRunData.errMsg === "request:fail ") {
          wx.showToast({
            icon: "error",
            title: "微信运动获取失败",
            duration: 1500,
          });
          return;
        }
        console.log("werun success");
        this.setState({
          stepInfoList: weRunData.data.stepInfoList,
        });
      } else {
        wx.showToast({
          icon: "error",
          title: "微信运动获取失败",
          duration: 1500,
        });
      }
      return Promise.resolve();
    },

    // this.log.data => this.$state.CardDetail[this.properties.carditem]
    // 获取时间戳
    getTimestamp: function (e) {
      let date = e.signed_at;
      date = date.substring(0, 19);
      date = date.replace(/-/g, "/");
      return new Date(date);
    },
    // 是否打卡
    todaysigned: function (year, month, date) {
      for (let i = 0; i < this.$state.CardDetail.length; i++) {
        if (
          this.$state.CardData[this.data.item].goal_id !=
          this.$state.CardDetail[i].goal_id
        ) {
          return false;
        } else {
          if (
            this.getTimestamp(this.$state.CardDetail[i]).getFullYear() ==
              year &&
            this.getTimestamp(this.$state.CardDetail[i]).getMonth() + 1 ==
              month &&
            this.getTimestamp(this.$state.CardDetail[i]).getDate() == date
          ) {
            return true;
          }
        }
      }
      return false;
    },
    // groupData[i].signed_data -> singned_data
    todaysignedmembers: function (year, month, date) {
      if (!this.$state.CardData[this.data.item].goal_is_a_group) return null;
      let members = [],
        groupMembers =
          this.$state.CardData[this.data.item].groupData.groupMembers,
        goal_id = this.$state.CardData[this.data.item].groupData.goal_id;
      let img, i, j;
      for (i = 0; i < groupMembers.length; i++) {
        let singned_data = groupMembers[i].signed_data;
        img = "";
        for (j = 0; j < singned_data.length; j++) {
          if (singned_data[j].goal_id == goal_id) {
            if (
              this.getTimestamp(singned_data[j]).getFullYear() == year &&
              this.getTimestamp(singned_data[j]).getMonth() + 1 == month &&
              this.getTimestamp(singned_data[j]).getDate() == date
            ) {
              img = groupMembers[i].img;
              break;
            }
          }
        }
        if (img.length) {
          members.push({
            img: img,
          });
        }
      }
      this.setData({
        membersnum: members.length,
      });
      return members;
    },
    handleScroll: throttle(function (e) {
      if (this.data.scrollToTop) return;
      if (e.detail.scrollTop >= 30) {
        this.setData({
          scrollToTop: true,
        });
        this.triggerEvent("scrollToTop");
      }
    }, 200),
    async todaydaka() {
      if (this.$state.CardData[this.data.carditem].sign_today) {
        return;
      }
      if (this.$state.CardData[this.data.carditem].goal_type == 2) {
        if (
          parseInt(this.$state.CardData[this.data.carditem].frequency) >
          parseInt(
            this.$state.stepInfoList[this.$state.stepInfoList.length - 1].step
          )
        ) {
          wx.showToast({
            title: "您的步数不够",
            icon: "none",
            duration: 2500,
          });
          return;
        }
      }
      this.setData({
        signLoading: true,
      });
      let result = await awx.request({
        method: "POST",
        url: this.$state.apiURL + "/user/goal/sign",
        data: {
          goal_id: this.$state.CardData[this.data.carditem].goal_id,
          login_key: this.$state.login_key,
        },
      });
      if (result.errMsg === "request:fail ") {
        console.error(result.errMsg);
        return;
      }
      await this.GetCardData();
      await this.getCardDetail();
      this.today();
      const endflag = this.comparedate();
      this.setData({
        signLoading: false,
        cardend: endflag ? endflag : this.data.cardend,
      });
      return Promise.resolve();
    },
    deletedaka: function () {
      this.setData({
        dialogshow: true,
        dialogtitle: "确定要删除此打卡吗？",
        dialogbutton: [
          {
            text: "删除",
            extClass: "btn_go_on",
          },
          {
            text: "取消",
            extClass: "btn_cancel",
          },
        ],
      });
      console.log("shanchudaka");
    },
    // dialog-buttontap
    async buttontap(e) {
      if (e.detail.item.text == "删除") {
        if (this.$state.CardData[this.data.item].goal_is_a_group) {
          // 是小组
          if (
            !this.$state.CardData[this.data.item].groupData.is_group_creator
          ) {
            await wx.showToast({
              title: "您不是组长，没有权限删除！",
              icon: "none",
              duration: 2000,
            });
            this.setData({
              dialogshow: false,
            });
            return;
          }
        }
        let result;
        if (this.$state.CardData[this.data.item].goal_type == 0) {
          // 极简
          result = await awx.request({
            url: this.$state.apiURL + "/user/goal/edit",
            method: "POST",
            data: {
              goal_id: this.$state.CardData[this.data.item].goal_id,
              login_key: this.$state.login_key,
              now_type: 0,
              goal_type: 3,
              goal_name: this.$state.CardData[this.data.item].goal_name,
            },
          });
        } else if (this.$state.CardData[this.data.item].goal_type == 2) {
          // 运动
          result = await awx.request({
            url: this.$state.apiURL + "/user/goal/edit",
            method: "POST",
            data: {
              goal_id: this.$state.CardData[this.data.item].goal_id,
              login_key: this.$state.login_key,
              now_type: 2,
              goal_type: 5,
              goal_name: this.$state.CardData[this.data.item].goal_name,
              frequency: this.$state.CardData[this.data.item].frequency,
            },
          });
        } else if (this.$state.CardData[this.data.item].goal_type == 1) {
          // 普通
          result = await awx.request({
            url: this.$state.apiURL + "/user/goal/edit",
            method: "POST",
            data: {
              goal_id: this.$state.CardData[this.data.item].goal_id,
              login_key: this.$state.login_key,
              now_type: 1,
              goal_type: 4,
              goal_name: this.$state.CardData[this.data.item].goal_name,
              started_at: this.$state.CardData[this.data.item].started_at,
              ended_in: this.$state.CardData[this.data.item].ended_in,
              frequency: this.$state.CardData[this.data.item].frequency,
              frequency_type:
                this.$state.CardData[this.data.item].frequency_type,
              reminder_at: this.$state.CardData[this.data.item].reminder_at,
              needed_be_signed_at:
                this.$state.CardData[this.data.item].needed_be_signed_at,
              needed_be_signed_deadline:
                this.$state.CardData[this.data.item].needed_be_signed_deadline,
            },
          });
        }
        if (result.errMsg === "request:fail ") {
          console.error(result.errMsg);
          return;
        }
        this.setData({
          dialogshow: false,
        });
        this.triggerEvent("deleteEvent", "delete");
      } else {
        this.setData({
          dialogshow: false,
        });
      }
      return Promise.resolve();
    },
    async getindex() {
      let res = await awx.request({
        method: "POST",
        url: this.$state.apiURL + "/user/goal/get",
        data: {
          login_key: this.$state.login_key,
        },
      });
      this.setState({
        CardData: res.data.data.data,
      });
      return Promise.resolve();
    },
    //获取打卡信息
    async GetCardData() {
      let result = await awx.request({
        method: "POST",
        url: this.$state.apiURL + "/user/goal/Bget",
        data: {
          amount: 5,
          login_key: this.$state.login_key,
        },
      });
      this.setState({
        aimCardDatas: result.data.data.data,
        card_num: result.data.data.data.length,
      });
      await this.getindex(this.$state.aimCardDatas);
      await wx.setStorage({
        key: "card_num",
        data: this.$state.card_num,
      });
      return Promise.resolve();
    },
  },
});
