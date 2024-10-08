// ==UserScript==
// @name         「水水」收集各种待看链接到远程服务器
// @namespace    https://www.wdssmq.com/
// @version      1.0.2
// @author       沉冰浮水
// @description  收集 B 站视频等链接到远程服务器，以用于 RSS 订阅
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.com/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://space.bilibili.com/*
// @match        https://feedly.com/i/saved
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "later-url";

  // 初始常量或函数
  const curUrl = window.location.href;
  const curDate = new Date();
  const curTimestamp = Math.floor(curDate.getTime() / 1000);

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
    postIndex: [0, false],
    remoteTotal: [0, false],
    curUrl: [location.href, false],
    lstUrl: ["", false],
  };
  const gob = {
    _lsKey: `${gm_name}_data`,
    _bolLoaded: false,
    data: {},
    config,
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

  // 删除 url
  gob.delUrl = async (url, category) => {
    const { baseUrl, authToken } = config.data;
    const headers = {
      "Authorization": "Bearer " + authToken,
    };

    const apiUrl = `${baseUrl}admin/${category}/del-url/?url=${url}`;
    try {
      const res = await gob.http.get(apiUrl, headers);
      // _log("gob.delUrl()\n", res);
      // _log("gob.delUrl()\n", res.responseText);
      const resJSON = JSON.parse(res.responseText);
      _log("gob.delUrl()\n",resJSON);
      return true;
    } catch (error) {
      gob.errCount += 1;
      _log("gob.delUrl() - error\n", error);
      return false;
    }
  };

  gob.stopByErrCount = () => {
    if (gob.errCount >= 4) {
      _log("gob.stopByErrCount()\n", "累计错误达到限制");
      return true;
    }
    return false;
  };

  // 使用 lsObj 记录发送历史，同一个链接在指定天数内 dayLimit 内最多发送 sendLimit 次
  gob.stopBySendLimit = (url, dayLimit = 37, sendLimit = 4) => {
    const curDay = Math.floor(curTimestamp / 86400);
    const key = `sendLimit_${url}`;
    const item = lsObj.getItem(key, { lstDay: curDay, count: 0 });
    if (curDay - item.lstDay > dayLimit) {
      item.lstDay = curDay;
      item.count = 0;
    }
    if (item.count >= sendLimit) {
      _log("gob.stopBySendLimit()\n", `当前链接 ${url} 已达到重复发送限制:\n`, {
        item,
        curDay,
        dayLimit,
        sendLimit,
      });
      return true;
    }
    item.count += 1;
    lsObj.setItem(key, item);
    return false;
  };

  // 初始化
  gob.init().load();

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
    // 如果有 data.showProgress() 函数
    const fnShowProgress = typeof data.showProgress === "function" ? data.showProgress : () => { };
    gob.postIndex += 1;
    if (gob.stopByErrCount()) {
      return false;
    }
    if (gob.stopBySendLimit(info.url)) {
      return false;
    }
    const { baseUrl, authToken } = config.data;
    const headers = {
      "Authorization": "Bearer " + authToken,
    };
    info.title = gob.filter(info.title);
    const url = `${baseUrl}add?url=${info.url}&title=${info.title}&author=${data.username}&category=${data.category}&date=${data.date}`;
    gob.postCount += 1;
    _log(`gob.post() - ${gob.postCount} \n`, url);

    try {
      const res = await gob.http.get(url, headers);
      // _log("gob.post()\n", res);
      _log("gob.post()\n", res.responseText);
      if (res.status !== 200) {
        gob.errCount += 1;
        return false;
      }
      const resJSON = JSON.parse(res.responseText);
      gob.remoteTotal = resJSON.data.count || 0;
      fnShowProgress(gob.postIndex, gob.remoteTotal);
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
      // 视频列表父元素
      const $submitVideo = $n("#submit-video");
      // 视频列表
      const $videos = this._$videos();
      // 视频列表不为空，并且不在加载状态
      if ($videos.length > 0 && !$submitVideo.className.match("loading")) {
        return $videos;
      }
      // _log("bilibili.check()", $submitVideo?.className);
      // 否则，等待 1 秒后再次检查
      await _sleep(1000);
      return this.check();
    },

    // 在页面元素中显示进度
    showProgress(itemIndex, pageTotal, remoteTotal) {
      const $warp = $n("#submit-video-type-filter");
      // 向 $warp 中添加进度元素
      let $progress = $n("#gm-progress");
      if (!$progress) {
        const $div = document.createElement("div");
        $div.id = "gm-progress";
        $div.style = "margin: 4px 0 4px 37px;";
        $div.style.color = "red";
        $div.style.fontSize = "14px";
        $div.style.fontWeight = "bold";
        $warp.appendChild($div);
        $progress = $div;
      }
      // 更新进度
      $progress.textContent = `later-url: ${itemIndex}/${pageTotal} remote: ${remoteTotal}`;
    },

    // 重置进度条
    resetProgress() {
      const $progress = $n("#gm-progress");
      if ($progress) {
        $progress.textContent = "";
      }
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
      // 获取当前网址
      gob.curUrl = _curUrl();
      // 判断网址是否匹配 https://space.bilibili.com/7078836/video
      if (!gob.curUrl.match(/space\.bilibili\.com\/\d+\/video/)) {
        return;
      }
      // 仅在网址改变时重复执行
      if (gob.curUrl === gob.lstUrl) {
        return;
      }
      gob.lstUrl = gob.curUrl;
      // 重置进度条
      bilibili.resetProgress();
      // 获取用户投稿视频并发送到远程
      this.getVideosFromPage().then((vlist) => {
        // 更新进度通过 bilibili.data 传递给 gob.post
        bilibili.data.showProgress = (itemIndex, remoteTotal) => {
          bilibili.showProgress(itemIndex, vlist.length, remoteTotal);
        };
        // 获取用户 uid 和 username
        this.getUid();
        this.getUsername();
        // 计数器清零
        gob.postIndex = 0;
        gob.postCount = 0;
        gob.errCount = 0;
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

  (() => {
    if (curUrl.indexOf("feedly") === -1) {
      return;
    }
    // _log($n("body").innerHTML);
    const $root = $n("#root");

    // 获取链接信息
    const getUrlInfo = ($con, $title) => {
      const info = {
        url: "",
        title: "",
        category: "",
      };
      info.url = $title.href;
      info.title = $title.textContent;
      // 获取分类
      const textCon = $con.textContent;
      // 判断是否含有 https://space.bilibili.com/\d+/video
      const oMatch = textCon.match(/https:\/\/space.bilibili.com\/(\d+)\/video/);
      if (oMatch) {
        info.category = `bilibili_${oMatch[1]}`;
      }
      return info;
    };

    // 添加按钮并绑定事件
    const addBtn = ($con, $title) => {
      const info = getUrlInfo($con, $title);
      if (!info.category) {
        return;
      }
      // $正文元素内添加一个按钮并绑定点击事件
      const $btn = document.createElement("button");
      $btn.textContent = "从 cf-later 删除";
      $btn.style.margin = "10px";
      $btn.onclick = async () => {
        _log(info);
        await gob.delUrl(info.url, info.category);
      };
      $con.appendChild($btn);
    };

    const onElChange = () => {
      const $$展开的文章 = $na("div > .SelectedEntryScroller");
      let $展开的文章;
      if ($$展开的文章.length > 0) {
        $展开的文章 = $$展开的文章[0];
      } else {
        return;
      }
      // 如果已经设置 data-url-btn="true"，则不再设置
      if ($展开的文章.getAttribute("data-url-btn") === "true") {
        return;
      }
      // 获取正文元素
      const $正文 = $展开的文章.querySelector(".entryBody .content");
      const $标题 = $展开的文章.querySelector(".entryHeader a");
      if (!$正文 || !$标题) {
        return;
      }
      _log("$展开的文章 = ", $展开的文章);
      _log(
        $正文,
        $标题,
      );
      addBtn($正文, $标题);
      // 设置 data-url-btn="true"
      $展开的文章.setAttribute("data-url-btn", "true");
    };

    fnElChange($root, onElChange);

  })();

})();
