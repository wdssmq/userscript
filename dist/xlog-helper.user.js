// ==UserScript==
// @name         「水水」xlog.app 辅助工具
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  try to take over the world!
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
// @match        https://xlog.app/dashboard/*
// @grant        none
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "xlog-helper";

  // -------------------------------------

  const _curUrl = () => { return window.location.href };

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
    postList: [[], true],
    postCount: [0, true],
    saveFlag: [false, false],
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

  // 初始化
  gob.init().load();

  // 获取文章列表
  const _getPostList = () => {
    if (_curUrl() !== "https://xlog.app/dashboard/wdssmq/posts") return;
    const $$postList = $na(".-mt-3 > a");
    // _log("postList", $$postList);

    if (!$$postList.length) return;

    const tplPostInfo = {
      date: "",
      slug: "",
      title: "",
      url: "",
    };

    gob.saveFlag = false;
    $$postList.forEach((el) => {
      const $title = el.querySelector(".xlog-post-title > span");
      const title = $title.innerText ? $title.innerText : "无标题";
      const url = el.href;
      const $warpDate = el.querySelector("div.xlog-post-meta + div");
      const date = $warpDate ? $warpDate.innerText : "";
      const postInfo = {
        ...tplPostInfo,
        date,
        title,
        url,
      };
      // 判断是否已经存在
      const pickPost = gob.postList.find(item => item.url === postInfo.url);
      if (pickPost.slug && pickPost.slug !== "") {
        const $meta = el.querySelector(".xlog-post-meta");
        // 添加 slug 到页面，并使用 data 属性标记
        if ($meta && !el.dataset.xlogSlug) {
          const $slug = document.createElement("span");
          $slug.innerText = pickPost.slug;
          $slug.classList.add("text-lg", "ml-2", "text-accent");
          $meta.appendChild($slug);
          el.dataset.xlogSlug = pickPost.slug;
        }
      }
      if (pickPost) return;
      gob.postList.push(postInfo);
      gob.postCount = gob.postList.length;
      gob.saveFlag = true;
    });

    // 保存
    if (gob.saveFlag) {
      gob.save();
    }
  };

  // 更新具体文章信息
  const _updatePostInfo = () => {
    const curUrl = _curUrl();
    if (curUrl.indexOf("https://xlog.app/dashboard/wdssmq/editor") === -1) return;

    const $slug = $n("#slug");
    // _log("slug", $slug);
    if (!$slug) return;
    const slug = $slug.value;

    const pickPost = gob.postList.find(item => item.url === curUrl);
    if (!pickPost) return;

    if (pickPost.slug && pickPost.slug === slug) return;

    pickPost.slug = slug;
    gob.save();
    _log("pickPost", pickPost);

  };

  // 初始化

  const _init = () => {
    const $app = $n("body");
    fnElChange($app, () => {
      _getPostList();
      _updatePostInfo();
    });
  };

  _init();

})();
