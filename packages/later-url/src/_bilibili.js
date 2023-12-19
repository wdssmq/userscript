import {
  _log,
  $n,
  curUrl,
} from "./_base";

import { gob } from "./_gob";
import config from "./_config";

// 发送链接信息到远程

gob.post = async (info) => {
  const { baseUrl, authToken } = config.data;
  const headers = {
    "Authorization": "Bearer " + authToken
  };
  const url = `${baseUrl}?url=${info.url}&title=${info.title}&category=${info.category}`;
  _log("gob.post()\n", url);

  const res = await gob.http.get(url, headers);
  // _log("gob.post()\n", res);
  _log("gob.post()\n", res.responseText);
  return gob.http.get(url);
};

const bilibili = {

  // 获取当前用户的 uid
  getUid() {
    const uid = curUrl.match(/space\.bilibili\.com\/(\d+)/)[1];
    _log("bilibili.getUid()\n", uid);
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
  pickInfo(video, uid) {
    const pickMap = {
      bvid: "aid",
      title: "title",
      desc: "description",
      pic: "pic",
      length: "00:00",
    };
    const info = {};
    for (const key in pickMap) {
      if (Object.hasOwnProperty.call(pickMap, key)) {
        const item = pickMap[key];
        info[key] = video[item];
      }
    }
    info.url = `https://www.bilibili.com/video/${info.bvid}`;
    info.uid = uid;
    info.category = `bilibili_${uid}`;
    return info;
  },
};

bilibili.getVideos().then((vlist) => {
  _log("bilibili.getVideos()\n", vlist);
  gob.post(bilibili.pickInfo(vlist[0], bilibili.getUid()));
});
