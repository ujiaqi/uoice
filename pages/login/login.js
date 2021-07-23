// pages/login/login.js

// 登录流程
// 1、收集表单项数据
// 2、前端验证
//    a、验证用户信息（账号密码）是否合法
//    b、前端验证不通过提示用户，不需要发送请求给后端
//    c、前端验证通过，发请求（携带账号，密码）给服务器端
// 3、后端验证
//    a、验证用户是否存在
//    b、用户不存在直接返回，告诉前端用户不存在
//    c、用户存在需要验证密码是否正确
//    d、密码不正确返回前端提示密码不正确
//    e、密码正确返回前端数据，提示用户登录成功（会携带用户的相关信息）

import request from '../../utils/request'
import localRequest from '../../utils/localRequest'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',  // 手机号
    password: '',  // 密码
    countTime: '验证码',
    disabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // 表单项内容发生改变的回调
  handleInput(event) {
    // let type = event.currentTarget.id; // id传值 取值 phone || password
    // console.log(event);
    let type = event.currentTarget.dataset.type;  // data-key=value 传值   用data-key形式可以传多个数据 而id是唯一的
    // console.log(type, event.detail.value);
    this.setData({
      // type是变量，对象里面操作属性用中括号
      [type]: event.detail.value
    })
  },


  async sendCode(){

    let { phone, password } = this.data;
    if (!phone.trim()) {
      //提示用户
      wx.showToast({
        title: '手机号不能为空!',
        icon: 'none'
      })
      return;
    }

    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/;
    if (!phoneReg.test(phone)) {
      //提示用户
      wx.showToast({
        title: '手机号格式不正确!',
        icon: 'none'
      })
      return;
    }
    //发送验证码
    let result = await localRequest('/getCode', { phone })
    console.log(result)
  
    var that = this
    var num = 59;
    if(result.status == "ok"){
      wx.showToast({
        title: '发送成功',
        icon: 'none'
      })
      //开始计时
      that.setData({
        disabled: true,
        countTime: num + "s"
        
      })
      var timer = setInterval(function () {
        num--;
        if (num <= 0) {
          clearInterval(timer);
          that.setData({
            countTime: '重新发送',
            disabled: false
          })
        } else {
          that.setData({
            countTime: num + "s",
            disabled: true
          })
        }
      }, 1000
      )
    }
  },

  // 登录的回调
  async login() {
    // 收集表单项数据
    let { phone, password } = this.data;
    // 前端验证
    if (!phone.trim()) {
      //提示用户
      wx.showToast({
        title: '手机号不能为空!',
        icon: 'none'
      })
      return;
    }

    // 正则表单式
    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/;
    if (!phoneReg.test(phone)) {
      //提示用户
      wx.showToast({
        title: '手机号格式不正确!',
        icon: 'none'
      })
      return;
    }

    if (!password.trim()) {
      //提示用户
      wx.showToast({
        title: '验证码不能为空!',
        icon: 'none'
      })
      return;
    }

    // 后端验证
    let result = await localRequest('/loginPhone', { phone, code:password})
    console.log(result);
    if (result.status === 1) {
      wx.showToast({
        title: '登陆成功'
      })

      // 跳转至个人中心personal页面
      wx.reLaunch({
        url: '/pages/index/index'
      });
    } else if (result.code == "验证码有误") {
      wx.showToast({
        title: '验证码有误',
        icon: 'none'
      })
    } else if (result.code === "验证码失效") {
      wx.showToast({
        title: '验证码失效',
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: '登录失败，请重新登录!',
        icon: 'none'
      })
    }
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