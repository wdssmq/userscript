// ==UserScript==
// @name         「水水」网络剪切版助手
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  针对网络剪切版的辅助工具，匹配网址链接使其可以点击打开...
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
// @match        https://netcut.cn/*
// @grant        GM_addStyle
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "CutNoteHelper";

  // 初始常量或函数
  const curUrl = window.location.href;

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}] |`, ...args);

  // -------------------------------------

  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }

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
    $note: [null, 0],
    textContent: [null, 0],
    getTextBy: ["textContent", 0],
    insertTo: [["#noteContent", "before"], 0],
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

  // 样式设置
  GM_addStyle(`
.mz-box {
  margin: 5px 0;
}
a.mz-link {
  color: #1779ba;
  padding-right: 13px;
  text-decoration: underline;
}
a.mz-link:hover {
  color: red;
}
`);

  // 匹配不同的服务站点
  gob.initInfoBySite = () => {
    // netcut.cn
    if (curUrl.match(/netcut\.cn/)) {
      gob.$note = $n(".note-wrapper .pre-box");
      gob.insertTo = [".note-wrapper", "before"];
      gob.getTextBy = "textContent";
    }
    gob.textContent = gob.$note[gob.getTextBy];
    // _log("gob.data = ", gob.data);
  };

  // 解析文本内容，将网址转换为链接
  gob.parseText = (text) => {
    const reg = /(https?:\/\/[^\s]+)/g;
    const newText = text.replace(reg, (match, p1) => {
      return `<a class="mz-link" title="${p1}" href="${p1}" target="_blank">${p1}</a>`;
    });
    return newText;
  };

  // 添加内容到页面，位置由 gob.insertTo 决定
  gob.addContent = (content) => {
    const newEl = document.createElement("div");
    newEl.className = "mz-box";
    newEl.innerHTML = content;
    // 用于插入新元素的参考元素
    const $ref = $n(gob.insertTo[0]);
    if (gob.insertTo[1] === "before") {
      $ref.parentNode.insertBefore(newEl, $ref);
    }
  };

  // 通用函数
  gob.main = (retry = 3) => {
    gob.initInfoBySite();
    if (!gob.textContent && retry > 0) {
      setTimeout(() => {
        gob.main(retry - 1);
        _log("retry = ", retry);
      }, 1000);
      return;
    }
    gob.text = gob.textContent;
    const newText = gob.parseText(gob.text);
    // _log("text = ", gob.text);
    // _log("newText = ", newText);
    gob.addContent(newText);
  };

  gob.main();

})();
