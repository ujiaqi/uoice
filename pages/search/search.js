// pages/search/search.js

import request from '../../utils/request'

// 要查询的内容
let searchContent = '';
// 定义定时器的名称 用于搜索关键字的推荐节流查询
let timer = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 查询结果
    searchResult: [[], [], []],
    // 当前查询的页数
    pageNum: 0,
    // 是否还有更多结果
    hasMore: true,
    // 关键词搜索建议数组
    suggest: [],
    // 输入框的初始内容
    searchValue: '',
    // 搜索页面所处的阶段
    state: 0,
    // 热搜榜数据
    hotSearch: [],
    // 搜索类型
    searchType: 0,
    // 选择类型时的效果水平位置
    left: 12,
    // 存储用户搜索历史
    searchHistory: [],
    // 默认搜索内容
    searchDefault: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getStorageSync('searchHistory')) {
      this.setData({
        searchHistory: wx.getStorageSync('searchHistory')
      })
    }
    this.getSearchDefault()
    this.getHotSearch();
  },

  // 获取默认搜索内容
  async getSearchDefault() {
    let searchDefault = await request('/search/default')
    searchDefault = searchDefault.data.showKeyword
    this.setData({
      searchDefault
    })
  },

  // 获取热搜榜数据
  async getHotSearch() {
    let hotSearch = await request('/search/hot/detail')
    this.setData({
      hotSearch: hotSearch.data
    })
  },

  // 在输入时触发
  // 不能加async  一加输入框会出现promoise对象
  typing(e) {
    // console.log(e.detail.value);
    if (e.detail.value.trim() !== '') {
      this.setData({
        state: 1,
        searchResult: [[], [], []],
        pageNum: 0,
        hasMore: true,
      })
    } else {
      // 将搜索建议清空
      this.setData({
        state: 0,
        suggest: [],
        searchResult: [[], [], []],
        pageNum: 0,
        hasMore: true,
      })
      // 这里清空定时器以解决在删除所有搜索内容时，在删除最后一个字符前又触发了定时器而没有清空
      clearInterval(timer)
      return;
    }
    // 使用定时器节流
    clearInterval(timer)
    timer = setTimeout(() => {
      // console.log('定时器');
      this.getSuggest(e.detail.value)
    }, 500)
    // console.log(e);
  },

  // 请求关键词搜索建议
  async getSuggest(keywords) {
    let suggest = await request('/search/suggest', { keywords, type: 'mobile' })
    suggest = suggest.result.allMatch;
    if (suggest != undefined) {
      this.setData({
        suggest,
      })
    }
    // console.log(suggest);
  },

  // 按回车确认搜索触发
  async confirmSearch(e) {
    // console.log(e.detail.value);
    let content = e.detail.value;
    // 如果搜索内容为空，直接搜索默认搜索内容
    if (content == '') {
      content = this.data.searchDefault;
    }
    await this.getSearch(content);
    this.setData({
      searchValue: content
    })
  },

  // 对历史搜索进行添加的回调 
  changeSearchHistory(content) {
    let searchHistory = this.data.searchHistory
    // console.log(searchHistory);
    // 先判断列表中有没有相同的搜索
    if (!searchHistory.some(item => { return item == content })) {
      searchHistory.unshift(content)
      wx.setStorageSync('searchHistory', searchHistory);
      this.setData({
        searchHistory
      })
    }
    return
  },

  // 点击历史搜索item的回调 
  async tapSearchHistory(e) {
    await this.getSearch(e.currentTarget.dataset.searchword)
    this.setData({
      searchValue: e.currentTarget.dataset.searchword
    })
  },

  // 将搜索的函数进行封装
  async getSearch(content) {
    this.setData({
      state: 2,
    })
    // 保存查询内容
    searchContent = content;
    // 对查询类型进行判断
    // 当type为 1是单曲   为 1000是歌单   为 1014是视频
    let type = 1;
    let searchType = this.data.searchType;
    if (searchType == 0) {
      type = 1
    } else if (searchType == 1) {
      type = 1000
    } else if (searchType == 2) {
      type = 1014
    }
    let searchResult = this.data.searchResult
    // console.log(this.data.pageNum * 20);
    let searchResultData = await request('/search', { keywords: content, limit: 20, offset: this.data.pageNum * 20, type })
    // console.log(searchResultData);
    // 判断是否还有更多结果
    if (searchResultData.result.hasMore == false) {
      this.setData({
        hasMore: false
      })
    }
    if (searchType == 0) {
      searchResultData = searchResultData.result.songs
    } else if (searchType == 1) {
      searchResultData = searchResultData.result.playlists
      // console.log(searchResultData);
    } else {
      searchResultData = searchResultData.result.videos
    }
    searchResult[searchType].push(...searchResultData)
    this.setData({
      searchResult,
    })
    // 添加搜索历史
    this.changeSearchHistory(content)
    // console.log(searchResultData);
  },

  // 点击跳转至songDetail
  toSongDetail(e) {
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + e.currentTarget.dataset.musicid + '&type=searchList',
    });
  },

  // 点击建议关键字的回调
  chooseSuggest(e) {
    // console.log(e.currentTarget.dataset.keyword);
    // searchContent = e.currentTarget.dataset.keyword;
    this.setData({
      searchValue: e.currentTarget.dataset.keyword
    })
    this.getSearch(e.currentTarget.dataset.keyword)
  },

  // 直接点击热搜榜的item触发
  async handleTapHotSearch(e) {
    await this.getSearch(e.currentTarget.dataset.searchword)
    this.setData({
      searchValue: e.currentTarget.dataset.searchword
    })
  },

  // 查询结果列表滑动到底触发
  handleResultListBottom() {
    if (this.data.hasMore) {
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.getSearch(searchContent)
    }
  },

  // 搜索结果滑动切换搜索类型时 
  handleChangeType(e) {
    // console.log(e.detail.current);
    // console.log(searchContent);
    let left = 0;
    if (e.detail.current == 0) {
      left = 12
    } else if (e.detail.current == 1) {
      left = 45
    } else {
      left = 79
    }
    this.setData({
      searchType: e.detail.current,
      left,
      pageNum: 0,
      searchResult: [[], [], []],
      hasMore: true,
    })
    this.getSearch(searchContent);
  },

  // 跳转至音乐列表页面
  toMusicList(e) {
    wx.navigateTo({
      url: '/pages/musicList/musicList?musiclistid=' + e.currentTarget.dataset.musiclistid
    })
  },

  // 点击视频事件
  playVideo(event) {
    // console.log(event);
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.backgroundAudioManager.pause();
    const app = getApp();
    app.globalData.isPlay = false;
    let url = event.currentTarget.dataset.videovid
    // wx.setStorageSync('videoinfo', url)
    wx.navigateTo({
      url: '/pages/videoPlayer/videoPlayer?videovid=' + url
    })
  },

  // 通过直接点击类型标题改变搜索类型的回调
  changeTypeByTap(e) {
    // console.log(e.currentTarget.id);
    let id = e.currentTarget.id;
    if (id == 0) {
      this.setData({
        left: 12,
        searchType: id
      })
    } else if (id == 1) {
      this.setData({
        left: 45,
        searchType: id
      })
    } else {
      this.setData({
        left: 79,
        searchType: id
      })
    }
    // console.log(searchContent);
    this.getSearch(searchContent);
  },

  // 清空输入框
  cleanInput() {
    // console.log(1);
    this.setData({
      state: 0,
      suggest: [],
      searchResult: [[], [], []],
      pageNum: 0,
      hasMore: true,
      searchValue: '',
    })
  },

  // 清空历史搜索
  deleteHistory() {
    let searchHistory = [];
    wx.setStorageSync('searchHistory', searchHistory);
    this.setData({
      searchHistory
    })
  },

  // 返回上一级
  goBack() {
    wx.navigateBack({
      delta: 1
    });
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