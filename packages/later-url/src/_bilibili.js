import {
  _getDateStr,
  _log,
  _sleep,
  $n,
  $na,
  _curUrl,
  fnElChange,
} from "./_base";

import { gob } from "./_gob";
import config from "./_config";
import {
  // createPromise,
  createQueue,
  runQueue,
} from "./_queue";

// 过滤字符信息
gob.filter = (str) => {
  let rlt = str;
  rlt = rlt.replace(/\s/g, "");
  rlt = rlt.replace(/#/g, "");
  return rlt;
};

// 发送链接信息到远程
gob.post = async (info, data) => {
  const { baseUrl, authToken } = config.data;
  const headers = {
    "Authorization": "Bearer " + authToken,
  };
  info.title = gob.filter(info.title);
  const url = `${baseUrl}add?url=${info.url}&title=${info.title}&author=${data.username}&category=${data.category}&date=${data.date}`;
  gob.postCount += 1;
  _log(`gob.post() - ${gob.postCount} \n`, url);
  if (gob.stopByErrCount()) {
    return false;
  }

  try {
    const res = await gob.http.get(url, headers);
    // _log("gob.post()\n", res);
    _log("gob.post()\n", res.responseText);
    if (res.status !== 200) {
      gob.errCount += 1;
      return false;
    }
    return true;
  } catch (error) {
    gob.errCount += 1;
    _log("gob.post() - error\n", error);
    return false;
  }
};

const bilibili = {
  // 变量复用
  data: {
    uid: "",
    username: "",
    category: "default",
    date: _getDateStr(),
  },

  // 获取当前用户的 uid
  getUid() {
    const uid = gob.curUrl.match(/space\.bilibili\.com\/(\d+)/)[1];
    this.data.uid = uid;
    this.data.category = `bilibili_${uid}`;
    _log("bilibili.getUid()\n", this.data);
    return uid;
  },

  // 获取用户名
  getUsername() {
    const $username = $n("span#h-name");
    // console.log($username);
    if ($username) {
      this.data.username = $username.textContent;
    }
    _log("bilibili.getUsername()\n", this.data);
    return this.data.username;
  },

  _$videos() {
    return $na("#submit-video-list ul.cube-list li");
  },

  // 网页加载检查
  async check() {
    const $videos = this._$videos();
    if ($videos.length > 0) {
      return $videos;
    }
    await _sleep(1000);
    return this.check();
  },

  // API JSON 查询
  async apiGet(url) {
    const res = await gob.http.get(url);
    if (res.status !== 200) {
      return {
        code: res.status,
        msg: res.statusText,
      };
    }
    const resData = JSON.parse(res.responseText);
    if (resData.code !== 0) {
      return {
        code: resData.code,
        msg: resData.message,
      };
    }
    return resData;
  },

  // 获取用户投稿视频
  async getVideos(pn = 1) {
    const uid = this.getUid();
    const url = `https://api.bilibili.com/x/space/wbi/arc/search?mid=${uid}&ps=50&pn=${pn}`;
    _log("bilibili.getVideos()\n", url);
    try {
      const resData = await this.apiGet(url);
      if (resData.code === 0) {
        return resData.data.list.vlist;
      } else {
        _log("bilibili.getVideos() - resData\n", resData);
      }
    } catch (error) {
      _log("bilibili.getVideos() - error\n", error);
      return;
    }
  },

  // 视频信息中提取需要的信息
  pickInfo(video) {
    const pickMap = {
      bvid: "bvid",
      title: "title",
      description: "description",
      pic: "pic",
      length: "00:00",
    };
    const info = {};
    for (const key in pickMap) {
      if (Object.hasOwnProperty.call(pickMap, key)) {
        info[key] = video[key];
      }
    }
    info.url = `https://www.bilibili.com/video/${info.bvid}`;
    info.uid = this.data.uid;
    info.category = this.data.category;
    return info;
  },

  // 从网页元素中获取投稿视频
  async getVideosFromPage() {
    const videoList = await this.check();
    const videos = [];
    videoList.forEach((video) => {
      const v = {};
      const $title = video.querySelector("a.title");
      const $time = video.querySelector("span.time");
      v.bvid = video.dataset.aid;
      v.title = $title.textContent;
      // v.description = video.dataset.description;
      // v.pic = video.dataset.pic;
      // v.length = video.dataset.length;
      v.date = $time.textContent;
      v.url = `https://www.bilibili.com/video/${v.bvid}`;
      videos.push(v);
    });
    return videos;
  },

  // 主函数
  main() {
    // 仅在网址改变时重复执行
    gob.curUrl = _curUrl();
    if (gob.curUrl === gob.lstUrl) {
      return;
    }
    // 判断网址是否匹配 https://space.bilibili.com/7078836/video
    if (!gob.curUrl.match(/space\.bilibili\.com\/\d+\/video/)) {
      return;
    }
    gob.lstUrl = gob.curUrl;
    // 获取用户 uid 和 username
    const uid = this.getUid();
    const username = this.getUsername();
    // 获取用户投稿视频并发送到远程
    this.getVideosFromPage().then((vlist) => {
      gob.postCount = 0;
      // 对于 vlist 中的每个视频，发送到远程，使用异步队列
      const queue = createQueue(vlist, gob.post, bilibili.data);
      runQueue(queue);
    });
  },

  // 监听网页元素变化
  watch() {
    const $body = $n("body");
    const _this = this;
    fnElChange($body, _this.main.bind(_this));
  },
};

bilibili.watch();
