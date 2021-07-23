/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80019
 Source Host           : localhost:3306
 Source Schema         : uoice

 Target Server Type    : MySQL
 Target Server Version : 80019
 File Encoding         : 65001

 Date: 24/07/2021 00:01:24
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for banners
-- ----------------------------
DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `pic` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of banners
-- ----------------------------
INSERT INTO `banners` VALUES (1, 'http://p1.music.126.net/Z3v05L-dQxz-k3ZKaV53mQ==/109951166140068238.jpg');
INSERT INTO `banners` VALUES (2, 'http://p1.music.126.net/tlVmmc5G8An3DoZraBH8YA==/109951166139302245.jpg');
INSERT INTO `banners` VALUES (3, 'http://p1.music.126.net/3wVxFBDGJyOPuMkRBq2ZJw==/109951166139307858.jpg');

-- ----------------------------
-- Table structure for belong
-- ----------------------------
DROP TABLE IF EXISTS `belong`;
CREATE TABLE `belong`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `recId` int(0) NOT NULL,
  `songId` int(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `recId`(`recId`) USING BTREE,
  INDEX `songId`(`songId`) USING BTREE,
  CONSTRAINT `belong_ibfk_1` FOREIGN KEY (`recId`) REFERENCES `recommend` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `belong_ibfk_2` FOREIGN KEY (`songId`) REFERENCES `song` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for recommend
-- ----------------------------
DROP TABLE IF EXISTS `recommend`;
CREATE TABLE `recommend`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `coverImgUrl` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `picUrl` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `description` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recommend
-- ----------------------------
INSERT INTO `recommend` VALUES (1, '留给我们的夏天，大概还有一首歌那么长', 'https://p1.music.126.net/THc2dGCHBcMLuRlwQjccFg==/109951165210824295.jpg', 'https://p1.music.126.net/THc2dGCHBcMLuRlwQjccFg==/109951165210824295.jpg', '回想盛夏的开始，我们换上轻薄的衣服，迎接过假期的自在与慵懒，打最分明的光与影下跑过，把全部旺盛的精力消耗在琐碎的热爱里。\\n谁也不知道夏天究竟会在某个凉风潜入的清晨，还是哪个落叶纷飞的夜晚悄然终止，但它终将结束，也许留给我们的夏天，大概还有一首歌那么长。');
INSERT INTO `recommend` VALUES (2, '原来不是恋爱甜，是你甜鸭！', 'https://p2.music.126.net/crDAU7LPX21tIl6TQBScFA==/109951166111704621.jpg', 'https://p2.music.126.net/crDAU7LPX21tIl6TQBScFA==/109951166111704621.jpg', '你问我有多喜欢你\\n我说 像喜欢春天的小熊\\n“春天的原野里，你一个人正走着，对面走来一只可爱的小熊，浑身的毛活像天鹅绒，眼睛圆鼓鼓的。它这么对你说道：‘你好，小姐，和我一块儿打滚玩好么？’接着，你就和小熊抱在一起，顺着长满三叶草的山坡咕噜咕噜滚下去，整整玩了一大天。你说棒不棒？”\\n“我就这么喜欢你。”\\n\\n图源网络');
INSERT INTO `recommend` VALUES (3, '蹦迪｜夜店神曲 摇摆至上', 'https://p2.music.126.net/g0OJyy6BpIzzoLdlRaFHjg==/109951164577578596.jpg', 'https://p2.music.126.net/g0OJyy6BpIzzoLdlRaFHjg==/109951164577578596.jpg', '在用生命蹦迪的年纪 千万不要说你只喝绿茶');
INSERT INTO `recommend` VALUES (4, '失去你的我，比乞丐落魄', 'https://p2.music.126.net/WxRm52lj88Hw3B5K7tqzAg==/109951165819718068.jpg', 'https://p2.music.126.net/WxRm52lj88Hw3B5K7tqzAg==/109951165819718068.jpg', '其实我曾那么想拥有你。');
INSERT INTO `recommend` VALUES (5, '你费尽心思错过我 是为了遇见谁', 'https://p2.music.126.net/iWAs5ZXtZT1iyHD-yj_1TA==/109951165443757011.jpg', 'https://p2.music.126.net/iWAs5ZXtZT1iyHD-yj_1TA==/109951165443757011.jpg', '建议随机播放\\n我们走了很久\\n什么时候才是个头\\n\\n晚安');

-- ----------------------------
-- Table structure for song
-- ----------------------------
DROP TABLE IF EXISTS `song`;
CREATE TABLE `song`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `picUrl` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `author` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `dt` int(0) NULL DEFAULT NULL,
  `url` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `lyric` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of song
-- ----------------------------
INSERT INTO `song` VALUES (1, '忽然之间', 'https://p1.music.126.net/nvY9GOS_7bmbpB-AeQKagQ==/109951163803920201.jpg', '田新宇', 202510, 'https://fishei-blog.oss-cn-hangzhou.aliyuncs.com/music/d90d_636f_0b72_860a3f72b922cca17e4dbabc49d7f757.mp3', '获取歌词[00:00.000] 作词 : 无\r\n[00:01.000] 作曲 : 无\r\n[00:15.89]忽然之间\r\n[00:19.67]天昏地暗\r\n[00:23.11]世界可以\r\n[00:24.59]忽然什么都没有\r\n[00:28.95]我想起了你\r\n[00:33.38]再想到自己\r\n[00:36.77]我为什么\r\n[00:37.70]总在非常脆弱的时候\r\n[00:42.16]怀念你\r\n[00:45.96]我明白 太放不开 你的爱\r\n[00:50.78]太熟悉 你的关怀 分不开\r\n[00:56.06]想你 算是安慰 还是悲哀\r\n[00:59.60]而现在 就算时针 都停摆\r\n[01:04.85]就算生命 像尘埃 分不开\r\n[01:10.06]我们 也许反而 更相信爱\r\n[01:15.08]\r\n[01:27.57]如果这天地\r\n[01:29.88]最终会消失\r\n[01:34.64]不想一路走来珍惜的回忆\r\n[01:39.70]没有你\r\n[01:43.20]我明白 太放不开 你的爱\r\n[01:48.31]太熟悉 你的关怀 分不开\r\n[01:53.53]想你 算是安慰 还是悲哀\r\n[01:57.00]而现在 就算时针 都停摆\r\n[02:02.30]就算生命 像尘埃 分不开\r\n[02:07.43]我们 也许反而 更相信爱\r\n[02:12.16]\r\n[02:37.41]我明白 太放不开 你的爱\r\n[02:42.38]太熟悉 你的关怀 分不开\r\n[02:47.49]想你 算是安慰 还是悲哀\r\n[02:51.23]而现在 就算时针 都停摆\r\n[02:56.33]就算生命 像尘埃 分不开\r\n[03:01.44]我们 也许反而 更相信爱');
INSERT INTO `song` VALUES (2, 'ヤキモチ（吃醋）', 'https://p1.music.126.net/ssW5F3w_lRCUaS17Wc3s4g==/109951163237167018.jpg', '\"ゆう十', 310885, 'https://file.fishei.cn/music/0717_2f01_7533_3974a74da332d1a89f5ac8bcf1cefa7b.mp3', '[00:00.000] 作词 : 高橋優\\n[00:01.000] 作曲 : 高橋優\\n[00:25.739]君が前に付き合っていた人のこと\\n[00:32.674]僕に打ち明けてくれたとき\\n[00:37.987]素直に聴いてあげられずに\\n[00:43.954]寂しい思いをさせてしまったね\\n[00:49.037]すぐにヤキモチ焼くのが僕の悪い癖だって\\n[00:57.375]分かっていた筈なのに\\n[01:02.422]自分勝手な想いが残酷な言葉になって\\n[01:10.477]君を傷付けてた\\n[01:15.126]一緒に居られるだけで\\n[01:19.010]手と手を重ね合えるだけで良かったね\\n[01:28.060]大切な事ほど見慣れた場所で輝くのかもしれない\\n[01:39.979]君を強く抱きしめたい\\n[01:46.390]\\n[01:56.408]自分のためだけに生きている人が\\n[02:02.859]集められたようなこの街で\\n[02:08.309]誰かを心から想える幸せをいつまでも忘れたくない\\n[02:20.531]すぐにヤキモチ焼くとこも好きだよって\\n[02:26.644]からかって笑う君に甘えていた\\n[02:32.877]愛していることを言葉以外の方法で\\n[02:40.096]今すぐに伝えたい\\n[02:45.328]微笑んでくれた顔も 怒った顔も\\n[02:52.899]愛しくて仕方なかったよ\\n[02:58.349]打ち明けてくれた過去も\\n[03:02.513]二人が見た青空も忘れない\\n[03:10.901]\\n[03:35.865]一緒に居られるだけで\\n[03:39.683]手と手を重ね合えるだけで良かったね\\n[03:48.186]大切な事ほど見慣れた場所で輝くのかもしれない\\n[03:59.338]微笑んでくれた顔も 怒った顔も\\n[04:07.554]愛しくて仕方なかったよ\\n[04:12.921]君の事が好きだよ\\n[04:17.135]これからもずっと君を抱きしめたい\\n[04:25.735]君を強く抱きしめたい\\n[04:34.346]\\n');
INSERT INTO `song` VALUES (3, '云烟成雨', 'https://p2.music.126.net/DSTg1dR7yKsyGq4IK3NL8A==/109951163046050093.jpg', '房东的猫', 240782, 'https://file.fishei.cn/music/0717_2f01_7533_3974a74da332d1a89f5ac8bcf1cefa7b.mp3', '[00:00.000] 作词 : 墨鱼丝\\n[00:01.000] 作曲 : 少年佩\\n[00:10.630]制作人：黎偌天\\n[00:11.630]编曲：黎偌天\\n[00:12.630]监制：李纤橙\\n[00:13.630]\\n[00:17.610]你的晚安 是下意识的恻隐\\n[00:24.270]我留至夜深 治疗失眠梦呓\\n[00:30.190]那封手写信 留在行李箱底\\n[00:36.280]来不及 赋予它旅途的意义\\n[00:43.250]若一切 都已云烟成雨\\n[00:48.890]我能否 变成淤泥\\n[00:51.890]再一次 沾染你\\n[00:55.050]若生命 如过场电影\\n[01:00.929]Oh让我再一次 甜梦里惊醒\\n[01:13.269]我多想再见你\\n[01:14.888]哪怕匆匆一眼就别离\\n[01:19.159]路灯下昏黄的剪影\\n[01:22.159]越走越漫长的林径\\n[01:25.349]我多想再见你\\n[01:27.409]至少玩笑话还能说起\\n[01:31.629]街巷初次落叶的秋分\\n[01:34.769]渐行渐远去的我们\\n[01:52.480]若一切 都已云烟成雨\\n[01:58.420]我能否 变成淤泥\\n[02:01.308]再一次 沾染你\\n[02:04.959]若生命 如过场电影\\n[02:10.088]Oh让我再一次 甜梦里惊醒\\n[02:19.089]我多想再见你\\n[02:21.039]哪怕匆匆一眼就别离\\n[02:25.429]路灯下昏黄的剪影\\n[02:28.169]越走越漫长的林径\\n[02:31.539]我多想再见你\\n[02:33.810]至少玩笑话还能说起\\n[02:37.769]街巷初次落叶的秋分\\n[02:40.799]渐行渐远去的我们\\n[02:48.810]站台 汽笛响起\\n[02:51.889]想念是你的声音\\n[02:55.239]我们提着过去 走入人群\\n[03:01.560]寻找着一个位置 安放自己\\n[03:13.079]我多想再见你\\n[03:14.769]哪怕匆匆一眼就别离\\n[03:18.899]路灯下昏黄的剪影\\n[03:21.929]越走越漫长的林径\\n[03:25.379]我多想再见你\\n[03:27.599]至少玩笑话还能说起\\n[03:31.369]街巷初次落叶的秋分\\n[03:34.579]渐行渐远去的我们\\n[03:41.379]\\n[03:42.819]主唱：红鼻子小黑\\n[03:44.069]制作人：黎偌天\\n[03:45.599]监制：李纤橙\\n');

SET FOREIGN_KEY_CHECKS = 1;
