## README

![](pic\\播放页.jpg)

![登录](pic\\登录.jpg)

![歌词](pic\\歌词.jpg)

![歌单页](pic\\歌单页.jpg)

![个人中心](pic\\个人中心.jpg)

![首页](pic\\首页.jpg)





##### 接口：

1. 获得滚动广告图：

   ```
   https://fishei.cn/banners
   ```

   

2. 获得歌单：

   ```
   https://fishei.cn/getRecommend
   ```

   

3. 获得热门榜单：

   ```
   https://fishei.cn/getTopList
   ```

   

4. 获得歌曲列表：

   ```
   GET 请求 需要歌单id：https://fishei.cn/getSong?id=1
   ```

   

5. 获得歌曲详细信息：

   ```
   GET 需要参数歌曲ids：https://fishei.cn/getSongDetail?ids=1
   ```

   



### 技术栈

##### 前端：小程序IDE，小程序官方文档和其语言，weiUI

##### 后端：IDEA，SpringBoot，腾讯云验证码，weiGit(代码管理)，MAVEN

##### 服务器：硅云香港云，CentOS7，Nginx，SSL

##### 文件存储：阿里云OSS

```java
后端代码需要修改验证码平台的id和key
还有数据库密码
```



