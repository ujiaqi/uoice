

// let startY = 0;
// let moveY = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    recommendList: [],
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取当前机型的状态栏高度
    wx.getSystemInfo({
      success: e => {
        // t.barheight = e.statusBarHeight; //状态栏高
        // console.log(e.statusBarHeight);
        this.setData({
          barHeight: e.statusBarHeight
        })
      }
    })

    // 判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          // 跳转至登录界面
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      })
      return;
    }
    

  },

  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,

    })
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})