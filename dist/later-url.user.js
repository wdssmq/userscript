// ==UserScript==
// @name         「水水」收集各种待看链接到远程服务器
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  收集 B 站视频等链接到远程服务器，以用于 RSS 订阅
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.net/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://space.bilibili.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "later-url";

  // 初始常量或函数
  const curUrl = window.location.href;

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}] |`, ...args);

  class HttpRequest {
    constructor() {
    }

    get(url, headers = {}) {
      return this.request({
        method: "GET",
        url,
        headers,
      });
    }

    post(url, data = {}, headers = {}) {
      const formData = new FormData();

      for (const key in data) {
        formData.append(key, data[key]);
      }

      return this.request({
        method: "POST",
        url,
        data: formData,
        headers,
      });
    }

    request(options) {
      return new Promise((resolve, reject) => {
        const requestOptions = Object.assign({}, options);

        requestOptions.onload = (res) => {
          resolve(res);
        };

        requestOptions.onerror = (error) => {
          reject(error);
        };

        GM_xmlhttpRequest(requestOptions);
      });
    }
  }

  const http = new HttpRequest();

  // localStorage 封装
  const lsObj = {
    setItem: (key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    getItem: (key, def = "") => {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return def;
    },
  };

  // 数据读写封装
  const gobInfo = {
    // key: [默认值, 是否记录至 ls]
    strTest: ["TEST", 0],
    intTest: [0, 1],
  };
  const gob = {
    _lsKey: `${gm_name}_data`,
    _bolLoaded: false,
    data: {},
    // 初始
    init() {
      // 根据 gobInfo 设置 gob 属性
      for (const key in gobInfo) {
        if (Object.hasOwnProperty.call(gobInfo, key)) {
          const item = gobInfo[key];
          this.data[key] = item[0];
          Object.defineProperty(this, key, {
            // value: item[0],
            // writable: true,
            get() { return this.data[key] },
            set(value) { this.data[key] = value; },
          });
        }
      }
      return this;
    },
    // 读取
    load() {
      if (this._bolLoaded) {
        return;
      }
      const lsData = lsObj.getItem(this._lsKey, this.data);
      _log("[log]gob.load()", lsData);
      for (const key in lsData) {
        if (Object.hasOwnProperty.call(lsData, key)) {
          const item = lsData[key];
          this.data[key] = item;
        }
      }
      this._bolLoaded = true;
    },
    // 保存
    save() {
      const lsData = {};
      for (const key in gobInfo) {
        if (Object.hasOwnProperty.call(gobInfo, key)) {
          const item = gobInfo[key];
          if (item[1]) {
            lsData[key] = this.data[key];
          }
        }
      }
      _log("[log]gob.save()", lsData);
      lsObj.setItem(this._lsKey, lsData);
    },
  };

  gob.http = http;

  // 初始化
  gob.init().load();

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
    pickInfo(video) {
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
      return info;
    },
  };

  bilibili.getVideos().then((res) => {
    console.log(res);
  });

})();
