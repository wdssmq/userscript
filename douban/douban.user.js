// ==UserScript==
// @name         「水水」豆瓣助手
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  辅助删除日记什么的
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
// @match        https://www.douban.com/people/*
// @match        http://localhost:3000/
// @grant        none
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "douban";

  // 初始常量或函数
  const curUrl = window.location.href;

  // -------------------------------------

  const _curUrl = () => { return window.location.href };

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}] |`, ...args);

  // -------------------------------------

  const $ = window.$ || unsafeWindow.$;

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
  const gobInfo = {
    // key: [默认值, 是否记录至 ls]
    keepList: [[], true],
    lstPageUrl: ["", true],
    infoList: [[], false],
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

  const fnCheckKeep = (info) => {
    const { url } = info;
    const { keepList } = gob;
    // [{ url: "https://www.douban.com/note/1234567/" }, ...]
    const bolKeep = keepList.some(item => item.url === url);
    return bolKeep;
  };

  const fnAddKeep = (info) => {
    const { keepList } = gob;
    keepList.push(info);
    gob.keepList = keepList;
    gob.save();
  };

  const fnSavePageUrl = () => {
    gob.lstPageUrl = curUrl;
    gob.save();
  };

  const fnCheckPageUrl = (goto = false) => {
    let { lstPageUrl } = gob;
    // 移除掉 &_i=xxx
    const curUrl = _curUrl().replace(/&_i=.+/, "");
    lstPageUrl = lstPageUrl.replace(/&_i=.+/, "");
    // 调试
    _log("fnCheckPageUrl", { lstPageUrl, curUrl });

    if (lstPageUrl === curUrl || !lstPageUrl) {
      return true;
    }
    if (goto) {
      window.location.href = lstPageUrl;
    }
    return false;
  };

  const fnGetNotes = () => {
    const $$notes = $(".note-container");
    // _log("fnGetNotes", $$notes);
    return $$notes;
  };

  // fnGetNotes();

  const fnSetKeep = ($note, info) => {
    const tplKeep = "「保留」<a href=\"-url-\" title=\"-title-\">-title-</a>";
    $note.html(tplKeep
      .replace(/-url-/g, info.url)
      .replace(/-title-/g, info.title));
    return;
  };

  const fnMngNotes = () => {
    fnCheckPageUrl(true);
    const $$notes = fnGetNotes();
    // 遍历元素
    $$notes.each(function () {
      // 元素节点
      const $note = $(this);
      const $noteTitle = $note.find("h3>a");
      const $noteFooter = $note.find(".note-ft");
      const $noteSNS = $note.find(".sns-bar");
      const $delBtn = $note.find(".note-footer-stat-del a");

      // 日志信息
      const noteInfo = {
        title: $noteTitle.text(),
        url: $note.data("url"),
        $delBtn,
      };
      gob.infoList.push(noteInfo);
     //  _log(gob.infoList);
      // 判断
      const bolKeep = fnCheckKeep(noteInfo);
      if (bolKeep) {
        fnSetKeep($note, noteInfo);
        return;
      }
      // 添加按钮用于设置保留
      const tplKeep = "- 「<a href=\"javascript:;\" class=\"keep-btn\">设为保留</a>」";
      $noteTitle.after(tplKeep);
      // 点击保留按钮
      $note.find(".keep-btn").click(function () {
        const bolConfirm = confirm(`是否保留笔记：${noteInfo.title}`);
        if (!bolConfirm) {
          return;
        }
        fnSavePageUrl();
        fnAddKeep(noteInfo);
        fnSetKeep($note, noteInfo);
      });
      // 隐藏时间
      const $pubDate = $note.find(".pub-date").parent();
      $pubDate.hide();
      // 隐藏 SNS
      $noteSNS.before("<hr>");
      $noteSNS.hide();
      // 显示删除按钮
      $noteFooter.show().prepend("<br>");
      // // 点击删除按钮
      // $delBtn[0].click();
      // delRunning = true;
      _log("noteInfo", noteInfo);
    });
    // _log(gob.data);
  };

  fnMngNotes();

})();
