// ==UserScript==
// @name         「漫画」打包下载（QQ 群：189574683）
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  按章节打包下载漫画柜的资源
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
// @match        https://www.manhuagui.com/comic/*/*.html
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "comic";

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

  // 添加内容到指定元素后面
  function fnAfter($ne, e) {
    const $e = typeof e === "string" ? $n(e) : e;
    $e.parentNode.insertBefore($ne, $e.nextSibling);
  }

  // -----------------------

  // 当前项目的各种函数
  function fnGenUrl() {
    // 用于下载图片
    const imgUrl = $n(".mangaFile").getAttribute("src");
    _log("[log]fnGenUrl()", imgUrl);
    // return encodeURI(imgUrl);
    return imgUrl;
  }

  function fnGenInfo() {
    const name = $n(".title h1 a").innerHTML; // 漫画名
    const chapter = $n(".title h2").innerHTML; // 章节
    const pages = $na("option").length; // 总页数
    return { name, chapter, pages };
  }

  // 单图查看
  const setCurImgLink = () => {
    if ($n("#curimg")) {
      $n("#curimg").href = fnGenUrl();
      return;
    }
    const $imgLink = document.createElement("a");
    $imgLink.id = "curimg";
    $imgLink.innerHTML = "查看单图";
    $imgLink.className = "btn-red";
    $imgLink.href = fnGenUrl();
    $imgLink.target = "_blank";
    $imgLink.style.background = "#0077D1";
    $imgLink.style.cursor = "pointer";
    $n(".main-btn").insertBefore($imgLink, $n("#viewList"));
  };
  setCurImgLink();

  // 网络请求
  const fnGet = (url, responseType = "json", retry = 2) =>
    new Promise((resolve, reject) => {
      try {
        // console.log(navigator.userAgent);
        GM_xmlhttpRequest({
          method: "GET",
          url,
          headers: {
            "User-Agent": navigator.userAgent, // If not specified, navigator.userAgent will be used.
            referer: "https://www.manhuagui.com/",
          },
          responseType,
          onerror: (e) => {
            if (retry === 0) reject(e);
            else {
              console.warn("Network error, retry.");
              setTimeout(() => {
                resolve(fnGet(url, responseType, retry - 1));
              }, 1000);
            }
          },
          onload: ({ status, response }) => {
            if (status === 200) resolve(response);
            else if (retry === 0) reject(`${status} ${url}`);
            else {
              console.warn(status, url);
              setTimeout(() => {
                resolve(fnGet(url, responseType, retry - 1));
              }, 500);
            }
          },
        });
      } catch (error) {
        reject(error);
      }
    });


  window.addEventListener("hashchange", () => {
    setCurImgLink();
  });

  // localStorage 封装
  const lsObj = {
    setItem: function (key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    getItem: function (key, def = "") {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return def;
    },
  };

  // 数据读写封装
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

  // 初始化 gobInfo
  const gobInfo = {
    // key: [默认值, 是否记录至 ls]
    curImgUrl: ["", 0],
    curInfo: [{}, 0],
    autoNextC: [0, 1],
    wgetImgs: [[], 1],
    maxWget: [7, 0],
  };

  // 初始化
  gob.init().load();

  gob.curImgUrl = fnGenUrl();
  gob.curInfo = fnGenInfo();
  // gob.wgetImgs = [];

  // _log("[TEST]gob.data", gob.data);

  // const fnGenBash = () => {
  //   let bash = "";
  //   const wgetImgs = gob.wgetImgs;
  //   wgetImgs.forEach((img) => {
  //     bash += `wget "${img.url}" "${img.name}-${img.chapter}.jpg"\n`;
  //   });
  //   return bash;
  // };

  const fnDLImg = async (pageInfo) => {
    // const data = await fnGet(pageInfo.url, "arraybuffer");
    // const data = await fnGet(pageInfo.url, "blob");
    fnGet(pageInfo.url, "arraybuffer").then(
      (res) => {
        let url = window.URL.createObjectURL(new Blob([res]));
        let a = document.createElement("a");
        a.setAttribute("download", `${pageInfo.chapter}.jpg`);
        a.href = url;
        a.click();
      },
    );
  };

  const fnCheckFistPage = (cur, list) => {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.name === cur.name && item.chapter === cur.chapter) {
        return true;
      }
    }
    return false;
  };

  const fnGenFistPage = (auto = false) => {
    // _log("[log]fnGenFistPage()", auto);
    const wgetImgs = gob.wgetImgs;
    if (wgetImgs.length >= gob.maxWget) {
      _log("[log]\n", wgetImgs);
      gob.autoNextC = 0;
      gob.save();
      return;
    } else {
      gob.autoNextC = auto ? 1 : 0;
    }
    const curPage = {
      url: gob.curImgUrl,
      name: gob.curInfo.name,
      chapter: gob.curInfo.chapter,
    };
    if (!fnCheckFistPage(curPage, wgetImgs)) {
      fnDLImg(curPage);
      wgetImgs.push(curPage);
      gob.wgetImgs = wgetImgs;
      gob.save();
    }
    _log("[log]fnGenFistPage()", JSON.stringify(gob.wgetImgs));
    if (gob.autoNextC && $n(".nextC")) {
      setTimeout(() => {
        $n(".nextC").click();
      }, 3000);
    }
  };

  const fnBtn = () => {
    const btn = document.createElement("span");
    if (gob.wgetImgs.length >= gob.maxWget || gob.wgetImgs.length == 0) {
      btn.innerHTML = "收集首图";
    } else {
      btn.innerHTML = `收集首图(${gob.wgetImgs.length + 1} / ${gob.maxWget})`;
    }
    btn.style = "color: #f00; font-size: 12px; cursor: pointer; font-weight: bold; text-decoration: underline; padding-left: 1em;";
    btn.onclick = (() => {
      if (gob.wgetImgs.length >= gob.maxWget) {
        gob.wgetImgs = [];
      }
      fnGenFistPage(true);
    });
    fnAfter(btn, $n("#lighter"));
  };

  fnBtn();

  if (gob.autoNextC) {
    fnGenFistPage(true);
  }

})();
