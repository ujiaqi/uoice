// 发送 ajax请求


// 1、封装功能函数
// a、功能点明确
// b、函数内部应该保留固定代码(静态的)
// c、将动态的数抽取成形参，由使用者根据自身情况动态的传入实参
// d、一个良好的功能函数应该设置形参的默认值(ES6的形参默认值)


// 2、封装功能组件
// a、功能点明确
// b、组件内部保留静态的代码
// c、将动态的数据抽取成props参数，由使用者根据自身情况以标签属性的形式动态传入props数据
// d、一个良好的组件应该设置组件必要性和数据类型
// props:{
//     msg:{
//         required:true,
//         default:默认值,
//         type:String
//     }
// }

import config from './config'

// ES6默认值
export default (url, data = {}, method = 'GET') => {
    return new Promise((resolve, reject) =>
        // 1、new Promise初始化promise实例的状态为pending
        // 2、
        wx.request({
            // mobileHost    host
            url: config.host + url,
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