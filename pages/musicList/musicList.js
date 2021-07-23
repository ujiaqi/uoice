// pages/musicList/musicList.js
import request from '../../utils/request'
import localRequest from '../../utils/localRequest'

// 存放歌单的id 用于查询歌曲详情muisicInfo
let trackIdsList = [];
// 存放查到的所有musicInfo
let playingMusicList = [];
// 当前列表的总页数
let page = 0;
// 当前所处的页数
let currentPage = 0;
// 当前歌单是否属于用户
let isListBelongToUser = true;
//是否点击了加载更多
let isLoadMoreTrigger = false;
// 当前歌单的id
let musicListId = '';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 当前机型的状态栏高度
    barHeight: 0,
    // 歌单详情数据
    musicList: {},
    // 存放歌单，供songDetail使用
    playingMusicList: [],

    // 是否允许scroll-view滚动
    isScroll: false,
    // 显示在页面上的列表
    displayMusicList: [],
    // 控制load组件是否显示
    isLoad: false,
    // 是否有更多数据
    isMore: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 获取当前机型的状态栏高度
    wx.getSystemInfo({
      success: e => {
        // t.barheight = e.statusBarHeight; //状态栏高
        // console.log(e.statusBarHeight);
        this.setData({
          barHeight: e.statusBarHeight
        })
        // console.log(pixelRatio);
      }
    })
    // console.log(options);

    // 清空trackIdsList
    trackIdsList = []
    page = 0;
    currentPage = 0;
    playingMusicList = [];

    let musicList;
    // 根据传过来的musiclistid查询歌单
    musicList = await localRequest('/getSong', { id: options.musiclistid, s: 0 })
    musicListId = options.musiclistid

    // console.log(musicList);
    musicList = musicList.playlist;

    // 保存tracksIds
    musicList.trackIds.forEach(item => {
      trackIdsList.push(item.id)
    });
    // 将trackIdsList保存app.js 在songDetail中就不需要重新请求了，节约时间，提升用户体验
    app.globalData.trackIdsList = trackIdsList;

    // 判断当前musicListId是否和storage中的musicListId相同
    if (wx.getStorageSync('musicListId') == options.musiclistid) {
      let playingMusicList = wx.getStorageSync('playingMusicList');
      musicList.tracks = playingMusicList;
    }


    // 取musicList中的tracks的前二十条，因为非该歌单的creator，最多只能拿20条tracks，其余的需要通过trackIds去查询详细信息
    // 如果大于20条则表示此表单属于用户获取已经获取过完整的数据，可拿到1000条tracks数据
    if (musicList.tracks.length > 20) {
      // 将tracks保存至playingMusicList中，减小setData的数据量 优化性能
      playingMusicList.push(...musicList.tracks)
      // 判断数据是否大于50条
      if (playingMusicList.length > 50) {
        // 大于50条 对数据进行分页处理
        page = Math.ceil(trackIdsList.length / 50);
        musicList.tracks = playingMusicList.slice(50 * currentPage, 50 * (currentPage + 1))
        currentPage++;
        this.setData({
          isLoad: true
        })
      } else {
        // 小于50条 直接全部渲染至页面中 不用操作就行
        // musicList.tracks = playingMusicList
        this.setData({
          isLoad: false
        })
      }
      // 关闭加载更多按钮
      this.setData({
        isMore: false,
      })
    } else {
      // 如果tracks长度小于20 说明不是此用户的歌单或是歌单本身小于20首  保存前20首至playingMusicList 
      isListBelongToUser = false;
      playingMusicList.push(...musicList.tracks)
    }

    if (musicList.tracks.length == trackIdsList.length) {
      this.setData({
        isMore: false,
        isLoad: false,
      })
    }
    // console.log(playingMusicList);

    this.setData({
      musicList,
    })

  },

  // 根据trackIds 查询歌单详情
  async getListByTrackIdsList() {
    if (trackIdsList.length > 1000) {
      let index = Math.ceil(trackIdsList.length / 100);
      let i = 0
      while (i != index) {
        let partParams = trackIdsList.slice(i * 100, (i + 1) * 100).join(',')
        let result = await request('/song/detail', { ids: partParams })
        result = result.songs;
        playingMusicList.push(...result)
        i++
      }

    } else {
      // 截掉前面20条是因为前20条是用tracks的
      let params = trackIdsList.slice(20).join(',')
      // console.log('params', params);
      let result = await request('/song/detail', { ids: params });
      result = result.songs;
      // console.log(playingMusicList);
      // console.log(result);
      playingMusicList.push(...result)
    }
  },

  // 跳转至点击歌曲的详情页面
  async toSongDetail(event) {
    // 暂停播放音乐，提升用户体验
    this.backgroundAudioManager = wx.getBackgroundAudioManager();

    // console.log(event);
    let { song } = event.currentTarget.dataset;

    // 跳转至songDetail表示播放此歌单中的音乐，将歌单数据和歌单id存入storage
    wx.setStorageSync('playingMusicList', playingMusicList)
    wx.setStorageSync('musicListId', musicListId)

    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + JSON.stringify(song) + '&type=musiclist'
    })
  },

  handleTouchEnd(e) {
    // startY = e.touches[0].clientY
    // console.log(e);
    if (e.changedTouches[0].pageY - e.changedTouches[0].clientY <= 70) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
      if (this.data.isScroll == true) {
        this.setData({
          isScroll: false
        })
      }
    } else {
      wx.pageScrollTo({
        scrollTop: 99999,
        duration: 300
      })
      if (this.data.isScroll == false) {
        // console.log('触发自动滚动事件');
        this.setData({
          isScroll: true
        })
      }
    }

  },

  // 列表滚动到底，加载更多数据
  async reachBottom() {
    // 先判断歌单是否属于用户
    if (isListBelongToUser == true) {
      if (currentPage < page) {
        let data = playingMusicList.slice(50 * currentPage, 50 * (currentPage + 1))
        let musicList = this.data.musicList
        musicList.tracks.push(...data)
        this.setData({
          musicList: musicList
        })
        currentPage = currentPage + 1;
      } else {
        this.setData({
          isLoad: false
        })
        return;
      }
    }
    else {
      if (isLoadMoreTrigger == true) {
        if (playingMusicList.length > 50) {
          if (currentPage < page) {
            let musicList = this.data.musicList
            let data = playingMusicList.slice(50 * currentPage, 50 * (currentPage + 1))
            musicList.tracks.push(...data)
            this.setData({
              musicList: musicList
            })
            currentPage++;
          } else {
            this.setData({
              isLoad: false
            })
          }
        } else {
          this.setData({
            isLoad: false,
          })
        }
      }
    }
  },

  // 点击加载更多的回调 
  async loadMore() {
    this.setData({
      isLoad: true,
      isMore: false,
    })
    isLoadMoreTrigger = true
    await this.getListByTrackIdsList()
    // console.log(playingMusicList);
    let musicList = this.data.musicList;
    // console.log(musicList.tracks);
    if (playingMusicList.length > 50) {
      // 大于50条 对数据进行分页处理
      page = Math.ceil(trackIdsList.length / 50);
      currentPage = 1;
      // 之前的30条补上
      let data = playingMusicList.slice(20, 50);
      musicList.tracks.push(...data)
    } else {
      let data = playingMusicList.slice(20);
      // console.log(data);
      musicList.tracks.push(...data)
      // console.log(musicList.tracks);
    }


    this.setData({
      musicList,
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
    // 离开页面时，清空数据
    playingMusicList = [];
    page = 0;
    currentPage = 0;
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