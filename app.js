App({
    globalData: {
        // 表示音乐id
        musicId: '',
        // 下面是保存从songDetail获得的数据
        // 当前播放歌单id
        musicListId: '',
        // 是否播放
        isPlay: false,
        // 当前播放歌曲在歌单中的索引
        playingMusicIndex: 0,
        // 当前播放歌单
        playingMusicList: [],
        // 用户喜欢的歌曲列表(短时间多次请求喜欢列表会导致304缓存，所以请求一次后在本地进行操作)
        likeList: [],
        // 存放在musicList中请求到的列表id
        trackIdsList: [],
    },

    // songDetail在退出前调用 以获得songDetail中的数据
    getExitInfo() {
        // 获取songDetail保存的exitInfo数组
        if (wx.getStorageSync('exitInfo')) {
            let exitInfo = wx.getStorageSync('exitInfo');
            console.log(exitInfo);
            let musicListId = exitInfo[0];
            let isPlay = exitInfo[1];
            let playingMusicIndex = exitInfo[2];
            let playingMusicList = exitInfo[3];
            this.setData({
                musicListId,
                isPlay,
                playingMusicIndex,
                playingMusicList,
            })
        }
    },
})