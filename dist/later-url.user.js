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
// @link         https://afdian.com/a/wdssmq
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

  const _curUrl = () => window.location.href;
  function _getDateStr(date = curDate) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
  }
  const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // -------------------------------------

  // 记录已输出的 log，用于「只输出一次」
  const _logHis = new Set();
  const _log = (...args) => console.log(`[${gm_name}] |`, ...args);
  // 只输出一次的 log，以第一个参数为 key，可用 _logHis.clear() 重置
  function _logOnce(...args) {
    let key = typeof args[0] === "string" ? args[0] : "";
    if (!key) {
      try {
        key = JSON.stringify(args);
      }
      catch {
        key = String(args[0]);
      }
    }
    if (_logHis.has(key)) {
      return false;
    }
    _logHis.add(key);
    _log(...args);
    return true;
  }

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
  function fnElChange(el, fn = () => { }) {
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
  }

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

  class HttpRequest {
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
      Authorization: `Bearer ${authToken}`,
    };

    const apiUrl = `${baseUrl}admin/${category}/del-url/?url=${url}`;
    try {
      const res = await gob.http.get(apiUrl, headers);
      // _log("gob.delUrl()\n", res);
      // _log("gob.delUrl()\n", res.responseText);
      const resJSON = JSON.parse(res.responseText);
      _log("gob.delUrl()\n", resJSON);
      return true;
    }
    catch (error) {
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

  // 快速防重检查，指定 key 在本地存储中计数，达到 4 次则返回 true
  gob.stopByQuickCheck = (quickKey) => {
    const lsData = lsObj.getItem(quickKey, { count: 0 });
    if (lsData.count >= 4) {
      return true;
    }
    lsData.count += 1;
    lsObj.setItem(quickKey, lsData);
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
    for (const itemPromise of listPromises) {
      await itemPromise();
    }
    if (loop) {
      await runQueue(listPromises, loop);
    }
  }

  // 返回项为一个函数，该函数调用时会建立一个 Promise 对象并立即执行
  // 当内部调用 solve() 时表示该异步项执行结束
  function createPromise(cb, ...args) {
    return () => new Promise((resolve, reject) => {
      cb(...args).then((res) => {
        resolve(res);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  // 构造任务队列
  function createQueue(arr, cb, ...args) {
    return arr.map((item) => {
      return createPromise(cb, item, ...args);
    });
  }

  // 新版空间页（fresh-space）选择器
  const SEL = {
    // 用户名
    username: ".header-upinfo .upinfo-detail .nickname",
    // 单个视频卡片
    card: ".space-upload .video-list .upload-video-card",
    // 列表加载中
    loading: ".space-upload .video-body .loading",
    // 空列表
    empty: ".space-upload .video-body .empty",
    // 列表头部，进度条挂载位置
    header: ".video-header__top",
  };
  // 从链接中提取 BVID
  const RE_BVID = /\/video\/(BV[0-9A-Za-z]+)/;
  // 卡片中的日期文本
  const RE_DATE = /\d{4}-\d{1,2}-\d{1,2}/;

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
      Authorization: `Bearer ${authToken}`,
    };
    info.title = gob.filter(info.title);
    const url = `${baseUrl}add?url=${encodeURIComponent(info.url)}&title=${encodeURIComponent(info.title)}&author=${encodeURIComponent(data.username)}&category=${encodeURIComponent(data.category)}&date=${data.date}`;
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
    }
    catch (error) {
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

    // 需要的页面元素
    _$list: {
      $warp: null,
      $title: null,
      $progress: null,
      $cards: [],
    },

    // 已处理过的视频，避免列表重复渲染时重发
    _sent: new Set(),
    // 防止重复执行
    _busy: false,
    // 快速防重 key
    _quickKey: "",

    // 获取当前用户的 uid
    getUid() {
      const oMatch = gob.curUrl.match(/space\.bilibili\.com\/(\d+)/);
      if (!oMatch) {
        _logOnce("bilibili.getUid() - 未匹配到 uid\n", gob.curUrl);
        return "";
      }
      const uid = oMatch[1];
      this.data.uid = uid;
      this.data.category = `bilibili_${uid}`;
      // _logOnce("bilibili.getUid()\n", this.data);
      return uid;
    },

    // 获取用户名
    getUsername() {
      const $username = $n(SEL.username);
      if ($username) {
        this.data.username = $username.textContent.trim();
      }
      // 兜底：document.title 形如 「某某的个人空间-某某个人主页-哔哩哔哩视频」
      if (!this.data.username) {
        const oMatch = document.title.match(/^(.+?)的个人空间/);
        if (oMatch) {
          this.data.username = oMatch[1];
        }
      }
      // _logOnce("bilibili.getUsername()\n", this.data.username);
      return this.data.username;
    },

    // 当前页渲染出的视频卡片
    _$cards() {
      return $na(SEL.card);
    },

    // 网页加载检查，包括防重检查
    async check(maxTry = 20) {
      this.data.username = this.getUsername();
      this.data.uid = this.getUid();
      let stopByQuick = false;
      _logOnce("bilibili.check() - 当前用户信息\n", this.data);
      if (gob.stopByQuickCheck(this._quickKey)) {
        _logOnce("bilibili.check() - 快速防重触发\n", this._quickKey);
        stopByQuick = true;
      }

      for (let i = 0; i < maxTry; i++) {
        // 需要的页面元素：列表头部、标题、视频卡片
        const $warp = $n(SEL.header);
        const $title = $warp?.querySelector(".title");
        const $cards = [...this._$cards()];
        this._$list.$warp = $warp;
        this._$list.$title = $title;
        this._$list.$cards = $cards;
        // 三者都在，才算加载完成
        if ($warp && $title && $cards.length > 0) {
          return {
            loaded: true,
            stopByQuick,
          };
        }
        // 没有卡片且不在加载中、且列表为空，则无需继续等待
        if (!$n(SEL.loading) && $n(SEL.empty)) {
          return {
            loaded: true,
            stopByQuick,
          };
        }
        await _sleep(500);
      }
      _log("bilibili.check() - 等待超时\n", {
        warp: !!this._$list.$warp,
        title: !!this._$list.$title,
        cards: this._$list.$cards.length,
      });
      return {
        loaded: false,
        stopByQuick,
      };
    },

    // 在页面元素中显示进度
    showProgress(itemIndex = -1, pageTotal = -1, remoteTotal = -1) {
      const $warp = this._$list.$warp;
      const $title = this._$list.$title;
      if (!$warp || !$title) {
        return;
      }
      // 向 $warp 中添加进度元素
      let $progress = $n("#gm-progress");
      if (!$progress) {
        const $div = document.createElement("div");
        $div.id = "gm-progress";
        $div.style = "margin: 4px 8px;";
        $div.style.color = "red";
        $div.style.fontSize = "18px";
        $div.style.fontWeight = "bold";
        // 加到 $title 后面
        $title.parentNode.insertBefore($div, $title.nextSibling);
        $progress = $div;
      }
      // 更新进度
      $progress.textContent = `进度: ${itemIndex}/${pageTotal} 远程: ${remoteTotal}`;
    },

    // 重置进度条
    resetProgress() {
      this.showProgress(-1, -1, -1);
    },

    // 从卡片中提取需要的信息
    pickCard($card) {
      // 卡片中的视频链接（封面、标题均指向视频页）
      const $link = $card.querySelector("a[href*=\"/video/BV\"]");
      if (!$link) {
        return null;
      }
      const oMatch = $link.getAttribute("href").match(RE_BVID);
      if (!oMatch) {
        return null;
      }
      const bvid = oMatch[1];
      // 标题：网格模式在卡片标题，列表模式在卡片外层 a.title
      let title = "";
      const $title = $card.querySelector(".bili-video-card__title");
      if ($title) {
        title = $title.getAttribute("title") || $title.textContent;
      }
      if (!title) {
        const $aTitle = $card.querySelector("a.title");
        if ($aTitle) {
          title = $aTitle.getAttribute("title") || $aTitle.textContent;
        }
      }
      // 日期：「xxxx-xx-xx」
      const $subtitle = $card.querySelector(".bili-video-card__subtitle");
      const oDate = ($subtitle ? $subtitle.textContent : $card.textContent).match(RE_DATE);
      return {
        uid: this.data.uid,
        name: this.data.username,
        bvid,
        title: title.trim(),
        date: oDate ? oDate[0] : _getDateStr(),
        url: `https://www.bilibili.com/video/${bvid}`,
        category: this.data.category,
      };
    },

    // 从网页元素中获取投稿视频
    async getVideosFromPage($cards) {
      const videoList = $cards || [...this._$cards()];
      const videos = [];
      const bvids = new Set();
      videoList.forEach(($card) => {
        const v = this.pickCard($card);
        if (!v || bvids.has(v.bvid)) {
          return;
        }
        bvids.add(v.bvid);
        videos.push(v);
      });
      // bvids 里取首尾各两个 bvid
      const arrTmp = [...bvids];
      const arrSet = new Set(arrTmp.slice(0, 2).concat(arrTmp.slice(-2)));
      this._quickKey = Array.from(arrSet).join("_");
      return videos;
    },

    // 主函数
    main() {
      // 获取当前网址
      gob.curUrl = _curUrl();
      // 判断网址是否匹配 https://space.bilibili.com/7078836/upload/video
      if (!gob.curUrl.match(/space\.bilibili\.com\/\d+\/upload\/video/)) {
        return;
      }
      // 避免 MutationObserver 触发导致的重复执行
      if (this._busy) {
        return;
      }
      // 网址改变时重置状态
      if (gob.curUrl !== gob.lstUrl) {
        gob.lstUrl = gob.curUrl;
        this._sent.clear();
        this.resetProgress();
        _logHis.clear();
      }
      this._busy = true;
      let bQuickCheckStopped = false;
      // 等待列表渲染完成，元素存于 this._$list
      this.check().then((checkResult) => {
        bQuickCheckStopped = checkResult.stopByQuick;
        if (bQuickCheckStopped) {
          return;
        }
        // 初始显示进度
        this.showProgress();
        // 取需要的页面元素
        const $cards = checkResult.loaded ? this._$list.$cards : [];
        // 获取用户投稿视频
        return this.getVideosFromPage($cards);
      }).then((vlist) => {
        if (bQuickCheckStopped) {
          return;
        }
        _logOnce("bilibili.main()->vlist\n", vlist);
        // 过滤掉已经发送过的视频
        const list = vlist.filter(v => !this._sent.has(v.bvid));
        list.length && _log("bilibili.main()\n", {
          total: vlist.length,
          new: list.length,
        });
        if (list.length === 0) {
          return;
        }
        list.forEach(v => this._sent.add(v.bvid));
        // 更新进度通过 bilibili.data 传递给 gob.post
        bilibili.data.showProgress = (itemIndex, remoteTotal) => {
          bilibili.showProgress(itemIndex, list.length, remoteTotal);
        };
        // 计数器清零
        gob.postIndex = 0;
        gob.postCount = 0;
        gob.errCount = 0;
        _logOnce("bilibili.main()->data", bilibili.data);
        // 对于 list 中的每个视频，发送到远程，使用异步队列
        const queue = createQueue(list, gob.post, bilibili.data);
        runQueue(queue);
      }).catch((error) => {
        _log("bilibili.main() - error\n", error);
      }).finally(() => {
        this._busy = false;
        if (bQuickCheckStopped) {
          return;
        }
        // 执行期间页面可能又渲染出新内容，补一次检查
        const bHasNew = [...this._$cards()].some(($card) => {
          const v = this.pickCard($card);
          return v && !this._sent.has(v.bvid);
        });
        if (bHasNew) {
          setTimeout(() => this.main(), 500);
        }
      });
    },

    // 监听网页元素变化
    watch() {
      const $body = $n("body");
      if (!$body) {
        return;
      }
      const _this = this;
      fnElChange($body, _this.main.bind(_this));
    },
  };

  bilibili.watch();
  bilibili.main();

  (() => {
    if (!curUrl.includes("feedly")) {
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
      }
      else {
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
