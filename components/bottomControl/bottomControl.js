// components/bottomControl/bottomControl.js
import request from '../../utils/request'
import localRequest from '../../utils/localRequest'

// 存放播放歌曲的url
let musicUrl = ''
const app = getApp();
let playingMusicList = [];
// 当前播放歌曲所处的swiper-item的current
let playingMusicCurrent = 0;

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
    // 下面4个是保存从songDetail获得的数据
    // 当前播放歌单id
    musicListId: '',
    // 是否播放
    isPlay: false,
    // 当前播放歌曲在歌单中的索引
    playingMusicIndex: 0,
    // 当前播放歌单
    // playingMusicList: [],
    // 是否显示歌单列表
    showList: 58,
    displayMusicList: [],
    showListData: [],
    scrollPosition: 0,
    playingMusicCurrent: 0,
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行

    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
    ready: function () {
      // 在组件在视图层布局完成后执行

    }
  },

  pageLifetimes: {
    show: async function () {
      // 页面被展示
      //获取应用实例
      // console.log(app.globalData);
      if (wx.getStorageSync('playingMusicList').length != 0) {
        await this.setData({
          musicListId: app.globalData.musicListId,
          isPlay: app.globalData.isPlay,
          playingMusicIndex: wx.getStorageSync('playingMusicIndex'),
        })
        playingMusicCurrent = wx.getStorageSync('playingMusicCurrent')
        playingMusicList = wx.getStorageSync('playingMusicList');
        // 拿到playingMusicList后 创建空数组占位
        let displayMusicList = [[], [], []];
        console.log('playingMusicCurrent', playingMusicCurrent);
        if (wx.getStorageSync('displayMusicList').length >= 3) {
          displayMusicList = wx.getStorageSync('displayMusicList');
        } else {
          if (playingMusicList.length >= 3) {
            displayMusicList[playingMusicCurrent - 1 == -1 ? displayMusicList.length - 1 : playingMusicCurrent - 1] = playingMusicList[wx.getStorageSync('playingMusicIndex') - 1 == -1 ? playingMusicList.length - 1 : wx.getStorageSync('playingMusicIndex') - 1]
            displayMusicList[playingMusicCurrent] = playingMusicList[wx.getStorageSync('playingMusicIndex')]
            displayMusicList[playingMusicCurrent + 1 == displayMusicList.length ? 0 : playingMusicCurrent + 1] = playingMusicList[wx.getStorageSync('playingMusicIndex') + 1 == playingMusicList.length ? 0 : wx.getStorageSync('playingMusicIndex') + 1]
          } else {
            displayMusicList = playingMusicList;
          }
        }
        // if (playingMusicList.length >= 3) {
        //   displayMusicList[playingMusicCurrent - 1 == -1 ? displayMusicList.length - 1 : playingMusicCurrent - 1] = playingMusicList[wx.getStorageSync('playingMusicIndex') - 1 == -1 ? playingMusicList.length - 1 : wx.getStorageSync('playingMusicIndex') - 1]
        //   displayMusicList[playingMusicCurrent] = playingMusicList[wx.getStorageSync('playingMusicIndex')]
        //   displayMusicList[playingMusicCurrent + 1 == displayMusicList.length ? 0 : playingMusicCurrent + 1] = playingMusicList[wx.getStorageSync('playingMusicIndex') + 1 == playingMusicList.length ? 0 : wx.getStorageSync('playingMusicIndex') + 1]
        // } else {
        //   displayMusicList = playingMusicList;
        // }

        this.setData({
          displayMusicList,
          playingMusicCurrent,
        })
      }


      // 查询当前播放歌曲的url 用于点击进入songDetail使用，可以避免进去后再次查询url导致歌曲重置
      if (playingMusicList.length != 0 && this.data.playingMusicIndex != -1) {
        musicUrl = await localRequest('/getSongDetail', { ids: playingMusicList[this.data.playingMusicIndex].id, br: 320000 });
        musicUrl = musicUrl.songs.url;
      }
      // 监听音乐自然播放结束
      this.backgroundAudioManager = wx.getBackgroundAudioManager()
      this.backgroundAudioManager.onPlay(() => {
        this.changePlayState(true)
      })
      this.backgroundAudioManager.onPause(() => {
        this.changePlayState(false)
      })
      this.backgroundAudioManager.onStop(() => {
        this.changePlayState(false)
      })
      this.backgroundAudioManager.onEnded(() => {
        let playingMusicIndex = this.data.playingMusicIndex + 1;
        this.handleMusicSwitch(playingMusicIndex)
      })
    },

    hide: function () {
      // 页面被隐藏
    },
    resize: function (size) {
      // 页面尺寸变化
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 修改播放状态的功能函数
    changePlayState(isPlay) {
      this.setData({
        isPlay
      })
      // 修改全局播放音乐的状态
      app.globalData.isMusicPlay = isPlay;
    },

    // 处理音乐的播放与暂停
    handleMusicPlay(e) {
      this.backgroundAudioManager = wx.getBackgroundAudioManager();
      // console.log(e);
      // console.log(this.data.isPlay);
      if (playingMusicList.length == 0) {
        return
      }
      if (this.data.isPlay == true) {
        // console.log(1);
        this.backgroundAudioManager.pause()
      } else {
        if (this.backgroundAudioManager.src) {
          this.backgroundAudioManager.play()
        } else {
          this.handleMusicSwitch(this.data.playingMusicIndex)
        }
      }
      let isPlay = !this.data.isPlay
      this.setData({
        isPlay
      })
      app.globalData.isPlay = isPlay;
    },

    // 处理切歌
    async changeMusic(event) {
      // console.log(event);
      this.backgroundAudioManager = wx.getBackgroundAudioManager();
      // 避免切换页面时更新bottomControl数据引起的切歌 还执行暂停，导致歌曲不流畅
      if (event.detail.source != "") {
        // 先暂停音乐，提升用户体验
        this.backgroundAudioManager.pause()
      }

      // 切换到的歌曲的索引
      // console.log(event);
      // type为上一首还是下一首，用于解决src不可用时决定再往前跳转还是往后跳转一首
      let type = 0;
      if (event.currentTarget.dataset.type == 'click') {
        // var current = event.currentTarget.dataset.index
        // console.log(playingMusicList);
        var current = playingMusicList.findIndex(item => item.id == event.currentTarget.dataset.musicid)
        this.setData({
          showList: 58
        })
        type = 1;
      } else if (event.currentTarget.dataset.type == 'swiper') {
        // console.log('swiper', event);
        if (event.detail.source != 'touch') {
          if (this.data.isPlay)
            this.backgroundAudioManager.play()
          return
        }
        // current为即将播放的歌曲在歌单中的索引
        var current = 0
        let displayMusicList = this.data.displayMusicList
        // 判断切换到上一首还是下一首
        if (playingMusicCurrent - event.detail.current == 2 || playingMusicCurrent - event.detail.current == -1) {
          current = this.data.playingMusicIndex + 1;
          playingMusicCurrent = playingMusicCurrent + 1 == 3 ? 0 : playingMusicCurrent + 1;
          type = 1;
        }
        else if (playingMusicCurrent - event.detail.current == -2 || playingMusicCurrent - event.detail.current == 1) {
          current = this.data.playingMusicIndex - 1;
          playingMusicCurrent = playingMusicCurrent - 1 == -1 ? 2 : playingMusicCurrent - 1
          type = -1;
        }

        // 将当前的playingMusicCurrent存入本地
        wx.setStorageSync('playingMusicCurrent', playingMusicCurrent)

        // 对current为-1或大于playingMusicList的长度的情况做处理
        current = current == -1 ? playingMusicList.length - 1 : current;
        current = current == playingMusicList.length ? 0 : current;

      }
      // console.log(current);
      // console.log('length', this.data.displayMusicList.length);
      await this.handleMusicSwitch(current, type)
      // this.controlDisplayMusicList()
    },

    async handleMusicSwitch(current, type) {
      // console.log(playingMusicList);
      // console.log(current);
      musicUrl = await localRequest('/getSongDetail', { ids: playingMusicList[current].id, br: 320000 });
      app.globalData.musicId = playingMusicList[current].id
      musicUrl = musicUrl.songs.url
      // console.log(musicUrl);
      // console.log(musicUrl);
      // 如果该歌曲不可播放，则直接进入下一首
      if (musicUrl == null) {
        if (type == -1) {
          wx.showToast({
            title: '无法播放该歌曲，已自动为您切换到上一首',
            icon: 'none',
          })
        } else if (type == 1) {
          wx.showToast({
            title: '无法播放该歌曲，已自动为您切换到下一首',
            icon: 'none',
          })
        }
        this.handleMusicSwitch(current + type, type);
        return;
      }
      this.backgroundAudioManager.title = playingMusicList[current].name;
      this.backgroundAudioManager.src = musicUrl;

      let displayMusicList = this.data.displayMusicList;
      displayMusicList[playingMusicCurrent] = playingMusicList[current]
      displayMusicList[playingMusicCurrent + 1 == displayMusicList.length ? 0 : playingMusicCurrent + 1] = playingMusicList[current + 1 == playingMusicList.length ? 0 : current + 1]
      displayMusicList[playingMusicCurrent - 1 == -1 ? displayMusicList.length - 1 : playingMusicCurrent - 1] = playingMusicList[current - 1 == -1 ? playingMusicList.length - 1 : current - 1]
      this.setData({
        playingMusicIndex: current,
        isPlay: true,
        displayMusicList,
      })
      // 将displayMusicList保存到stroage中，每次onshow时读取，以保证每个页面的bottomControl数据一致
      wx.setStorageSync('displayMusicList', displayMusicList);

      // 将当前播放歌曲的id存入本地
      wx.setStorageSync('playingMusicId', playingMusicList[current].id);
      // 更新app.js中的索引
      wx.setStorageSync('playingMusicIndex', current)
      app.globalData.isPlay = true;
    },


    // 跳转至点击歌曲的详情页面
    async toSongDetail(event) {
      this.backgroundAudioManager = wx.getBackgroundAudioManager();
      let { song, musiclist } = event.currentTarget.dataset;
      wx.setStorageSync('musicListId', musiclist)
      wx.setStorageSync('playingMusicId', song)
      wx.setStorageSync('musicUrl', musicUrl)
      // this.backgroundAudioManager.pause()
      wx.navigateTo({
        url: '/pages/songDetail/songDetail?song=' + JSON.stringify(song) + '&type=components'
      })
    },

    // 处理playingMusicList数据
    async controlShowListData() {
      // console.log(this.data.playingMusicIndex);
      // 找到当前索引
      let idx = this.data.playingMusicIndex
      let pre = 0;
      let next = 0;
      if (idx > 20) {
        pre = 20
      } else {
        pre = idx
      }
      if (playingMusicList.length - 1 - idx > 20) {
        next = 20
      } else {
        next = playingMusicList.length - 1 - idx
      }
      let showListData = playingMusicList.slice(idx - pre, idx + next);
      await this.setData({
        showListData,
      })
      // 和上面列表放在一起可能会在渲染好列表前就设置了位置，导致不滚动
      this.setData({
        scrollPosition: pre,
      })
    },

    // 滑动列表到顶或者到底
    addTopDisplayList() {
      if (this.data.showListData[0]) {
        let idx = playingMusicList.findIndex(item => item.id == this.data.showListData[0].id)
        if (idx > 0) {
          let addData = [];
          let showListData = this.data.showListData;
          if (idx > 20) {
            addData = playingMusicList.slice(idx - 20, idx - 1);
          } else {
            addData = playingMusicList.slice(0, idx - 1);
          }
          showListData.unshift(...addData);
          this.setData({
            showListData,
            scrollPosition: 20,
          })
        }
      }
    },
    addBottomDisplayList() {
      let idx = playingMusicList.findIndex(item => item.id == this.data.showListData[this.data.showListData.length - 1].id)
      if (idx < playingMusicList.length - 1) {
        let addData = [];
        let showListData = this.data.showListData;
        if (playingMusicList.length - 1 - idx > 20) {
          addData = playingMusicList.slice(idx + 1, idx + 20);
        } else {
          addData = playingMusicList.slice(idx + 1, playingMusicList.length - 1);
        }
        showListData.push(...addData);
        this.setData({
          showListData
        })
      }
    },




    // 显示与隐藏歌单列表
    showMusicList() {
      this.controlShowListData()
      this.setData({
        // showListData: showListData,
        showList: 0,
      })
    },

    // 处理点击遮罩层触发的事件(隐藏歌单列表)
    hideMusicList() {
      const that = this;
      this.setData({
        showListData: [],
        showList: 58,
      })
    },


  }
})
