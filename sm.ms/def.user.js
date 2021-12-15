// ==UserScript==
// @name         sm.ms-helper
// @namespace    https://www.wdssmq.com/
// @version      0.1
// @description  优化显示 sm.ms 图片查看
// @author       沉冰浮水
// @match        https://sm.ms/image/*
// @icon         https://www.google.com/s2/favicons?domain=sm.ms
// @grant        GM_setClipboard
// ==/UserScript==
/* jshint esversion:6 */
(function () {
  "use strict";
  // 工具函数
  const $ = window.$ || unsafeWindow.$;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const _log = (...args) => console.log("[sm.ms-helper]", ...args);
  const _warn = (...args) => console.warn("[sm.ms-helper]", ...args);
  const _error = (...args) => console.error("[sm.ms-helper]", ...args);
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // 清除样式
  $(".gr-box").css({ display: "block" });
  // $("footer.footer").css({ display: "none" });
})();
