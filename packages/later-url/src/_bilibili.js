import {
  _getDateStr,
  _log,
  _sleep,
  $n,
  curUrl,
} from "./_base";

import { gob } from "./_gob";
import config from "./_config";

// 发送链接信息到远程

gob.post = async (info, data) => {
  const { baseUrl, authToken } = config.data;
  const headers = {
    "Authorization": "Bearer " + authToken,
  };
  const url = `${baseUrl}add?url=${info.url}&title=${info.title}&category=${data.category}&date=${data.date}`;
  _log("gob.post()\n", url);

  const res = await gob.http.get(url, headers);
  // _log("gob.post()\n", res);
  _log("gob.post()\n", res.responseText);
  return gob.http.get(url);
};

const bilibili = {
  // 变量复用
  data: {
    uid: "",
    category: "default",
    date: _getDateStr(),
  },

  // 获取当前用户的 uid
  getUid() {
    const uid = curUrl.match(/space\.bilibili\.com\/(\d+)/)[1];
    this.data.uid = uid;
    this.data.category = `bilibili_${uid}`;
    _log("bilibili.getUid()\n", this.data);
    return uid;
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
    const resData = await this.apiGet(url);
    if (resData.code === 0) {
      return resData.data.list.vlist;
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
};

bilibili.getVideos().then((vlist) => {
  _log("bilibili.getVideos()\n", vlist);
  vlist.forEach((video, i) => {
    if ("NODE_ENV" === "dev" && i > 10) {
      return;
    }
    setTimeout(() => {
      gob.post(bilibili.pickInfo(video), bilibili.data);
    }, 3000 * i);
  });
});
