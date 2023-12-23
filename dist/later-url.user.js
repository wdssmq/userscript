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
// @match        https://space.bilibili.com/*/video*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "later-url";

  const curDate = new Date();

  // -------------------------------------

  const _curUrl = () => { return window.location.href };
  const _getDateStr = (date = curDate) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
  };
  const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}] |`, ...args);

  // -------------------------------------

  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // -------------------------------------

  // 元素变化监听
  const fnElChange = (el, fn = () => { }) => {
    const observer = new MutationObserver((mutationRecord, mutationObserver) => {
      // _log('mutationRecord = ', mutationRecord);
      // _log('mutationObserver === observer', mutationObserver === observer);
      fn(mutationRecord, mutationObserver);
      // mutationObserver.disconnect();
    });
    observer.observe(el, {
      // attributes: false,
      // attributeFilter: ["class"],
      childList: true,
      // characterData: false,
      subtree: true,
    });
  };

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
    errCount: [0, false],
    postCount: [0, false],
    curUrl: [location.href, false],
    lstUrl: ["", false],
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

  gob.stopByErrCount = () => {
    if (gob.errCount >= 4) {
      _log("gob.stopByErrCount()\n", gob.errCount);
      return true;
    }
    return false;
  };

  // 初始化
  gob.init().load();

  const config = {
    data: {},
    defData: {
      baseUrl: "http://127.0.0.1:41897/",
      authToken: "token_value_here",
      isInit: false,
    },
    load() {
      config.data = GM_getValue("config", this.defData);
      if (!config.data.isInit) {
        config.data.isInit = true;
        config.save();
      }
    },
    save() {
      GM_setValue("config", config.data);
    },
  };

  config.load();

  // 执行队列，第二个参数控制是否循环执行
  async function runQueue(listPromises, loop = 0) {
    // console.log(listPromises);
    for (let itemPromise of listPromises) {
      await itemPromise();
    }
    if (loop) {
      await runQueue(listPromises, loop);
    }
  }

  // 返回项为一个函数，该函数调用时会建立一个 Promise 对象并立即执行
  // 当内部调用 solve() 时表示该异步项执行结束
  const createPromise = (cb, ...args) => {
    return () => new Promise((resolve, reject) => {
      cb(...args).then((res) => {
        resolve(res);
      }).catch((error) => {
        reject(error);
      });
    });
  };

  // 构造任务队列
  const createQueue = (arr, cb, ...args) => {
    return arr.map((item) => {
      return createPromise(cb, item, ...args);
    });
  };

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
      this.getUid();
      this.getUsername();
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

})();
