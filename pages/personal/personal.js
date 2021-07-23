// pages/personal/personal.js

import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: {},
    // 用户播放记录
    recentPlayList: [],
    // 当前播放的歌曲的歌单,用于给songDetail读取
    playingMusicList: [],
    // 保存用户的歌单
    // '我喜欢的音乐'歌单
    myFavoriteList: [],
    // 创建歌单
    createdList: [],
    // 收藏歌单
    collectedList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      // 更新userInfo的状态
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
    }
    if (wx.getStorageSync('lastUserId') == wx.getStorageSync('userId') && wx.getStorageSync('userId') != '') {
      console.log('验证通过');
      let recentPlayList = wx.getStorageSync('recentPlayList');
      let myFavoriteList = wx.getStorageSync('myFavoriteList');
      let createdList = wx.getStorageSync('createdList');
      let collectedList = wx.getStorageSync('collectedList');
      this.setData({
        recentPlayList,
        myFavoriteList,
        createdList,
        collectedList,
      })
    }
  },

  // 获取用户播放记录的功能函数
  async getUserRecentPlayList(userId) {
    let result = await request('/user/record', { uid: userId, type: 1 })
    // console.log(result);
    let recentPlayList = [];
    if (result.weekData.length > 10) {
      let index = 0;
      recentPlayList = result.weekData.splice(0, 10).map(item => {
        item.id = index++;
        return item;
      })
    } else {
      let index = 0
      recentPlayList = result.weekData.map(item => {
        item.id = index++;
        return item;
      })
    }
    this.setData({
      recentPlayList
    })
    wx.setStorageSync('recentPlayList', recentPlayList)
  },

  // 跳转至登录页面
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  async toSongDetail(e) {
    // console.log(e.currentTarget.dataset.musicid);
    let playingMusicList = []
    let index = 0;
    while (index < this.data.recentPlayList.length) {
      playingMusicList.push(this.data.recentPlayList[index].song)
      index++;
    }
    // this.setData({
    //   playingMusicList
    // })
    wx.setStorageSync('playingMusicList', playingMusicList)
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + e.currentTarget.dataset.musicid
    })
  },

  // 获取并处理 用户歌单
  async getUserPlayList() {
    let userPlayList = await request('/user/playlist', { uid: this.data.userInfo.userId })
    userPlayList = userPlayList.playlist
    // 对获取到的数据进行分类处理
    let myFavoriteList = [];
    let createdList = [];
    let collectedList = [];

    myFavoriteList.push(userPlayList[0])
    userPlayList = userPlayList.splice(1);
    // console.log(userPlayList);
    userPlayList.forEach(item => {
      if (item.subscribed == true) {
        return
      }
      createdList.push(item)
    });
    userPlayList = userPlayList.splice(createdList.length);
    userPlayList.forEach(item => {
      collectedList.push(item)
    });

    this.setData({
      myFavoriteList,
      createdList,
      collectedList,
    })
    wx.setStorageSync('myFavoriteList', myFavoriteList)
    wx.setStorageSync('createdList', createdList)
    wx.setStorageSync('collectedList', collectedList)
    wx.setStorageSync('lastUserId', this.data.userInfo.userId)
  },

  // 跳转至音乐列表页面
  toMusicList(e) {
    wx.navigateTo({
      url: '/pages/musicList/musicList?musiclistid=' + e.currentTarget.dataset.musiclistid
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (this.data.userInfo.userId) {
      console.log(123);

      // 获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)

    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.userInfo.userId) {
      this.getUserPlayList()
    }
    // console.log(1);
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