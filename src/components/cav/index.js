// components/cav/cav.js
import './index.wxss';

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    shareTempFilePath: '',
    imageFile: '',
    tickYES: '',
    code: '',
  },

  lifetimes: {
    ready: function () {
      wx.getImageInfo({
        src: `https://wxda.hahaturbo.site/daka-img/tick-YES.png`,
        success: (res) => {
          this.setData({
            tickYES: res.path
          })
          if (this.data.code && this.data.tickYES) {
            this.Drawshare();
          }
        }
      })
      wx.getImageInfo({
        src: `https://wxda.hahaturbo.site/daka-img/code.jpg`,
        success: (res) => {
          this.setData({
            code: res.path
          })
          if (this.data.code && this.data.tickYES) {
            this.Drawshare();
          }
        }
      })


    },
  },


  /**
   * 组件的方法列表
   */
  methods: {
    Drawshare: function () {
      let name = this.$state.tick_title;
      console.log("draw", name)
      // res.path=`https://wxda.hahaturbo.site/daka-img/tick-YES.png`
      const ctx = wx.createCanvasContext("share", this)
      //var ctx = wx.createContext()
      console.log(wx);
      ctx.setFillStyle('white');
      ctx.fillRect(0, 0, 300, 400);
      ctx.setTextAlign('center') // 文字居中
      ctx.setFillStyle('#000000') // 文字颜色：黑色
      ctx.setFontSize(33) // 文字字号：
      ctx.fillText("[达成目标]", 150, 70);
      ctx.fillText(name, 150, 130);
      ctx.setFontSize(20)
      ctx.fillText("我做到了！", 120, 230);
      ctx.drawImage(this.data.tickYES, 15, 200, 250, 200)
      ctx.drawImage(this.data.code, 220, 320, 70, 70)
      //ctx.draw(true, this.SavePic)
      ctx.draw(true, () => {
        this.canvasToTempFilePath({
          canvasId: 'share',
        }, this).then(({
          tempFilePath
        }) => this.setData({
          imageFile: tempFilePath
        }))
      })
      setTimeout(() => {
        this.handleSave();
      }, 200);
    },
    //https://www.jianshu.com/p/7d47e52de73c
    canvasToTempFilePath: function (option, context) {
      console.log("CTTF");
      return new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          ...option,
          success: resolve,
          fail: reject,
        }, context)
      })
    },

    saveImageToPhotosAlbum: function (option) {
      console.log("SITPA");
      return new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          ...option,
          success: resolve,
          fail: reject,
        })
      })
    },
    longhandleSave() {
      console.log("保存授权 ");
      wx.authorize({
        scope: 'scope.writePhotosAlbum',
        success() {
          console.log("保存授权同意 ");
          // 用户已经同意小程序使用微信运动，后续调用  接口不会弹窗询问
          setTimeout(() => {
            this.handleSave();
          }, 200)
        },
        fail: res => {
          console.log("保存未授权： " + JSON.stringify(res));
          wx.showModal({
            title: '温馨提示',
            content: '您需要授权后，才能保存分享，是否重新授权？',
            confirmColor: '#ff2d4a',
            success(res) {
              if (res.confirm) {
                // 如果用户点了确定，就打开 设置 界面
                wx.openSetting({
                  success(res) {
                    // 不管是否开启授权，都执行success
                    // 应该根据 res['scope.XXX'] 是 true 或 false 来确定用户是否同意授权
                    console.log('设置success：', res.authSetting)
                    if (res.authSetting['scope.writePhotosAlbum'] === true) {
                      // 马上保存
                      this.handleSave();
                    }
                  },
                  fail(err) {
                    console.log('授权保存失败:', err)
                    wx.showToast({
                      icon: 'none',
                      title: '无法保存╮(╯_╰)╭',
                      duration: 2500,
                    })
                  }
                })
                console.log('用户点击确定前往授权保存')
              } else if (res.cancel) {
                wx.showToast({
                  icon: 'none',
                  title: '无法保存(⊙o⊙)？',
                  duration: 1500,
                })
              }
            }
          })

        },
      })
    },




    handleSave() {
      const {
        imageFile
      } = this.data
      if (imageFile) {
        this.saveImageToPhotosAlbum({
          filePath: imageFile,
        }).then(() => {
          wx.showToast({
            icon: 'none',
            title: '分享图片已保存至相册,本目标将删除',
            duration: 2500,
          })
        }).catch(() => {
          wx.showToast({
            icon: 'none',
            title: '长按保存分享图片至相册,本目标将删除',
            duration: 2500,
          })
        })
      }
    },
  }
})
