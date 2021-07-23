// components/navigation-bar/navigation-bar.js
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
    barHeight: 0
  },


  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行

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

    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },


  /**
   * 组件的方法列表
   */
  methods: {
    handleGoBack() {
      wx.navigateBack({
        delta: 1
      });
    },
  },

})
