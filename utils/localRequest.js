// ES6默认值
export default (url, data = {}, method = 'GET') => {
  return new Promise((resolve, reject) =>
      // 1、new Promise初始化promise实例的状态为pending
      // 2、
      wx.request({
          // mobileHost    host
          url: 'https://fishei.cn' + url,
          data: data,
          method: method,
          header: {
              cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
          },
          success: (res) => {
              // console.log("请求成功", res);

              // 登录请求
              if (data.isLogin) {
                  // 将用户的cookie存至本地
                  wx.setStorage({
                      key: 'cookies',
                      data: res.cookies,
                  });
              }

              // resolve修改promise的状态为成功状态resolved
              resolve(res.data);
          },
          fail: (err) => {
              // console.log("请求失败", err);
              // reject修改promise的状态为失败状态rejected
              reject(err)
          }
      }))
}