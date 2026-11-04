// ==UserScript==
// @name         「水水」收集各种待看链接到远程服务器
// @namespace    https://www.wdssmq.com/
// @version      1.1.0
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

  // 时间处理：统一格式为 Y-m-d H:i:s，并支持各类日期文本的解析


  const DAY_MS = 24 * 60 * 60 * 1000;

  const _curDate = () => new Date();

  // -------------------------------------

  // 完整日期：2025年12月18日 / 2025-12-18，紧随其后的时分秒另行匹配
  const RE_DATE_FULL = /(\d{4})[年./-](\d{1,2})[月./-](\d{1,2})日?/;
  // 日期之后紧接的时分秒： 12:30 / 12:30:45
  const RE_DATE_TIME = /^\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/;
  // 缺年份：10月1日 / 10-01，后者前后需为空白或边界，以免命中「1.2万」之类
  const RE_DATE_MD = /(\d{1,2})\s*月\s*(\d{1,2})\s*日?|(?:^|\s)(\d{1,2})-(\d{1,2})(?=\s|$)/;

  // -------------------------------------

  // 相对时间单位 → 毫秒，解析时按 key 匹配，可自行扩展或整体覆盖
  const UNIT_MS = {
    秒: 1000,
    分钟: 60 * 1000,
    半小时: 30 * 60 * 1000,
    小时: 60 * 60 * 1000,
    天: DAY_MS,
    周: 7 * DAY_MS,
    个月: 30 * DAY_MS,
    年: 365 * DAY_MS,
  };

  // 相对日期 → 天数差，同样可扩展或覆盖
  const DAY_DIFF = {
    今天: 0,
    昨天: 1,
    前天: 2,
  };

  // 无间隔的相对时间词，统一取当前时间
  const REL_NOW = ["刚刚"];

  // -------------------------------------

  // 构造日期，时分秒默认补 0
  function _mkDate(y, m, d, h = 0, mi = 0, s = 0) {
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(mi), Number(s));
  }

  // 统一时间格式：Y-m-d H:i:s；withTime = false 时输出 Y-m-d
  function _fmtDate(date = _curDate(), withTime = true) {
    const dt = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(dt.getTime())) {
      return "";
    }
    const pad = n => String(n).padStart(2, "0");
    const str = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
    return withTime ? `${str} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}` : str;
  }

  // -------------------------------------

  // 正则分支按词长度倒序，避免短词抢先命中，如「个月」与「月」
  const RE_CACHE = new Map();
  const escapeReg = str => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function unitPattern(words = []) {
    return words
      .slice()
      .sort((a, b) => b.length - a.length)
      .map(escapeReg)
      .join("|");
  }

  // 由 UNIT_MS 与 REL_NOW 构造相对时间正则：(数字)?(单位)前 | 即时词
  function reRel(units = {}, nowWords = []) {
    const srcUnit = Object.keys(units);
    const key = `rel|${srcUnit.join("|")}|${nowWords.join("|")}`;
    if (!RE_CACHE.has(key)) {
      const srcNow = nowWords.length > 0 ? `|(${unitPattern(nowWords)})` : "";
      RE_CACHE.set(key, new RegExp(`(?:(\\d+)\\s*)?(${unitPattern(srcUnit)})前${srcNow}`));
    }
    return RE_CACHE.get(key);
  }

  // 由 DAY_DIFF 构造相对日期正则
  function reDay(dayDiff = {}) {
    const srcDay = Object.keys(dayDiff);
    const key = `day|${srcDay.join("|")}`;
    if (!RE_CACHE.has(key)) {
      RE_CACHE.set(key, new RegExp(`(${unitPattern(srcDay)})`));
    }
    return RE_CACHE.get(key);
  }

  // 取数据键对应的值，避开原型链
  function pickVal(obj = {}, key = "") {
    return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
  }

  // 解析日期文本，输出 Y-m-d H:i:s，解析失败返回空字符串
  // 支持：完整日期（可带时分秒）、缺年份、相对时间、相对日期
  // opt：{ baseDate, units, dayDiff, nowWords }，后三者用于覆盖或扩展词表
  function _parseDate(str = "", opt = {}) {
    const text = String(str || "").trim();
    if (!text) {
      return "";
    }
    const units = opt.units || UNIT_MS;
    const dayDiff = opt.dayDiff || DAY_DIFF;
    const nowWords = opt.nowWords || REL_NOW;
    const tmp = opt.baseDate instanceof Date ? opt.baseDate : new Date(opt.baseDate || Date.now());
    const cur = Number.isNaN(tmp.getTime()) ? _curDate() : tmp;
    // 完整年月日；其后紧接的时分秒一并保留
    const oFull = text.match(RE_DATE_FULL);
    if (oFull) {
      const strTime = text.slice(oFull.index + oFull[0].length);
      const oTime = strTime.match(RE_DATE_TIME);
      if (oTime) {
        return _fmtDate(_mkDate(oFull[1], oFull[2], oFull[3], oTime[1], oTime[2], oTime[3] || 0));
      }
      return _fmtDate(_mkDate(oFull[1], oFull[2], oFull[3]));
    }
    // 相对时间：3小时前 / 半小时前 / 刚刚
    const oRel = text.match(reRel(units, nowWords));
    if (oRel) {
      // 「刚刚」一类取当前时间
      if (oRel[3]) {
        return _fmtDate(cur);
      }
      const ms = pickVal(units, oRel[2]) || 0;
      // 未带数字的表述（半小时）按 1 倍计
      const num = oRel[1] ? Number(oRel[1]) : 1;
      if (ms > 0) {
        return _fmtDate(new Date(cur.getTime() - num * ms));
      }
    }
    // 相对日期：昨天
    const oDay = text.match(reDay(dayDiff));
    if (oDay) {
      const diff = pickVal(dayDiff, oDay[1]);
      if (typeof diff === "number") {
        return _fmtDate(_mkDate(cur.getFullYear(), cur.getMonth() + 1, cur.getDate() - diff));
      }
    }
    // 缺年份：10月1日
    const oMd = text.match(RE_DATE_MD);
    if (oMd) {
      const m = oMd[1] || oMd[3];
      const d = oMd[2] || oMd[4];
      if (m && d) {
        const dt = _mkDate(cur.getFullYear(), m, d);
        // 晚于「明天」的日期按去年处理
        if (dt.getTime() - cur.getTime() > DAY_MS) {
          dt.setFullYear(cur.getFullYear() - 1);
        }
        return _fmtDate(dt);
      }
    }
    return "";
  }

  // 初始常量或函数
  const curUrl = window.location.href;
  const curDate = new Date();
  const curTimestamp = Math.floor(curDate.getTime() / 1000);

  // -------------------------------------

  const _curUrl = () => window.location.href;
  const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // -------------------------------------

  // 记录已输出的 log，用于「只输出一次」
  const _logHis = new Set();
  const _log = (...args) => console.log(`[${gm_name}] |`, ...args);
  const _error = (...args) => console.error(`[${gm_name}] |`, ...args);
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

  // 带校验的输入框：取消返回 null，校验不通过返回 false，通过返回输入值
  function fnPrompt(text = "", defValue = "", fnCheck = null) {
    const val = prompt(text, defValue);
    if (val === null) {
      return null;
    }
    const strVal = String(val).trim();
    if (typeof fnCheck === "function" && !fnCheck(strVal)) {
      return false;
    }
    return strVal;
  }

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
    onSave: null,
    defData: {
      // 远程服务（原有）
      baseUrl: "http://127.0.0.1:41897/",
      authToken: "token_value_here",
      // 远程服务开关
      enableCf: false,
      // 完整推送地址：{host}zb_system/cmd.php?act=ajax&src=odd_Later&token=xxx
      zbpUrl: "",
      // ZBP 插件（odd_Later）开关
      enableZbp: false,
      // 已登记 UP：{ [uid]: "name" }，须与插件后台列表一致
      zbpUsers: {},
      // 浮层面板是否折叠
      panelFold: true,
      isInit: false,
    },
    load() {
      const data = GM_getValue("config", this.defData) || {};
      // 老版本存储中缺少新增字段，合并默认值补齐
      config.data = Object.assign({}, this.defData, data);
      if (!config.data.zbpUsers || typeof config.data.zbpUsers !== "object") {
        config.data.zbpUsers = {};
      }
      if (!config.data.isInit) {
        config.data.isInit = true;
        config.save();
      }
    },
    save() {
      GM_setValue("config", config.data);
      _log("[log]config.save()", config.data);
      if (this.onSave) {
        this.onSave();
      }
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

    // 以 JSON 字符串作为报文体，用于 odd_Later 这类读取 php://input 的接口
    postJson(url, obj = {}, headers = {}) {
      return this.request({
        method: "POST",
        url,
        data: JSON.stringify(obj),
        headers: Object.assign({ "Content-Type": "application/json" }, headers),
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
    // 上次同步登记名单的时间戳，-1 表示从未同步
    lstSync: [-1, true],
    curUrl: [location.href, false],
    lstUrl: ["", false],
    curPage: [1, false],
    lstPage: [1, false],
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
        return this;
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
      return this;
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

  // 由推送地址解析站点根与登记名单地址
  // zbpUrl: {host}zb_system/cmd.php?act=ajax&src=odd_Later&token=xxx
  gob.zbpInfo = () => {
    const info = {
      host: "",
      usersUrl: "",
      adminUrl: "",
    };
    const strUrl = (config.data.zbpUrl || "").trim();
    if (!strUrl) {
      return info;
    }
    const oMatch = strUrl.match(/^(https?:\/\/[^/]+\/.*?)zb_system\/cmd\.php/i);
    if (!oMatch) {
      return info;
    }
    info.host = oMatch[1];
    info.usersUrl = `${info.host}zb_users/plugin/odd_Later/usr/bili.json?ts=${curTimestamp}`;
    info.adminUrl = `${info.host}zb_users/plugin/odd_Later/main.php`;
    return info;
  };

  // 距上次同步超过一天时同步一次，成功才记录时间
  gob.checkSyncZbpUsers = async (force = false) => {
    const curTime = curTimestamp;
    if (!force && gob.lstSync > 0 && curTime - gob.lstSync < 86400) {
      return false;
    }
    const rlt = await gob.syncZbpUsers();
    if (rlt) {
      gob.lstSync = curTime;
      gob.save();
    }
    return rlt;
  };

  // 重置同步状态
  gob.resetSyncZbpUsers = () => {
    gob.lstSync = -1;
    gob.save();
  };

  // 拉取登记名单（bili.json）并更新 zbpUsers
  // 名单形如：[{ uid, name, type }]
  gob.syncZbpUsers = async () => {
    const { usersUrl } = gob.zbpInfo();
    if (!usersUrl) {
      _log("gob.syncZbpUsers() - 未配置推送地址");
      return false;
    }
    try {
      const res = await gob.http.get(usersUrl);
      const list = JSON.parse(res.responseText);
      const users = {};
      list.forEach((item) => {
        if (!item || !item.uid) {
          return;
        }
        users[String(item.uid)] = String(item.name || item.uid);
      });
      config.data.zbpUsers = users;
      config.save();
      _log("gob.syncZbpUsers()\n", users);
      return true;
    }
    catch (error) {
      _log("gob.syncZbpUsers() - error\n", error);
      return false;
    }
  };

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
  gob.stopByQuickCheck = (quickKey, write = false) => {
    if (quickKey === "")
      return null;
    const lsData = lsObj.getItem(quickKey, { count: -1 });
    if (lsData.count >= 4) {
      return true;
    }
    if (write) {
      lsData.count += 1;
      lsObj.setItem(quickKey, lsData);
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
  config.onSave = gob.resetSyncZbpUsers;
  gob.checkSyncZbpUsers();

  // 标题清洗：去空白与 #
  gob.filter = str => String(str).replace(/\s/g, "").replace(/#/g, "");

  // 统一取时间，格式均为 Y-m-d H:i:s
  // date：视频发布时间，取不到时回退为当前时间
  // time：提交时间，即实际发出请求的时间
  function pickTime(info = {}, data = {}) {
    return {
      date: info.date || data.date || _fmtDate(),
      time: info.time || _fmtDate(),
    };
  }

  // 发送链接信息到远程服务（CF）
  // info: { uid, name, bvid, title, date, time, url, category }
  gob.postCF = async (info, data = {}) => {
    // 未启用则不发请求
    if (!config.data.enableCf) {
      _logOnce("gob.postCF() - 远程服务未启用，跳过发送");
      return false;
    }
    const { baseUrl, authToken } = config.data;
    gob.postIndex += 1;
    info.title = gob.filter(info.title);
    const { date, time } = pickTime(info, data);
    const url = `${baseUrl}add?url=${encodeURIComponent(info.url)}&title=${encodeURIComponent(info.title)}&author=${encodeURIComponent(data.username)}&category=${encodeURIComponent(data.category)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`;
    _log(`gob.postCF() - ${gob.postIndex}\n`, url);
    try {
      const res = await gob.http.get(url, {
        Authorization: `Bearer ${authToken}`,
      });
      _log("gob.postCF()\n", res.responseText);
      if (res.status !== 200) {
        return false;
      }
      const resJSON = JSON.parse(res.responseText);
      gob.remoteTotal = resJSON.data.count || 0;
      if (typeof data.showProgress === "function") {
        data.showProgress(gob.postIndex, gob.remoteTotal);
      }
      return true;
    }
    catch (error) {
      _log("gob.postCF() - error\n", error);
      return false;
    }
  };

  // 发送链接信息到 ZBP 插件（odd_Later）
  // 推送地址形如：{host}zb_system/cmd.php?act=ajax&src=odd_Later&token=xxx
  gob.postZBP = async (info, data = {}) => {
    // 未启用则不发请求
    if (!config.data.enableZbp) {
      _logOnce("gob.postZBP() - ZBP 插件未启用，跳过发送");
      return false;
    }
    const strUrl = (config.data.zbpUrl || "").trim();
    if (!strUrl) {
      _logOnce("gob.postZBP() - 未配置推送地址");
      return false;
    }
    // 只推送已登记的 UP
    const uid = String(info.uid || data.uid || "").trim();
    if (!(config.data.zbpUsers || {})[uid]) {
      _logOnce(`gob.postZBP() - 未登记的 UP，跳过发送：${uid}`);
      return false;
    }
    const { date, time } = pickTime(info, data);
    const body = {
      uid,
      name: info.name || data.username || "",
      url: info.url,
      title: info.title,
      // 视频发布时间与提交时间，均为 Y-m-d H:i:s
      date,
      time,
    };
    // _log("gob.postZBP()\n", body);
    try {
      const res = await gob.http.postJson(strUrl, body);
      const resJSON = JSON.parse(res.responseText);
      gob.remoteTotal = resJSON.data.count || 0;
      if (typeof data.showProgress === "function") {
        gob.postIndex += 1;
        data.showProgress(gob.postIndex, gob.remoteTotal);
      }
      const { code, msg } = resJSON.err;
      const logInfo = msg === "" ? info.bvid : `${msg} - ${info.bvid}`;
      _log(`gob.postZBP() -> ${code} - ${logInfo}`);
      return code === 0 || code === 6;
    }
    catch (error) {
      _log("gob.postZBP() - error\n", error);
      return false;
    }
  };

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
    // 当前分页
    curPage: ".video-footer .vui_button--active-blue",
  };
  // 从链接中提取 BVID
  const RE_BVID = /\/video\/(BV[0-9A-Za-z]+)/;

  // df For Old ↑
  // df For Old ↑

  // df For New ↓
  // df For New ↓

  // 快速防重
  const stopQuick = {
    key: "",
    // 组成 key 的 bvid
    bvids: new Set(),
    // 本网址会话内已走过 fnPost 的 bvid
    tried: new Set(),
    // 当前 key 是否已写入过计数
    written: false,

    // 网址变化时重置
    reset() {
      this.key = "";
      this.bvids.clear();
      this.tried.clear();
      this.written = false;
    },

    // 检查快速防重是否触发，只读检查
    checkOnly(quickKey) {
      if (!quickKey || !gob.stopByQuickCheck(quickKey, false)) {
        return false;
      }
      _logOnce("stopQuick.checkOnly() - 快速防重触发\n", quickKey);
      return true;
    },

    // 更新快速防重 key，并另存一份组成 key 的 bvid
    setKey(quickKey, quickBvids) {
      if (quickKey === this.key) {
        return;
      }
      this.key = quickKey;
      this.bvids = new Set(quickBvids);
      this.written = false;
    },

    // 记录走过一遍 fnPost 的 bvid，全部到齐后才写入计数
    // 网址变化或 key 变化前，同一 key 只写一次
    writeCheck(bvid, rltPost = false) {
      if (bvid) {
        this.tried.add(bvid);
      }
      const { key, bvids, tried, written } = this;
      if (written || !key || bvids.size === 0 || !rltPost) {
        return false;
      }
      const bAllTried = Array.from(bvids).every(item => tried.has(item));
      if (!bAllTried) {
        return false;
      }
      this.written = true;
      _logOnce("stopQuick.writeCheck() - 已全部发送，写入计数\n", key);
      return !!gob.stopByQuickCheck(key, true);
    },
  };

  // df bilibili

  const bilibili = {
    // 变量复用
    data: {
      uid: "",
      username: "",
      category: "default",
      // 兜底的发布时间：今天 00:00:00，格式 Y-m-d H:i:s
      date: `${_fmtDate(curDate, false)} 00:00:00`,
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

    _$curPage() {
      const $el = $n(SEL.curPage);
      const num = $el ? Number.parseInt($el.textContent.trim(), 10) || 1 : 1;
      return {
        $el,
        num,
      };
    },

    // 网页加载检查
    async check(maxTry = 20) {
      this.data.username = this.getUsername();
      this.data.uid = this.getUid();
      const logInfo = JSON.stringify(this.data);
      _logOnce("bilibili.check() - usrData:", logInfo);
      const initProgress = () => {
        if (!this._$list.$progress) {
          this.showProgress();
        }
      };

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
          initProgress();
          return {
            loaded: true,
          };
        }
        // 没有卡片且不在加载中、且列表为空，则无需继续等待
        if (!$n(SEL.loading) && $n(SEL.empty)) {
          initProgress();
          return {
            loaded: true,
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
        $div.style = "margin-left: auto;";
        $div.style.color = "red";
        $div.style.fontSize = "18px";
        $div.style.fontWeight = "bold";
        // 加到 $title 后面
        $title.parentNode.insertBefore($div, $title.nextSibling);
        $progress = $div;
        this._$list.$progress = $progress;
      }
      // 更新进度
      $progress.textContent = `进度: ${itemIndex}/${pageTotal} 远程: ${remoteTotal}`;
      if (!$n("#gm-copy-up")) {
        const $button = document.createElement("button");
        $button.id = "gm-copy-up";
        $button.type = "button";
        $button.textContent = "复制";
        $button.style = "margin-left: 8px;";
        $button.classList.add("vui_button");
        $button.addEventListener("click", async () => {
          const text = `uid: ${this.data.uid}\nname: ${this.data.username}\ntype: up`;
          try {
            await navigator.clipboard.writeText(text);
            $button.textContent = "已复制";
            setTimeout(() => {
              $button.textContent = "复制";
            }, 1500);
          }
          catch (error) {
            _error("bilibili.copyUpInfo() - error\n", error);
            $button.textContent = "复制失败";
          }
          // 强制同步一次
          gob.checkSyncZbpUsers(true);
          // 重置下一次
          gob.resetSyncZbpUsers();
        });
        $progress.insertAdjacentElement("beforebegin", $button);
      }
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
      // 发布时间：「2025年12月18日」「10月1日」等，统一为 Y-m-d H:i:s
      const $subtitle = $card.querySelector(".bili-video-card__subtitle");
      const strDate = _parseDate($subtitle ? $subtitle.textContent : "");
      return {
        uid: this.data.uid,
        name: this.data.username,
        bvid,
        title: title.trim(),
        // 发布时间；解析不到时回退到「今天」
        date: strDate || this.data.date,
        // 提交时间由发送时统一填充
        time: "",
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
      return {
        videos,
        quickKey: Array.from(arrSet).join("_"),
        quickBvids: arrSet,
      };
    },

    // 主函数
    main() {
      // 避免 MutationObserver 触发导致的重复执行
      if (this._busy) {
        return;
      }
      // 获取当前网址
      gob.curUrl = _curUrl();
      // 判断网址是否匹配 https://space.bilibili.com/7078836/upload/video
      if (!gob.curUrl.match(/space\.bilibili\.com\/\d+\/upload\/video/)) {
        return;
      }
      // 获取当前页码
      const { num } = this._$curPage();
      gob.curPage = num;
      // 网址改变时重置状态
      if (gob.curUrl !== gob.lstUrl || gob.curPage !== gob.lstPage) {
        gob.lstUrl = gob.curUrl;
        gob.lstPage = gob.curPage;
        this._sent.clear();
        stopQuick.reset();
        this.resetProgress();
        _logHis.clear();
      }
      // 加载完成后的快速防重检查，实际加载检查在这之后
      const quickKeyAtStart = stopQuick.key;
      if (stopQuick.checkOnly(quickKeyAtStart)) {
        return;
      }
      this._busy = true;
      // 加载检查中的快速防重标记
      let bQuickCheckStopped = false;
      // 等待列表渲染完成，元素存于 this._$list
      this.check().then((checkResult) => {
        // 取需要的页面元素
        const $cards = checkResult.loaded ? this._$list.$cards : [];
        // 获取用户投稿视频
        return this.getVideosFromPage($cards);
      }).then(({ videos, quickKey, quickBvids }) => {
        let logInfo = videos.length;
        _logOnce("bilibili.main() - vlist:", logInfo);
        // 更新快速防重 key，并另存一份组成 key 的 bvid
        stopQuick.setKey(quickKey, quickBvids);
        if (quickKey !== quickKeyAtStart && stopQuick.checkOnly(quickKey)) {
          bQuickCheckStopped = true;
          return;
        }
        // 过滤掉已经发送过的视频
        const list = videos.filter(v => !this._sent.has(v.bvid));
        logInfo = list.length;
        _logOnce("bilibili.main() - new list length:", logInfo);
        if (list.length === 0) {
          return;
        }
        list.forEach(v => this._sent.add(v.bvid));
        // 更新进度通过 bilibili.data 传给发送封装
        bilibili.data.showProgress = (itemIndex, remoteTotal) => {
          bilibili.showProgress(itemIndex, list.length, remoteTotal);
        };
        // 计数器清零
        gob.postIndex = 0;
        gob.postCount = 0;
        gob.errCount = 0;
        // _logOnce("bilibili.main()->data", bilibili.data);
        // 两套远程各发一次，任一成功即算成功
        const fnPost = async (info, data) => {
          const rltCF = await gob.postCF(info, data);
          const rltZBP = await gob.postZBP(info, data);
          // 无论成功与否，该 bvid 都算走过一遍 fnPost
          stopQuick.writeCheck(info.bvid, rltCF || rltZBP);
          return rltCF || rltZBP;
        };
        // 对于 list 中的每个视频，发送到远程，使用异步队列
        const queue = createQueue(list, fnPost, bilibili.data);
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

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = "#gm-later-panel {\n  position: fixed;\n  right: 16px;\n  bottom: 16px;\n  z-index: 2147483000;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  font-size: 12px;\n  color: #fff;\n  line-height: 1.5;\n  -webkit-user-select: none;\n  user-select: none;\n}\n\n#gm-later-panel * {\n  box-sizing: border-box;\n}\n\n.gm-later-card {\n  width: 260px;\n  max-width: calc(100vw - 32px);\n  background: rgba(31, 33, 40, .9);\n  backdrop-filter: blur(14px);\n  -webkit-backdrop-filter: blur(14px);\n  border: 1px solid rgba(255, 255, 255, .12);\n  border-radius: 12px;\n  box-shadow: 0 10px 28px rgba(0, 0, 0, .35);\n  overflow: hidden;\n  animation: gm-later-in .16s ease-out;\n}\n\n@keyframes gm-later-in {\n  from {\n    opacity: 0;\n    transform: translateY(6px) scale(.98);\n  }\n\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n\n.gm-later-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 12px;\n  font-size: 14px;\n  font-weight: 600;\n  background: linear-gradient(90deg, rgba(251, 114, 153, .18), rgba(35, 173, 229, .14));\n}\n\n.gm-later-fold {\n  cursor: pointer;\n  color: #C9CCD4;\n  font-size: 12px;\n  font-weight: 400;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: rgba(255, 255, 255, .08);\n  transition: background .16s ease, color .16s ease;\n}\n\n.gm-later-fold:hover {\n  background: rgba(255, 255, 255, .16);\n  color: #fff;\n}\n\n.gm-later-body {\n  padding: 10px 12px 12px;\n}\n\n.gm-later-sec {\n  margin-bottom: 10px;\n  padding: 8px 10px;\n  border-radius: 8px;\n  background: rgba(43, 46, 56, .8);\n}\n\n.gm-later-sec:last-of-type {\n  margin-bottom: 0;\n}\n\n.gm-later-title {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  font-size: 13px;\n  font-weight: 500;\n  color: #fff;\n}\n\n.gm-later-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-top: 6px;\n  color: #C9CCD4;\n}\n\n.gm-later-row>span:first-child {\n  color: #8B90A0;\n}\n\n.gm-later-sw {\n  width: 36px;\n  height: 20px;\n  border-radius: 999px;\n  background: #6B6F7A;\n  position: relative;\n  cursor: pointer;\n  transition: background .16s ease;\n}\n\n.gm-later-sw[data-on=\"true\"] {\n  background: #FB7299;\n}\n\n.gm-later-sw i {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  background: #fff;\n  transition: left .16s ease;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, .4);\n}\n\n.gm-later-sw[data-on=\"true\"] i {\n  left: 18px;\n}\n\n.gm-later-link {\n  cursor: pointer;\n  color: #23ADE5;\n  max-width: 150px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.gm-later-link:hover {\n  text-decoration: underline;\n}\n\n.gm-later-ok {\n  color: #3DBF7A;\n}\n\n.gm-later-warn {\n  color: #F5A623;\n}\n\n.gm-later-err {\n  color: #E5534B;\n}\n\n.gm-later-hidden {\n  display: none;\n}\n\n.gm-later-status {\n  margin-top: 10px;\n  padding: 6px 8px;\n  border-radius: 8px;\n  font-size: 12px;\n  color: #C9CCD4;\n  background: rgba(255, 255, 255, .05);\n  word-break: break-all;\n}\n\n.gm-later-fab {\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  cursor: pointer;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  background: rgba(31, 33, 40, .9);\n  backdrop-filter: blur(14px);\n  -webkit-backdrop-filter: blur(14px);\n  border: 1px solid rgba(255, 255, 255, .12);\n  box-shadow: 0 8px 20px rgba(0, 0, 0, .35);\n  transition: transform .16s ease, box-shadow .16s ease;\n}\n\n.gm-later-fab:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 12px 24px rgba(0, 0, 0, .45);\n}\n\n.gm-later-fab-t {\n  font-size: 11px;\n  font-weight: 600;\n  color: #fff;\n  letter-spacing: .5px;\n}\n\n.gm-later-fab-n {\n  font-size: 11px;\n  color: #FB7299;\n}\n";
  styleInject(css_248z);

  // 浮层设置面板：两套远程的开关与地址，改动即时保存
  const ID_ROOT = "gm-later-panel";

  // 空间页 UP 的 uid
  const RE_UID = /space\.bilibili\.com\/(\d+)/;
  // 昵称所在元素，与 _bilibili 中的选择器一致
  const SEL_USERNAME = ".header-upinfo .upinfo-detail .nickname";
  // ZBP 插件推送地址的特征
  const RE_ZBP_URL = /src=odd_Later/i;

  // 取地址中的 host，解析失败返回空串
  function urlHost(url) {
    try {
      return new URL(url).host;
    }
    catch {
      return "";
    }
  }

  // 转义后插入面板，避免页面文本被当作 HTML 解析
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    }[c]));
  }

  const panel = {
    // 当前是否已注入面板
    isPage() {
      return /space\.bilibili\.com/i.test(location.href);
    },

    // 已启用的远程数量，用于角标提示
    enabledCount() {
      return [config.data.enableCf, config.data.enableZbp].filter(Boolean).length;
    },

    // 已登记 UP 列表：{ [uid]: "name" }
    users() {
      if (!config.data.zbpUsers || typeof config.data.zbpUsers !== "object") {
        config.data.zbpUsers = {};
      }
      return config.data.zbpUsers;
    },

    // 当前空间页的 UP 信息，用户名取不到时退回 uid
    curUp() {
      const oMatch = location.href.match(RE_UID);
      const uid = oMatch ? oMatch[1] : "";
      const $name = $n(SEL_USERNAME);
      let name = $name ? $name.textContent.trim() : "";
      if (!name) {
        // 兜底：document.title 形如 「某某的个人空间-……」
        const oTitle = document.title.match(/^(.+?)的个人空间/);
        if (oTitle) {
          name = oTitle[1];
        }
      }
      return {
        uid,
        name,
      };
    },

    // 记录最近一次提示，并只刷新状态行
    notify(text, type = "") {
      this.last = {
        text,
        type,
      };
      _log("panel.notify()\n", this.last);
      this.renderStatus();
    },

    // 收起时的角标
    htmlFab() {
      return `
      <div class="gm-later-fab" data-act="fold" title="later-url 远程设置">
        <span class="gm-later-fab-t">later</span>
        <span class="gm-later-fab-n">${this.enabledCount()}/2</span>
      </div>
    `;
    },

    // 开关组件
    htmlSwitch(act, on) {
      return `<span class="gm-later-sw" data-act="${act}" data-on="${on ? "true" : "false"}"><i></i></span>`;
    },

    // 远程服务区块
    htmlCf() {
      const { baseUrl, authToken, enableCf } = config.data;
      const host = urlHost(baseUrl) || "未配置";
      const token = authToken ? `${String(authToken).slice(0, 6)}•••` : "未配置";
      return `
      <div class="gm-later-sec gm-later-hidden">
        <div class="gm-later-title">
          <span>远程服务</span>
          ${this.htmlSwitch("cf-switch", enableCf)}
        </div>
        <div class="gm-later-row">
          <span>地址</span>
          <span class="gm-later-link" data-act="cf-url" title="点击重填">${host}</span>
        </div>
        <div class="gm-later-row">
          <span>Token</span>
          <span class="gm-later-link" data-act="cf-token" title="点击重填">${token}</span>
        </div>
      </div>
    `;
    },

    // ZBP 插件区块，已登记部分只读展示
    htmlZbp() {
      const { zbpUrl, enableZbp } = config.data;
      const { adminUrl } = gob.zbpInfo();
      const strUrl = (zbpUrl || "").trim();
      const hasUrl = /^https?:\/\//i.test(strUrl);
      const users = this.users();
      const uidList = Object.keys(users);
      // 当前页面 UP 的登记状态
      const { uid, name } = this.curUp();
      const isReg = !!uid && Object.hasOwnProperty.call(users, uid);
      const htmlUrl = hasUrl
        ? `<span class="gm-later-link" data-act="zbp-url" title="点击重填">${urlHost(strUrl) || "已配置"}</span>`
        : `<span class="gm-later-link gm-later-err" data-act="zbp-url">点此粘贴推送地址</span>`;
      const htmlCur = uid
        ? `<div class="gm-later-row">
          <span>当前 UP</span>
          ${isReg
            ? `<span class="gm-later-ok">已登记：${escapeHtml(users[uid] || name || uid)}</span>`
            : `<span class="gm-later-warn">未登记：${escapeHtml(name || uid)}</span>`}
        </div>`
        : "";
      return `
      <div class="gm-later-sec">
        <div class="gm-later-title">
          <span>ZBP 插件</span>
          ${this.htmlSwitch("zbp-switch", enableZbp)}
        </div>
        <div class="gm-later-row">
          <span>推送地址</span>
          ${htmlUrl}
        </div>
        <div class="gm-later-row">
          <span>已登记 ${uidList.length} 个</span>
          ${adminUrl
            ? `<a class="gm-later-link" href="${escapeHtml(adminUrl)}" target="_blank" title="ZBP 管理地址">管理地址</a>`
            : `<span>未配置</span>`}
        </div>
        ${htmlCur}
      </div>
    `;
    },

    htmlCard() {
      return `
      <div class="gm-later-card">
        <div class="gm-later-head">
          <span>远程设置</span>
          <span class="gm-later-fold" data-act="fold">收起</span>
        </div>
        <div class="gm-later-body">
          ${this.htmlCf()}
          ${this.htmlZbp()}
          <div class="gm-later-status">${this.statusHtml()}</div>
        </div>
      </div>
    `;
    },

    // 状态行文本
    statusHtml() {
      const last = this.last || {};
      if (last.text) {
        const cls = last.type === "ok" ? "gm-later-ok" : (last.type === "err" ? "gm-later-err" : (last.type === "warn" ? "gm-later-warn" : ""));
        return `<span class="${cls}">${last.text}</span>`;
      }
      if (!config.data.enableCf && !config.data.enableZbp) {
        return `<span class="gm-later-warn">两套远程均未启用，不会发送</span>`;
      }
      if (config.data.enableZbp && !/^https?:\/\//i.test((config.data.zbpUrl || "").trim())) {
        return `<span class="gm-later-warn">ZBP 已启用但未填写推送地址</span>`;
      }
      return `<span>改动即时生效</span>`;
    },

    // 只更新状态行，避免整块重绘打断交互
    renderStatus() {
      const $status = $n(`#${ID_ROOT} .gm-later-status`);
      if ($status) {
        $status.innerHTML = this.statusHtml();
      }
      const $fab = $n(`#${ID_ROOT} .gm-later-fab-n`);
      if ($fab) {
        $fab.textContent = `${this.enabledCount()}/2`;
      }
    },

    render() {
      if (!this.isPage()) {
        return;
      }
      let $root = $n(`#${ID_ROOT}`);
      if (!$root) {
        $root = document.createElement("div");
        $root.id = ID_ROOT;
        document.body.appendChild($root);
      }
      $root.innerHTML = config.data.panelFold ? this.htmlFab() : this.htmlCard();
      $root.onclick = (e) => {
        const $act = e.target.closest("[data-act]");
        if (!$act) {
          return;
        }
        this.onAct($act.dataset.act);
      };
    },

    // 展开/收起
    toggle() {
      if (!this.isPage()) {
        _log("panel.toggle() - 当前页面未注入面板\n", location.href);
        return;
      }
      config.data.panelFold = !config.data.panelFold;
      config.save();
      this.render();
    },

    // 设置 ZBP 推送地址
    setZbpUrl() {
      const val = fnPrompt("粘贴 ZBP 推送地址\n（插件后台复制的完整地址）", config.data.zbpUrl || "", s => /^https?:\/\//i.test(s));
      if (val === null) {
        return false;
      }
      if (val === false) {
        this.notify("地址需以 http(s):// 开头", "err");
        return false;
      }
      config.data.zbpUrl = val;
      config.save();
      const like = RE_ZBP_URL.test(val);
      this.notify(like ? "推送地址已更新" : "地址中未包含 src=odd_Later，请确认是否复制完整", like ? "ok" : "warn");
      return true;
    },

    // 设置远程服务地址
    setCfUrl() {
      const val = fnPrompt("远程服务地址（以 / 结尾）", config.data.baseUrl || "", s => /^https?:\/\//i.test(s));
      if (val === null) {
        return false;
      }
      if (val === false) {
        this.notify("地址需以 http(s):// 开头", "err");
        return false;
      }
      config.data.baseUrl = `${val.replace(/\/+$/, "")}/`;
      config.save();
      this.notify("远程服务地址已更新", "ok");
      return true;
    },

    // 设置远程服务 Token
    setCfToken() {
      const val = fnPrompt("远程服务 Token", config.data.authToken || "");
      if (val === null || val === false) {
        return false;
      }
      config.data.authToken = val;
      config.save();
      this.notify("Token 已更新", "ok");
      return true;
    },

    onAct(act) {
      switch (act) {
        case "fold":
          config.data.panelFold = !config.data.panelFold;
          config.save();
          this.render();
          break;
        case "cf-switch":
          config.data.enableCf = !config.data.enableCf;
          config.save();
          // 开关变化后旧的提示已过期
          this.last = null;
          this.render();
          break;
        case "zbp-switch":
          config.data.enableZbp = !config.data.enableZbp;
          config.save();
          this.last = null;
          this.render();
          break;
        case "cf-url":
          if (this.setCfUrl()) {
            this.render();
          }
          break;
        case "cf-token":
          if (this.setCfToken()) {
            this.render();
          }
          break;
        case "zbp-url":
          if (this.setZbpUrl()) {
            this.render();
          }
          break;
      }
    },

    init() {
      if (!this.isPage()) {
        return;
      }
      this.render();
      // 状态行刷新由 notify() 触发
    },
  };

  panel.init();

})();
