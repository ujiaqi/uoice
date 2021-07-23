// pages/comment/comment.js

import request from '../../utils/request';
import moment from 'moment';

// 当前评论页面的音乐id
let musicId = ''
// time: 分页参数,取上一页最后一项的 time 获取下一页数据
let floorCommentTime = '';
// 当前评论的id
let commentId = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 评论列表
    commentList: [],
    // 当前评论页数
    page: 1,
    // 是否显示loading组件
    isLoad: true,
    // 评论总条数
    total: 0,
    // 是否显示楼层评论列表
    isFloorCommentListShow: false,
    // 楼层评论数据
    floorComment: {},
    // 是否显示楼层评论的loading组件
    isFloorLoad: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
   
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