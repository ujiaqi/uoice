
import moment from 'moment'

// pages/songDetail/songDetail.js
import request from '../../utils/request'
import localRequest from '../../utils/localRequest'
// 获取全局实例
const app = getApp();
const backgroundAudioManager = wx.getBackgroundAudioManager()


// 实时时间的毫秒数(用于计算当前歌词的位置)
let originCurrentTime = 0;
// 总时长的毫秒数(用于计算进度条宽度)
let dt = 0;
// 当前歌单id
let musicListId = '';
// 音乐的链接
let musicLink = '';
// 当前播放歌曲的id
let musicId = '';
// 当前播放音乐的索引
let playingMusicIndex = 0;
// 用户喜欢的音乐的列表
let likeList = [];
// 当前播放的音乐列表
let playingMusicList = [];
// 碟子swiper的索引
let discSwiperIndex = 0;


Page({

  /**
   * 页面的初始数据
   */
  // 如果不渲染到视图层，尽量不要放在data中
  data: {
    isPlay: false,
    musicInfo: {},
    // 当前机型的状态栏高度
    barHeight: 0,
    // 实时时间
    currentTime: '00:00',
    // 总时长
    durationTime: '00:00',
    // 进度条实时宽度
    currentWidth: 0,
    // 当前播放歌单
    // playingMusicList: [],
    // 显示歌单列表
    showList: 58,
    // 是否显示歌词
    isLyricsShow: false,
    // 存放歌词
    lyrics: [['Tip', '正在加载歌词']],
    // 当前歌词位置索引
    lyricsIndex: 0,
    // 是否喜欢当前音乐
    isLike: false,
    displayMusicList: [],
    // 音乐列表滑动到的位置
    scrollPosition: 0,
    // 用于切歌时重置动画, true代表加载完成，false代表未完成，
    //  可以通过加载存在时间间隔达到删除并重置动画类名从而重置动画的效果
    switchMusicAnimationState: true,
    // 碟子的swiper
    discSwiper: [[], [], []],
    // 指针是否是播放状态
    isNeedlePlay: false,
    // 碟子当前swiper-item的索引
    discSwiperIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    playingMusicList = [];
    discSwiperIndex = 0;
    // console.log(options);
    this.setData({
      isPlay: app.globalData.isPlay,
      isNeedlePlay: app.globalData.isPlay,
      displayMusicList: [],
    })

    // console.log('musicId', app.globalData.musicId);
    // console.log('options.song', options.song);

    // 判断正在播放音乐id和当前页面id是否一致
    // 当musicid为空时，在getMusicInfo中会进行赋值
    musicId = app.globalData.musicId;

    if (musicId == options.song) {
      // console.log('相同');
      backgroundAudioManager.play()
      // 重置播放状态为true
      app.globalData.isPlay = true
      // console.log('执行了这里');
    } else {
      backgroundAudioManager.pause()
    }

    // 获取当前机型的状态栏高度
    wx.getSystemInfo({
      success: e => {
        let barheight = e.statusBarHeight; //状态栏高
        // console.log(e.statusBarHeight);
        this.setData({
          barHeight: barheight
        })
      }
    })




    // 获取音乐列表
    if (options.type == 'components') {
      playingMusicList = wx.getStorageSync('playingMusicList')
      this.setData({
        displayMusicList: []
      })
    } else if (options.type == 'searchList') {
      // 如果是搜索列表的歌曲，就不用请求列表了，直接把歌曲插入到当前的歌单中
      // 从全局拿到当前的播放歌单 以及 当前播放歌曲的索引
      // let playingMusicList = app.globalData.playingMusicList;
      playingMusicList = wx.getStorageSync('playingMusicList')
      playingMusicIndex = wx.getStorageSync('playingMusicIndex');
      // 向查询音乐id，再将查询到的临时musicInfo插入到playingMusicList中
      let info = await localRequest('/getSongDetail"', { ids: options.song })
      info = info.songs
      // console.log(info);
      // 判断搜索歌曲是否已经在歌单中存在了 不存在就将当前音乐插入歌单，存在就不做操作
      if (!playingMusicList.some(item => { return item.id == info.id })) {
        // console.log(info.id);
        playingMusicList.splice(playingMusicIndex + 1, 0, info)
      }

    }
    else {
      // 从musicList页面，recommend页面， personal页面进入songDetial页面均直接从storage中读取playingMusicList
      // console.log(165);
      playingMusicList = wx.getStorageSync('playingMusicList')
    }
    // 获取当前播放歌曲索引
    this.getPlayingMusicIndex(options.song)

    // 获取musicInfo
    await this.getMusicInfo(options.song)
    musicId = options.song

    // 渲染碟子swiper
    let discSwiper = this.data.discSwiper;
    if (playingMusicList.length >= 3) {
      discSwiper[discSwiperIndex - 1 == -1 ? discSwiper.length - 1 : discSwiperIndex - 1] = playingMusicList[wx.getStorageSync('playingMusicIndex') - 1 == -1 ? playingMusicList.length - 1 : wx.getStorageSync('playingMusicIndex') - 1]
      discSwiper[discSwiperIndex] = playingMusicList[wx.getStorageSync('playingMusicIndex')]
      discSwiper[discSwiperIndex + 1 == discSwiper.length ? 0 : discSwiperIndex + 1] = playingMusicList[wx.getStorageSync('playingMusicIndex') + 1 == playingMusicList.length ? 0 : wx.getStorageSync('playingMusicIndex') + 1]
    } else {
      discSwiper = playingMusicList;
    }

    this.setData({
      discSwiper,
    })

    // 判断当前的页面音乐是否在播放
    if (app.globalData.isPlay && app.globalData.musicId === options.song) {
      // 修改当前页面的播放状态为true
      this.setData({
        isPlay: true,
        isNeedlePlay: true,
      })
    }

    // 创建控制音乐播放的实例对象
    // 通过this将实例变为页面的属性
    backgroundAudioManager.onPlay(() => {
      this.changePlayState(true);

      // 修改全局音乐播放的id
      // app.globalData.musicId = options.song;
    })
    backgroundAudioManager.onPause(() => {
      this.changePlayState(false)
    })
    backgroundAudioManager.onStop(() => {
      this.changePlayState(false)
    })
    // 监听音乐自然播放结束
    backgroundAudioManager.onEnded(() => {
      // 自动切换至下一首音乐并自动播放
      // PubSub.publish('switchType', 'next')
      backgroundAudioManager.stop()

      this.switchMusic(1)

      // 将进度条的长度和实时播放时间还原成0
      this.setData({
        currentWidth: 0,
        currentTime: '00:00',
        lyrics: [['Tip', '正在加载歌词']],
        lyricsIndex: 0,
        isLyricsShow: false,
        showList: 58,
      })
    })

    // 监听音乐实时播放进度
    let lastTime = 0;
    let currentWidth = 0;
    backgroundAudioManager.onTimeUpdate(() => {
      // console.log(backgroundAudioManager.currentTime);
      // 格式化实时的播放时间
      let currentTime = moment(backgroundAudioManager.currentTime * 1000).format('mm:ss')
      // 保存原有秒数时间
      originCurrentTime = backgroundAudioManager.currentTime
      // let that = this;
      // console.log(lastTime);
      // console.log(currentTime);
      // console.log(currentTime);

      // 根据实时播放时间实现歌词滚动
      // console.log(backgroundAudioManager.currentTime);
      if (this.data.lyricsIndex < this.data.lyrics.length) {
        if (backgroundAudioManager.currentTime >= this.data.lyrics[this.data.lyricsIndex][0]) {
          let lyricsIndex = this.data.lyricsIndex + 1
          this.setData({
            lyricsIndex,
          })
        }
      }

      // 节流，每秒setData一次
      if (lastTime != currentTime) {
        // console.log(currentTime);
        // console.log(lastTime);
        // 百分比乘100 前面是秒 后面是毫秒，再乘1000
        // console.log('执行了243行');
        currentWidth = backgroundAudioManager.currentTime / dt * 100000;
        // console.log(currentWidth);
        this.setData({
          currentTime,
          currentWidth,
          // originCurrentTime
        })
        lastTime = currentTime;
      }


    })

    // 在onload结束后将playingMusicList和playingMusicIndex存储到本地
    wx.setStorageSync('playingMusicIndex', playingMusicIndex)
    wx.setStorageSync('playingMusicList', playingMusicList)

    this.getIsLike()

  },

  // 修改播放状态的功能函数
  changePlayState(isPlay) {
    this.setData({
      isPlay,
      isNeedlePlay: isPlay,
    })
    // 修改全局播放音乐的状态
    app.globalData.isPlay = isPlay;
  },

  // 点击播放/暂停的回调
  handleMusicPlay() {
    let isplay = !this.data.isPlay
    // this.setData({
    //   isPlay: !this.data.isPlay
    // })
    this.musicControl(isplay, musicId, musicLink);
  },

  // 查询歌曲详细信息
  async getMusicInfo(id) {
    this.setData({
      switchMusicAnimationState: false,
    })
    let musicInfo = await localRequest('/getSongDetail', { ids: id })
    // console.log(musicInfo.songs[0].id);

    // dt的单位是毫秒，通过第三方库moment转换格式
    let durationTime = moment(musicInfo.songs.dt).format('mm:ss');
    dt = musicInfo.songs.dt
    this.setData({
      musicInfo: musicInfo.songs,
      durationTime,
      switchMusicAnimationState: true
      // isLike: musicInfo.isLike,
      // dt: musicInfo.songs[0].dt,
    })

    // != 比较时，若类型不同，会偿试转换类型。
    // !== 只有相同类型才会比较
    // 如果id不相同 自动播放这首音乐
    if (musicId != musicInfo.songs.id || musicId == '') {
      // console.log('执行了这里');
      this.musicControl(true, musicInfo.songs.id)
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
      musicId = musicInfo.songs.id
      app.globalData.musicId = musicId
    }

    // 第一次执行没有playingMusicList的数据，在获取到playingMusicList之后再执行getPlayingMusicIndex
    if (playingMusicList.length != 0) {
      this.getPlayingMusicIndex(this.data.musicInfo.id)
      wx.setStorageSync('playingMusicIndex', playingMusicIndex)
      wx.setStorageSync('playingMusicList', playingMusicList)
    }

  },


  //控制音乐播放/暂停的函数
  async musicControl(isPlay, id, link) {
    if (isPlay) {
      if (!link) {
        console.log('执行了musicControl');
        // 获取音乐播放链接
        let musicLinkData = await localRequest('/getSongDetail', { ids: id, br: 320000 })
        // 音乐播放链接
        musicLink = musicLinkData.songs.url;

        if (musicLink == null) {
          wx.showToast({
            title: '无法播放该歌曲，已自动为您切换到下一首',
            icon: 'none',
            success: () => {
              // 切换到下一首
              this.switchMusic(1)
            }
          })
          return
        }

        backgroundAudioManager.title = this.data.musicInfo.name
        // console.log(musicLink);
        backgroundAudioManager.src = musicLink;
      }
      backgroundAudioManager.play()
    } else {
      // 暂停
      backgroundAudioManager.pause()
    }
  },

  // 点击切歌的回调
  async handleSwitch(event) {
    // if (!type) {
    // 获取切歌的类型
    let type = event.currentTarget.dataset.type;
    // }
    // console.log(type);
    // 关闭当前播放的音乐
    backgroundAudioManager.stop()

    if (type == 'next') {
      this.switchMusic(1)
    }
    else if (type == 'pre') {
      this.switchMusic(-1)
    } else if (type == 'click') {
      // displayMusicList的数据是动态的，导致index的数据也是实时变化的，所以不能直接赋值
      // playingMusicIndex = event.currentTarget.dataset.index;
      // 可以用id找对应的索引
      playingMusicIndex = playingMusicList.findIndex(item => {
        return item.id == event.currentTarget.dataset.musicid
      })

      app.globalData.musicId = event.currentTarget.dataset.musicid
      // 先关闭歌词页面，提升用户体验
      this.setData({
        currentWidth: 0,
        currentTime: '00:00',
        lyrics: [['Tip', '正在加载歌词']],
        lyricsIndex: 0,
        isLyricsShow: false,
        showList: 58,
        discSwiper: [[], [], []]
      })

      let discSwiper = this.data.discSwiper;
      discSwiper[discSwiperIndex - 1 == -1 ? 2 : discSwiperIndex - 1] = playingMusicList[playingMusicIndex - 1 == -1 ? playingMusicList.length - 1 : playingMusicIndex - 1]
      discSwiper[discSwiperIndex] = playingMusicList[playingMusicIndex]
      discSwiper[discSwiperIndex + 1 == 3 ? 0 : discSwiperIndex + 1] = playingMusicList[playingMusicIndex + 1 == playingMusicList.length ? 0 : playingMusicIndex + 1]
      this.setData({
        discSwiper,
      })

      // console.log(event.currentTarget);
      await this.getMusicInfo(event.currentTarget.dataset.musicid)
      this.musicControl(true, event.currentTarget.dataset.musicid);

      this.getIsLike()
      // this.setData({

      wx.setStorageSync('playingMusicIndex', playingMusicIndex)
      wx.setStorageSync('playingMusicList', playingMusicList)
    }
  },

  // 滑动碟子切歌的回调
  swiperDisc(event) {
    // 判断切换到上一首还是下一首
    this.setData({
      isPlay: false,
      musicInfo: {},
    })
    console.log('触发了这里');
    backgroundAudioManager.pause()
    if (discSwiperIndex - event.detail.current == 2 || discSwiperIndex - event.detail.current == -1) {
      discSwiperIndex = discSwiperIndex + 1 == 3 ? 0 : discSwiperIndex + 1;
      this.switchMusic(1)
    }
    else if (discSwiperIndex - event.detail.current == -2 || discSwiperIndex - event.detail.current == 1) {
      discSwiperIndex = discSwiperIndex - 1 == -1 ? 2 : discSwiperIndex - 1
      this.switchMusic(-1)
    }
  },

  // 移动碟子时的回调
  moveSwiperItem() {
    // console.log('拖动swiperItem');
    if (this.data.isNeedlePlay == true) {
      this.setData({
        isNeedlePlay: false,
      })
    }
  },

  moveSwiperItemEnd() {
    if (this.data.isNeedlePlay == false && this.data.isPlay == true) {
      this.setData({
        isNeedlePlay: true
      })
    }
  },



  // 实现切歌的逻辑
  // 第一个参数为 1或-1 表示上一首或下一首
  async switchMusic(n) {
    console.log('切歌前', playingMusicIndex);
    playingMusicIndex = playingMusicIndex + n;
    console.log('切歌后', playingMusicIndex);
    // 先关闭歌词页面，提升用户体验
    this.setData({
      currentWidth: 0,
      currentTime: '00:00',
      lyrics: [['Tip', '正在加载歌词']],
      lyricsIndex: 0,
      isLyricsShow: false,
      showList: 58,
    })
    // if(playingMusicIndex<0)
    playingMusicIndex = playingMusicIndex < 0 ? playingMusicList.length - 1 : playingMusicIndex;
    playingMusicIndex = playingMusicIndex > playingMusicList.length - 1 ? 0 : playingMusicIndex;

    // 更新discSwiper
    let discSwiper = this.data.discSwiper;
    discSwiper[discSwiperIndex - 1 == -1 ? discSwiper.length - 1 : discSwiperIndex - 1] = playingMusicList[playingMusicIndex - 1 == -1 ? playingMusicList.length - 1 : playingMusicIndex - 1]
    discSwiper[discSwiperIndex] = playingMusicList[playingMusicIndex]
    discSwiper[discSwiperIndex + 1 == discSwiper.length ? 0 : discSwiperIndex + 1] = playingMusicList[playingMusicIndex + 1 == playingMusicList.length ? 0 : playingMusicIndex + 1]
    this.setData({
      discSwiper,
      discSwiperIndex,
    })

    // 请求需要一定时间，所以先执行discSwiper的数据更新
    let nextMusicId = playingMusicList[playingMusicIndex].id;
    app.globalData.musicId = nextMusicId
    // musicinfo中判断如果传入id与当前播放id不同时会调用musicControl播放下一首
    await this.getMusicInfo(nextMusicId);
    console.log(app.globalData.musicId);
    // await this.musicControl(true, nextMusicId);

    this.getIsLike()
    // this.controlDisplayList()
  },

  // 拖动进度条动作结束后的回调
  async handleSliderChange(e) {
    // console.log(e);
    // console.log(e.detail.value);
    await backgroundAudioManager.pause()
    let progress = e.detail.value / 100;
    // 计算拖动进度后的当前播放时间(毫秒)
    let time = dt * progress;
    backgroundAudioManager.seek(time / 1000)
    let currentTime = moment(time).format('mm:ss');
    // console.log(currentTime);

    // 处理播放时间跳转时歌词位置的校准
    if (this.data.lyrics.length > 1) {
      this.getCurrentLyricsIndex(time / 1000);
    }

    this.setData({
      currentTime,
      currentWidth: e.detail.value,
    })

    await backgroundAudioManager.play()

  },

  // 处理播放时间跳转时歌词位置的校准
  getCurrentLyricsIndex(time) {
    if (time > this.data.lyrics[this.data.lyrics.length - 1][0]) {
      this.setData({
        lyricsIndex: this.data.lyrics.length + 2
      })
      return;
    }
    let lyricsIndex = this.data.lyrics.findIndex(item => {
      return time <= item[0]
    })
    this.setData({
      lyricsIndex,
    })
  },

  // 获取当前播放歌曲在歌单中的索引
  getPlayingMusicIndex(musicId) {
    playingMusicIndex = playingMusicList.findIndex(item => { return item.id == musicId })
  },

  // 显示歌单列表
  async showMusicList() {
    this.controlDisplayList()
    this.setData({
      showList: 0
    })
  },

  // 点击遮罩层 隐藏歌单列表
  hideMusicList() {
    this.setData({
      showList: 58,
      displayMusicList: [],
    })
  },

  //切换歌词和转盘显示
  async switchShow() {
    let isLyricsShow = !this.data.isLyricsShow
    // 先显示默认的正在加载歌词，提升用户体验
    this.setData({
      isLyricsShow
    })

    if (isLyricsShow == true && this.data.lyrics.length <= 1) {
      // 获取歌词
      let lyrics = await localRequest('/getSongDetail', { ids: this.data.musicInfo.id })
      // console.log(lyrics);
      // 对获取的歌词数据进行处理
      lyrics = lyrics.songs.lyric;
      let arr = lyrics.split("\n")
      let array = [];
      // let obj = {};
      let time = '';
      let value = '';
      let result = [];

      //去除空行
      arr.forEach(item => {
        if (item != '') {
          array.push(item)
        }
      })

      arr = array

      arr.forEach(item => {
        time = item.split(']')[0]
        value = item.split(']')[1]
        //去掉时间里的中括号得到xx:xx.xx
        var t = time.slice(1).split(':');
        //将结果压入最终数组
        result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
      });

      // console.log(result);
      this.setData({
        lyrics: result
      })

      // 解决在获取歌词之前跳转导致歌词索引不再是0的问题
      if (isLyricsShow == true) {
        this.getCurrentLyricsIndex(originCurrentTime)
      }

    }


    // 为了解决从碟子界面切换到歌词时歌词scroll-view没有立即滑动到对应位置，
    // 在切换时重新赋值一次lyricsIndex
    if (isLyricsShow == true) {
      this.setData({
        lyricsIndex: this.data.lyricsIndex
      })

    }
  },

  // 控制可显示的列表数据，不超过50条
  async controlDisplayList(song) {
    let songId = musicId;
    if (songId == '') {
      songId = song
    }
    // 找到当前索引
    let idx = playingMusicList.findIndex(item => item.id == songId)
    // console.log('idx', idx);
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
    // console.log(pre, next);
    // console.log(playingMusicList);
    let displayMusicList = playingMusicList.slice(idx - pre, idx + next + 1);
    // console.log(idx);
    // console.log(playingMusicList);
    await this.setData({
      displayMusicList,
    })
    // 和上面列表放在一起可能会在渲染好列表前就设置了位置，导致不滚动
    this.setData({
      scrollPosition: pre
    })
    // console.log(pre);
  },

  // 滑动列表到顶或者到底
  addTopDisplayList() {
    if (this.data.displayMusicList[0]) {
      let idx = playingMusicList.findIndex(item => item.id == this.data.displayMusicList[0].id)
      if (idx > 0) {
        let addData = [];
        let displayMusicList = this.data.displayMusicList;
        if (idx > 20) {
          addData = playingMusicList.slice(idx - 20, idx - 1);
        } else {
          addData = playingMusicList.slice(0, idx - 1);
        }
        displayMusicList.unshift(...addData);
        this.setData({
          displayMusicList,
          scrollPosition: idx,
        })
      }
    }
  },
  addBottomDisplayList() {
    let idx = playingMusicList.findIndex(item => item.id == this.data.displayMusicList[this.data.displayMusicList.length - 1].id)
    if (idx < playingMusicList.length - 1) {
      let addData = [];
      let displayMusicList = this.data.displayMusicList;
      if (playingMusicList.length - 1 - idx > 20) {
        addData = playingMusicList.slice(idx + 1, idx + 20);
      } else {
        addData = playingMusicList.slice(idx + 1, playingMusicList.length);
      }
      // console.log(displayMusicList, addData);
      displayMusicList.push(...addData);
      this.setData({
        displayMusicList
      })
    }
  },

  // 喜欢或取消喜欢该音乐
  async like() {
    this.setData({
      isLike: !this.data.isLike
    })
    // 喜欢该音乐
    request('/like', { id: musicId, like: this.data.isLike })
    // console.log(result);
    // console.log(result);
    // 修改likeList 从喜欢列表中添加或删除当前id
    if (this.data.isLike) {
      likeList.push(musicId)
    } else {
      let index = likeList.findIndex(item => {
        return item == musicId
      })
      likeList.splice(index, 1)
    }
    // 存入全局变量
    app.globalData.likeList = likeList
  },

  // 获取用户喜欢的音乐的列表
  // 短时间多次请求会引起服务器缓存，请求后数据在本地操作以解决
  // 注意：手机如果喜欢功能不正常，可以试一下重新登录，可能是因为存在本地的userId丢了
  async getLikeList() {
    let userId = wx.getStorageSync('userId')
    let result;
    if (app.globalData.likeList.length == 0) {
      result = await request('/likelist', { uid: userId })
      console.log(result);
      // likeList = result.ids;
      // 存入全局变量
      app.globalData.likeList = likeList
    } else {
      return;
    }
    // console.log('执行了getlikelist');
  },

  // 判断登录用户是否喜欢该音乐
  async getIsLike() {

    if (wx.getStorageSync('userId')) {
      // console.log(musicId);
      if (app.globalData.likeList.length == 0) {
        await this.getLikeList()
      }
      likeList = app.globalData.likeList;
      // console.log(likeList);
      let flag = likeList.find(item => {
        // console.log(item);
        return item == musicId
      })
      // 如果用相同的id，find返回该id值
      // console.log(flag)
      if (flag == undefined) {
        this.setData({
          isLike: false,
        })
      } else {
        this.setData({
          isLike: true
        })
      }
    }
  },

  // 进入评论页面
  toComments() {
    wx.navigateTo({
      url: '/pages/comment/comment?musicid=' + musicId
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
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

    // app.getExitInfo();
    // 退出改页面时，保存该页面的播放信息：当前播放歌单id、是否播放、当前播放歌曲在歌单中的索引、当前歌单的信息数组
    app.globalData.musicListId = musicListId
    app.globalData.isPlay = this.data.isPlay
    // 重置bottomCibtrol存在storage中的playingMusicCurrent和displayMusicList，让他获取最新的数据
    wx.setStorageSync('playingMusicCurrent', 0);
    wx.setStorageSync('displayMusicList', [])
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







// import moment from 'moment'

// // pages/songDetail/songDetail.js
// import request from '../../utils/request'
// import localRequest from '../../utils/localRequest'
// // 获取全局实例
// const app = getApp();
// const backgroundAudioManager = wx.getBackgroundAudioManager()


// // 实时时间的毫秒数(用于计算当前歌词的位置)
// let originCurrentTime = 0;
// // 总时长的毫秒数(用于计算进度条宽度)
// let dt = 0;
// // 当前歌单id
// let musicListId = '';
// // 音乐的链接
// let musicLink = '';
// // 当前播放歌曲的id
// let musicId = '';
// // 当前播放音乐的索引
// let playingMusicIndex = 0;
// // 用户喜欢的音乐的列表
// let likeList = [];
// // 当前播放的音乐列表
// let playingMusicList = [];
// // 碟子swiper的索引
// let discSwiperIndex = 0;


// Page({

//   /**
//    * 页面的初始数据
//    */
//   // 如果不渲染到视图层，尽量不要放在data中
//   data: {
//     isPlay: false,
//     musicInfo: {},
//     // 当前机型的状态栏高度
//     barHeight: 0,
//     // 实时时间
//     currentTime: '00:00',
//     // 总时长
//     durationTime: '00:00',
//     // 进度条实时宽度
//     currentWidth: 0,
//     // 当前播放歌单
//     // playingMusicList: [],
//     // 显示歌单列表
//     showList: 58,
//     // 是否显示歌词
//     isLyricsShow: false,
//     // 存放歌词
//     lyrics: [['Tip', '正在加载歌词']],
//     // 当前歌词位置索引
//     lyricsIndex: 0,
//     // 是否喜欢当前音乐
//     isLike: false,
//     displayMusicList: [],
//     // 音乐列表滑动到的位置
//     scrollPosition: 0,
//     // 用于切歌时重置动画, true代表加载完成，false代表未完成，
//     //  可以通过加载存在时间间隔达到删除并重置动画类名从而重置动画的效果
//     switchMusicAnimationState: true,
//     // 碟子的swiper
//     discSwiper: [[], [], []],
//     // 指针是否是播放状态
//     isNeedlePlay: false,
//     // 碟子当前swiper-item的索引
//     discSwiperIndex: 0,
//   },

//   /**
//    * 生命周期函数--监听页面加载
//    */
//   onLoad: async function (options) {
//     playingMusicList = [];
//     discSwiperIndex = 0;
//     // console.log(options);
//     this.setData({
//       isPlay: app.globalData.isPlay,
//       isNeedlePlay: app.globalData.isPlay,
//       displayMusicList: [],
//     })

//     // console.log('musicId', app.globalData.musicId);
//     // console.log('options.song', options.song);

//     // 判断正在播放音乐id和当前页面id是否一致
//     // 当musicid为空时，在getMusicInfo中会进行赋值
//     musicId = app.globalData.musicId;

//     if (musicId == options.song) {
//       // console.log('相同');
//       backgroundAudioManager.play()
//       // 重置播放状态为true
//       app.globalData.isPlay = true
//       // console.log('执行了这里');
//     } else {
//       backgroundAudioManager.pause()
//     }

//     // 获取当前机型的状态栏高度
//     wx.getSystemInfo({
//       success: e => {
//         let barheight = e.statusBarHeight; //状态栏高
//         // console.log(e.statusBarHeight);
//         this.setData({
//           barHeight: barheight
//         })
//       }
//     })




//     // 获取音乐列表
//     if (options.type == 'components') {
//       playingMusicList = wx.getStorageSync('playingMusicList')
//       this.setData({
//         displayMusicList: []
//       })
//     } else if (options.type == 'searchList') {
//       // 如果是搜索列表的歌曲，就不用请求列表了，直接把歌曲插入到当前的歌单中
//       // 从全局拿到当前的播放歌单 以及 当前播放歌曲的索引
//       // let playingMusicList = app.globalData.playingMusicList;
//       playingMusicList = wx.getStorageSync('playingMusicList')
//       playingMusicIndex = wx.getStorageSync('playingMusicIndex');
//       // 向查询音乐id，再将查询到的临时musicInfo插入到playingMusicList中
//       let info = await localRequest('/getSongDetail', { ids: options.song })
//       console.log(info);
//       info = info.songs
//       // console.log(info);
//       // 判断搜索歌曲是否已经在歌单中存在了 不存在就将当前音乐插入歌单，存在就不做操作
//       if (!playingMusicList.some(item => { return item.id == info.id })) {
//         // console.log(info.id);
//         playingMusicList.splice(playingMusicIndex + 1, 0, info)
//       }

//     }
//     else {
//       // 从musicList页面，recommend页面， personal页面进入songDetial页面均直接从storage中读取playingMusicList
//       // console.log(165);
//       playingMusicList = wx.getStorageSync('playingMusicList')
//     }
//     // 获取当前播放歌曲索引
//     this.getPlayingMusicIndex(options.song)

//     // 获取musicInfo
//     await this.getMusicInfo(options.song)
//     musicId = options.song

//     // 渲染碟子swiper
//     let discSwiper = this.data.discSwiper;
//     if (playingMusicList.length >= 3) {
//       discSwiper[discSwiperIndex - 1 == -1 ? discSwiper.length - 1 : discSwiperIndex - 1] = playingMusicList[wx.getStorageSync('playingMusicIndex') - 1 == -1 ? playingMusicList.length - 1 : wx.getStorageSync('playingMusicIndex') - 1]
//       discSwiper[discSwiperIndex] = playingMusicList[wx.getStorageSync('playingMusicIndex')]
//       discSwiper[discSwiperIndex + 1 == discSwiper.length ? 0 : discSwiperIndex + 1] = playingMusicList[wx.getStorageSync('playingMusicIndex') + 1 == playingMusicList.length ? 0 : wx.getStorageSync('playingMusicIndex') + 1]
//     } else {
//       discSwiper = playingMusicList;
//     }

//     this.setData({
//       discSwiper,
//     })

//     // 判断当前的页面音乐是否在播放
//     if (app.globalData.isPlay && app.globalData.musicId === options.song) {
//       // 修改当前页面的播放状态为true
//       this.setData({
//         isPlay: true,
//         isNeedlePlay: true,
//       })
//     }

//     // 创建控制音乐播放的实例对象
//     // 通过this将实例变为页面的属性
//     backgroundAudioManager.onPlay(() => {
//       this.changePlayState(true);

//       // 修改全局音乐播放的id
//       // app.globalData.musicId = options.song;
//     })
//     backgroundAudioManager.onPause(() => {
//       this.changePlayState(false)
//     })
//     backgroundAudioManager.onStop(() => {
//       this.changePlayState(false)
//     })
//     // 监听音乐自然播放结束
//     backgroundAudioManager.onEnded(() => {
//       // 自动切换至下一首音乐并自动播放
//       // PubSub.publish('switchType', 'next')
//       backgroundAudioManager.stop()

//       this.switchMusic(1)

//       // 将进度条的长度和实时播放时间还原成0
//       this.setData({
//         currentWidth: 0,
//         currentTime: '00:00',
//         lyrics: [['Tip', '正在加载歌词']],
//         lyricsIndex: 0,
//         isLyricsShow: false,
//         showList: 58,
//       })
//     })

//     // 监听音乐实时播放进度
//     let lastTime = 0;
//     let currentWidth = 0;
//     backgroundAudioManager.onTimeUpdate(() => {
//       // console.log(backgroundAudioManager.currentTime);
//       // 格式化实时的播放时间
//       let currentTime = moment(backgroundAudioManager.currentTime * 1000).format('mm:ss')
//       // 保存原有秒数时间
//       originCurrentTime = backgroundAudioManager.currentTime
//       // let that = this;
//       // console.log(lastTime);
//       // console.log(currentTime);
//       // console.log(currentTime);

//       // 根据实时播放时间实现歌词滚动
//       // console.log(backgroundAudioManager.currentTime);
//       if (this.data.lyricsIndex < this.data.lyrics.length) {
//         if (backgroundAudioManager.currentTime >= this.data.lyrics[this.data.lyricsIndex]) {
//           let lyricsIndex = this.data.lyricsIndex + 1
//           this.setData({
//             lyricsIndex,
//           })
//         }
//       }

//       // 节流，每秒setData一次
//       if (lastTime != currentTime) {
//         // console.log(currentTime);
//         // console.log(lastTime);
//         // 百分比乘100 前面是秒 后面是毫秒，再乘1000
//         // console.log('执行了243行');
//         currentWidth = backgroundAudioManager.currentTime / dt * 100000;
//         // console.log(currentWidth);
//         this.setData({
//           currentTime,
//           currentWidth,
//           // originCurrentTime
//         })
//         lastTime = currentTime;
//       }


//     })

//     // 在onload结束后将playingMusicList和playingMusicIndex存储到本地
//     wx.setStorageSync('playingMusicIndex', playingMusicIndex)
//     wx.setStorageSync('playingMusicList', playingMusicList)

//     this.getIsLike()

//   },

//   // 修改播放状态的功能函数
//   changePlayState(isPlay) {
//     this.setData({
//       isPlay,
//       isNeedlePlay: isPlay,
//     })
//     // 修改全局播放音乐的状态
//     app.globalData.isPlay = isPlay;
//   },

//   // 点击播放/暂停的回调
//   handleMusicPlay() {
//     let isplay = !this.data.isPlay
//     // this.setData({
//     //   isPlay: !this.data.isPlay
//     // })
//     this.musicControl(isplay, musicId, musicLink);
//   },

//   // 查询歌曲详细信息
//   async getMusicInfo(id) {
//     this.setData({
//       switchMusicAnimationState: false,
//     })
//     let musicInfo = await localRequest('/getSongDetail', { ids: id })
//     // console.log(musicInfo.songs[0].id);

//     // dt的单位是毫秒，通过第三方库moment转换格式
//     let durationTime = moment(musicInfo.songs.dt).format('mm:ss');
//     console.log("hahahaha"+durationTime);
//     dt = musicInfo.songs.dt
//     this.setData({
//       musicInfo: musicInfo.songs,
//       durationTime,
//       switchMusicAnimationState: true
//       // isLike: musicInfo.isLike,
//       // dt: musicInfo.songs[0].dt,
//     })

//     // != 比较时，若类型不同，会偿试转换类型。
//     // !== 只有相同类型才会比较
//     // 如果id不相同 自动播放这首音乐
//     if (musicId != musicInfo.songs.id || musicId == '') {
//       // console.log('执行了这里');
//       this.musicControl(true, musicInfo.songs.id)
//       this.setData({
//         currentWidth: 0,
//         currentTime: '00:00'
//       })
//       musicId = musicInfo.songs.id
//       app.globalData.musicId = musicId
//     }

//     // 第一次执行没有playingMusicList的数据，在获取到playingMusicList之后再执行getPlayingMusicIndex
//     if (playingMusicList.length != 0) {
//       this.getPlayingMusicIndex(this.data.musicInfo.id)
//       wx.setStorageSync('playingMusicIndex', playingMusicIndex)
//       wx.setStorageSync('playingMusicList', playingMusicList)
//     }

//   },


//   //控制音乐播放/暂停的函数
//   async musicControl(isPlay, id, link) {
//     if (isPlay) {
//       if (!link) {
//         console.log('执行了musicControl');
//         // 获取音乐播放链接
//         let musicLinkData = await localRequest('/getSongDetail', { ids:id, br: 320000 })
//         // 音乐播放链接
//         musicLink = musicLinkData.songs.url;
//         console.log("播放链接"+musicLink);

//         if (musicLink == null) {
//           wx.showToast({
//             title: '无法播放该歌曲，已自动为您切换到下一首',
//             icon: 'none',
//             success: () => {
//               // 切换到下一首
//               this.switchMusic(1)
//             }
//           })
//           return
//         }

//         backgroundAudioManager.title = this.data.musicInfo.name
//         // console.log(musicLink);
//         backgroundAudioManager.src = musicLink;
//       }
//       backgroundAudioManager.play()
//     } else {
//       // 暂停
//       backgroundAudioManager.pause()
//     }
//   },

//   // 点击切歌的回调
//   async handleSwitch(event) {
//     // if (!type) {
//     // 获取切歌的类型
//     let type = event.currentTarget.dataset.type;
//     // }
//     // console.log(type);
//     // 关闭当前播放的音乐
//     backgroundAudioManager.stop()

//     if (type == 'next') {
//       this.switchMusic(1)
//     }
//     else if (type == 'pre') {
//       this.switchMusic(-1)
//     } else if (type == 'click') {
//       // displayMusicList的数据是动态的，导致index的数据也是实时变化的，所以不能直接赋值
//       // playingMusicIndex = event.currentTarget.dataset.index;
//       // 可以用id找对应的索引
//       playingMusicIndex = playingMusicList.findIndex(item => {
//         return item.id == event.currentTarget.dataset.musicid
//       })

//       app.globalData.musicId = event.currentTarget.dataset.musicid
//       // 先关闭歌词页面，提升用户体验
//       this.setData({
//         currentWidth: 0,
//         currentTime: '00:00',
//         lyrics: [['Tip', '正在加载歌词']],
//         lyricsIndex: 0,
//         isLyricsShow: false,
//         showList: 58,
//         discSwiper: [[], [], []]
//       })

//       let discSwiper = this.data.discSwiper;
//       discSwiper[discSwiperIndex - 1 == -1 ? 2 : discSwiperIndex - 1] = playingMusicList[playingMusicIndex - 1 == -1 ? playingMusicList.length - 1 : playingMusicIndex - 1]
//       discSwiper[discSwiperIndex] = playingMusicList[playingMusicIndex]
//       discSwiper[discSwiperIndex + 1 == 3 ? 0 : discSwiperIndex + 1] = playingMusicList[playingMusicIndex + 1 == playingMusicList.length ? 0 : playingMusicIndex + 1]
//       this.setData({
//         discSwiper,
//       })

//       // console.log(event.currentTarget);
//       await this.getMusicInfo(event.currentTarget.dataset.musicid)
//       this.musicControl(true, event.currentTarget.dataset.musicid);

//       this.getIsLike()
//       // this.setData({

//       wx.setStorageSync('playingMusicIndex', playingMusicIndex)
//       wx.setStorageSync('playingMusicList', playingMusicList)
//     }
//   },

//   // 滑动碟子切歌的回调
//   swiperDisc(event) {
//     // 判断切换到上一首还是下一首
//     this.setData({
//       isPlay: false,
//       musicInfo: {},
//     })
//     console.log('触发了这里');
//     backgroundAudioManager.pause()
//     if (discSwiperIndex - event.detail.current == 2 || discSwiperIndex - event.detail.current == -1) {
//       discSwiperIndex = discSwiperIndex + 1 == 3 ? 0 : discSwiperIndex + 1;
//       this.switchMusic(1)
//     }
//     else if (discSwiperIndex - event.detail.current == -2 || discSwiperIndex - event.detail.current == 1) {
//       discSwiperIndex = discSwiperIndex - 1 == -1 ? 2 : discSwiperIndex - 1
//       this.switchMusic(-1)
//     }
//   },

//   // 移动碟子时的回调
//   moveSwiperItem() {
//     // console.log('拖动swiperItem');
//     if (this.data.isNeedlePlay == true) {
//       this.setData({
//         isNeedlePlay: false,
//       })
//     }
//   },

//   moveSwiperItemEnd() {
//     if (this.data.isNeedlePlay == false && this.data.isPlay == true) {
//       this.setData({
//         isNeedlePlay: true
//       })
//     }
//   },



//   // 实现切歌的逻辑
//   // 第一个参数为 1或-1 表示上一首或下一首
//   async switchMusic(n) {
//     console.log('切歌前', playingMusicIndex);
//     playingMusicIndex = playingMusicIndex + n;
//     console.log('切歌后', playingMusicIndex);
//     // 先关闭歌词页面，提升用户体验
//     this.setData({
//       currentWidth: 0,
//       currentTime: '00:00',
//       lyrics: [['Tip', '正在加载歌词']],
//       lyricsIndex: 0,
//       isLyricsShow: false,
//       showList: 58,
//     })
//     // if(playingMusicIndex<0)
//     playingMusicIndex = playingMusicIndex < 0 ? playingMusicList.length - 1 : playingMusicIndex;
//     playingMusicIndex = playingMusicIndex > playingMusicList.length - 1 ? 0 : playingMusicIndex;

//     // 更新discSwiper
//     let discSwiper = this.data.discSwiper;
//     discSwiper[discSwiperIndex - 1 == -1 ? discSwiper.length - 1 : discSwiperIndex - 1] = playingMusicList[playingMusicIndex - 1 == -1 ? playingMusicList.length - 1 : playingMusicIndex - 1]
//     discSwiper[discSwiperIndex] = playingMusicList[playingMusicIndex]
//     discSwiper[discSwiperIndex + 1 == discSwiper.length ? 0 : discSwiperIndex + 1] = playingMusicList[playingMusicIndex + 1 == playingMusicList.length ? 0 : playingMusicIndex + 1]
//     this.setData({
//       discSwiper,
//       discSwiperIndex,
//     })

//     // 请求需要一定时间，所以先执行discSwiper的数据更新
//     let nextMusicId = playingMusicList[playingMusicIndex].id;
//     app.globalData.musicId = nextMusicId
//     // musicinfo中判断如果传入id与当前播放id不同时会调用musicControl播放下一首
//     await this.getMusicInfo(nextMusicId);
//     console.log(app.globalData.musicId);
//     // await this.musicControl(true, nextMusicId);

//     this.getIsLike()
//     // this.controlDisplayList()
//   },

//   // 拖动进度条动作结束后的回调
//   async handleSliderChange(e) {
//     // console.log(e);
//     // console.log(e.detail.value);
//     await backgroundAudioManager.pause()
//     let progress = e.detail.value / 100;
//     // 计算拖动进度后的当前播放时间(毫秒)
//     let time = dt * progress;
//     backgroundAudioManager.seek(time / 1000)
//     let currentTime = moment(time).format('mm:ss');
//     // console.log(currentTime);

//     // 处理播放时间跳转时歌词位置的校准
//     if (this.data.lyrics.length > 1) {
//       this.getCurrentLyricsIndex(time / 1000);
//     }

//     this.setData({
//       currentTime,
//       currentWidth: e.detail.value,
//     })

//     await backgroundAudioManager.play()

//   },

//   // 处理播放时间跳转时歌词位置的校准
//   getCurrentLyricsIndex(time) {
//     console.log(this.data.lyrics)
//     if (time > this.data.lyrics[this.data.lyrics.length - 1][0]) {
      
//       this.setData({
//         lyricsIndex: this.data.lyrics.length + 2
//       })
//       return;
//     }
//     let lyricsIndex = this.data.lyrics.findIndex(item => {
//       return time <= item[0]
//     })
//     this.setData({
//       lyricsIndex,
//     })
//   },

//   // 获取当前播放歌曲在歌单中的索引
//   getPlayingMusicIndex(musicId) {
//     playingMusicIndex = playingMusicList.findIndex(item => { return item.id == musicId })
//   },

//   // 显示歌单列表
//   async showMusicList() {
//     this.controlDisplayList()
//     this.setData({
//       showList: 0
//     })
//   },

//   // 点击遮罩层 隐藏歌单列表
//   hideMusicList() {
//     this.setData({
//       showList: 58,
//       displayMusicList: [],
//     })
//   },

//   //切换歌词和转盘显示
//   // async switchShow() {
//   //   let isLyricsShow = !this.data.isLyricsShow
//   //   // 先显示默认的正在加载歌词，提升用户体验
//   //   this.setData({
//   //     isLyricsShow
//   //   })

//   //   if (isLyricsShow == true && this.data.lyrics.length <= 1) {
//   //     // 获取歌词
//   //     let lyrics = await localRequest('/getSongDetail', { ids: this.data.musicInfo.id })
//   //     console.log(lyrics);
//   //     // 对获取的歌词数据进行处理
//   //     lyrics = lyrics.songs.lyric;
//   //     console.log("获取歌词"+lyrics);
//   //     let arr = lyrics.split("\n")
//   //     let array = [];
//   //     // let obj = {};
//   //     let time = '';
//   //     let value = '';
//   //     let result = [];

//   //     //去除空行
//   //     arr.forEach(item => {
//   //       if (item != '') {
//   //         array.push(item)
//   //       }
//   //     })

//   //     arr = array

//   //     arr.forEach(item => {
//   //       time = item.split(']')[0]
//   //       value = item.split(']')[1]
//   //       //去掉时间里的中括号得到xx:xx.xx
//   //       var t = time.slice(1).split(':');
//   //       //将结果压入最终数组
//   //       result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
//   //     });

//   //     // console.log(result);
//   //     this.setData({
//   //       lyrics: result
//   //     })

//   //     // 解决在获取歌词之前跳转导致歌词索引不再是0的问题
//   //     if (isLyricsShow == true) {
//   //       this.getCurrentLyricsIndex(originCurrentTime)
//   //     }

//   //   }


//   //   // 为了解决从碟子界面切换到歌词时歌词scroll-view没有立即滑动到对应位置，
//   //   // 在切换时重新赋值一次lyricsIndex
//   //   if (isLyricsShow == true) {
//   //     this.setData({
//   //       lyricsIndex: this.data.lyricsIndex
//   //     })

//   //   }
//   // },

//   // // 控制可显示的列表数据，不超过50条
//   // async controlDisplayList(song) {
//   //   let songId = musicId;
//   //   if (songId == '') {
//   //     songId = song
//   //   }
//   //   // 找到当前索引
//   //   let idx = playingMusicList.findIndex(item => item.id == songId)
//   //   // console.log('idx', idx);
//   //   let pre = 0;
//   //   let next = 0;
//   //   if (idx > 20) {
//   //     pre = 20
//   //   } else {
//   //     pre = idx
//   //   }
//   //   if (playingMusicList.length - 1 - idx > 20) {
//   //     next = 20
//   //   } else {
//   //     next = playingMusicList.length - 1 - idx
//   //   }
//   //   // console.log(pre, next);
//   //   // console.log(playingMusicList);
//   //   let displayMusicList = playingMusicList.slice(idx - pre, idx + next + 1);
//   //   // console.log(idx);
//   //   // console.log(playingMusicList);
//   //   await this.setData({
//   //     displayMusicList,
//   //   })
//   //   // 和上面列表放在一起可能会在渲染好列表前就设置了位置，导致不滚动
//   //   this.setData({
//   //     scrollPosition: pre
//   //   })
//   //   // console.log(pre);
//   // },


// // 显示歌单列表
// async showMusicList() {
//   this.controlDisplayList()
//   this.setData({
//     showList: 0
//   })
// },

// // 点击遮罩层 隐藏歌单列表
// hideMusicList() {
//   this.setData({
//     showList: 58,
//     displayMusicList: [],
//   })
// },

// //切换歌词和转盘显示
// async switchShow() {
//   let isLyricsShow = !this.data.isLyricsShow
//   // 先显示默认的正在加载歌词，提升用户体验
//   this.setData({
//     isLyricsShow
//   })

//   if (isLyricsShow == true && this.data.lyrics.length <= 1) {
//     // 获取歌词
//     let lyrics = await localRequest('/getSongDetail', { ids: this.data.musicInfo.id })
//     // console.log(lyrics);
//     // 对获取的歌词数据进行处理
//     lyrics = lyrics.songs.lyric;
//     let arr = lyrics.split("\r\n")
//     let array = [];
//     // let obj = {};
//     let time = '';
//     let value = '';
//     let result = [];

//     //去除空行
//     arr.forEach(item => {
//       if (item != '') {
//         array.push(item)
//       }
//     })

//     arr = array

//     arr.forEach(item => {
//       time = item.split(']')[0]
//       value = item.split(']')[1]
//       //去掉时间里的中括号得到xx:xx.xx
//       var t = time.slice(1).split(':');
//       //将结果压入最终数组
//       result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
//     });

//     // console.log(result);
//     this.setData({
//       lyrics: result
//     })

//     // 解决在获取歌词之前跳转导致歌词索引不再是0的问题
//     if (isLyricsShow == true) {
//       this.getCurrentLyricsIndex(originCurrentTime)
//     }

//   }


//   // 为了解决从碟子界面切换到歌词时歌词scroll-view没有立即滑动到对应位置，
//   // 在切换时重新赋值一次lyricsIndex
//   if (isLyricsShow == true) {
//     this.setData({
//       lyricsIndex: this.data.lyricsIndex
//     })

//   }
// },

// // 控制可显示的列表数据，不超过50条
// async controlDisplayList(song) {
//   let songId = musicId;
//   if (songId == '') {
//     songId = song
//   }
//   // 找到当前索引
//   let idx = playingMusicList.findIndex(item => item.id == songId)
//   // console.log('idx', idx);
//   let pre = 0;
//   let next = 0;
//   if (idx > 20) {
//     pre = 20
//   } else {
//     pre = idx
//   }
//   if (playingMusicList.length - 1 - idx > 20) {
//     next = 20
//   } else {
//     next = playingMusicList.length - 1 - idx
//   }
//   // console.log(pre, next);
//   // console.log(playingMusicList);
//   let displayMusicList = playingMusicList.slice(idx - pre, idx + next + 1);
//   // console.log(idx);
//   // console.log(playingMusicList);
//   await this.setData({
//     displayMusicList,
//   })
//   // 和上面列表放在一起可能会在渲染好列表前就设置了位置，导致不滚动
//   this.setData({
//     scrollPosition: pre
//   })
//   // console.log(pre);
// },


//   // 滑动列表到顶或者到底
//   addTopDisplayList() {
//     if (this.data.displayMusicList[0]) {
//       let idx = playingMusicList.findIndex(item => item.id == this.data.displayMusicList[0].id)
//       if (idx > 0) {
//         let addData = [];
//         let displayMusicList = this.data.displayMusicList;
//         if (idx > 20) {
//           addData = playingMusicList.slice(idx - 20, idx - 1);
//         } else {
//           addData = playingMusicList.slice(0, idx - 1);
//         }
//         displayMusicList.unshift(...addData);
//         this.setData({
//           displayMusicList,
//           scrollPosition: idx,
//         })
//       }
//     }
//   },
//   addBottomDisplayList() {
//     let idx = playingMusicList.findIndex(item => item.id == this.data.displayMusicList[this.data.displayMusicList.length - 1].id)
//     if (idx < playingMusicList.length - 1) {
//       let addData = [];
//       let displayMusicList = this.data.displayMusicList;
//       if (playingMusicList.length - 1 - idx > 20) {
//         addData = playingMusicList.slice(idx + 1, idx + 20);
//       } else {
//         addData = playingMusicList.slice(idx + 1, playingMusicList.length);
//       }
//       // console.log(displayMusicList, addData);
//       displayMusicList.push(...addData);
//       this.setData({
//         displayMusicList
//       })
//     }
//   },

//   // 喜欢或取消喜欢该音乐
//   async like() {
//     this.setData({
//       isLike: !this.data.isLike
//     })
//     // 喜欢该音乐
//     request('/like', { id: musicId, like: this.data.isLike })
//     // console.log(result);
//     // console.log(result);
//     // 修改likeList 从喜欢列表中添加或删除当前id
//     if (this.data.isLike) {
//       likeList.push(musicId)
//     } else {
//       let index = likeList.findIndex(item => {
//         return item == musicId
//       })
//       likeList.splice(index, 1)
//     }
//     // 存入全局变量
//     app.globalData.likeList = likeList
//   },

//   // 获取用户喜欢的音乐的列表
//   // 短时间多次请求会引起服务器缓存，请求后数据在本地操作以解决
//   // 注意：手机如果喜欢功能不正常，可以试一下重新登录，可能是因为存在本地的userId丢了
//   async getLikeList() {
//     let userId = wx.getStorageSync('userId')
//     let result;
//     if (app.globalData.likeList.length == 0) {
//       result = await request('/likelist', { uid: userId })
//       console.log(result);
//       // likeList = result.ids;
//       // 存入全局变量
//       app.globalData.likeList = likeList
//     } else {
//       return;
//     }
//     // console.log('执行了getlikelist');
//   },

//   // 判断登录用户是否喜欢该音乐
//   async getIsLike() {

//     if (wx.getStorageSync('userId')) {
//       // console.log(musicId);
//       if (app.globalData.likeList.length == 0) {
//         await this.getLikeList()
//       }
//       likeList = app.globalData.likeList;
//       // console.log(likeList);
//       let flag = likeList.find(item => {
//         // console.log(item);
//         return item == musicId
//       })
//       // 如果用相同的id，find返回该id值
//       // console.log(flag)
//       if (flag == undefined) {
//         this.setData({
//           isLike: false,
//         })
//       } else {
//         this.setData({
//           isLike: true
//         })
//       }
//     }
//   },

//   // 进入评论页面
//   toComments() {
//     wx.navigateTo({
//       url: '/pages/comment/comment?musicid=' + musicId
//     })
//   },

//   /**
//    * 生命周期函数--监听页面初次渲染完成
//    */
//   onReady: async function () {
//   },

//   /**
//    * 生命周期函数--监听页面显示
//    */
//   onShow: function () {

//   },

//   /**
//    * 生命周期函数--监听页面隐藏
//    */
//   onHide: function () {

//   },

//   /**
//    * 生命周期函数--监听页面卸载
//    */
//   onUnload: function () {

//     // app.getExitInfo();
//     // 退出改页面时，保存该页面的播放信息：当前播放歌单id、是否播放、当前播放歌曲在歌单中的索引、当前歌单的信息数组
//     app.globalData.musicListId = musicListId
//     app.globalData.isPlay = this.data.isPlay
//     // 重置bottomCibtrol存在storage中的playingMusicCurrent和displayMusicList，让他获取最新的数据
//     wx.setStorageSync('playingMusicCurrent', 0);
//     wx.setStorageSync('displayMusicList', [])
//   },

//   /**
//    * 页面相关事件处理函数--监听用户下拉动作
//    */
//   onPullDownRefresh: function () {

//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom: function () {

//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage: function () {

//   }
// })