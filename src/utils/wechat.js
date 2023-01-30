import http from './request'

export default {
  /**
   * 判断是否在微信中
   * @returns
   */
  isWechat() {
    let ua = window.navigator.userAgent.toLowerCase()
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      return true
    } else {
      return false
    }
  },
  /**
   * 初始化
   * @param {*} url 当前页面的url
   * @param {*} callback 回调方法
   */
  initJssdk(callback) {
    if (!this.isWechat()) {
      return
    }
    let ua = window.navigator.userAgent.toLowerCase()
    let url = ''
    if (/iphone|ipad|ipod/.test(ua)) {
      url = sessionStorage.getItem('firstEnterUrl')
    } else {
      url = location.toString()
    }
    http
      .post(location.origin + '/signpackage.php', { url: url })
      .then((res) => {
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: res.appId, // 必填，公众号的唯一标识
          timestamp: res.timestamp, // 必填，生成签名的时间戳
          nonceStr: res.nonceStr, // 必填，生成签名的随机串
          signature: res.signature, // 必填，签名
          jsApiList: [
            'updateTimelineShareData',
            'updateAppMessageShareData',
            'chooseWXPay',
            'getLocalImgData',
            'chooseImage',
          ], // 必填，需要使用的JS接口列表
        })

        if (callback) {
          callback()
        }
      })
  },
  /**
   * 获取本地图片
   * @param {*} callback
   */
  getLocalImgData(callback, cancelCallback) {
    this.initJssdk(() => {
      wx.ready(() => {
        wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
            var localIds = res.localIds // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
            wx.getLocalImgData({
              localId: localIds[0],
              success: function (res) {
                var localData = res.localData
                if (localData.indexOf('data:image') != 0) {
                  //判断是否有这样的头部
                  localData = 'data:image/jpeg;base64,' + localData
                }
                localData = localData
                  .replace(/\r|\n/g, '')
                  .replace('data:image/jgp', 'data:image/jpeg')
                //第一个替换的是换行符，第二个替换的是图片类型，因为在IOS机上测试时看到它的图片类型时jgp，
                //这不知道时什么格式的图片，为了兼容其他设备就把它转为jpeg
                callback(localData)
              },
            })
          },
          cancel: function () {
            // 取消回调
            cancelCallback()
          },
        })
      })
    })
  },
}
