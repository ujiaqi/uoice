// pages/video/video.js
import request from '../../utils/request'

// 查看视频分类的足迹，只记录最后三次浏览位置
let footprint = [];
// 当前页面的offset值
let offset = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 导航标签数据
    videoGroupList: [],
    // 导航的标识
    navId: '',
    // 单个视频列表数据
    videoList: [],
    // 所有视频列表数据
    allVideoList: [],
    // 当前所在分类的索引
    pageNum: 0,
    // 标识下拉刷新是否被触发
    isTriggered: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    
   
  },

  
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
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