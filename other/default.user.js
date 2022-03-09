// ==UserScript==
// @name         New Userscript
// @namespace    https://www.wdssmq.com/
// @author       沉冰浮水
// @version      0.1
// @description  try to take over the world!
// @match        <$URL$>
// @grant        none
// ==/UserScript==

/* jshint esversion: 6 */
(function () {
  'use strict';
  // 基础函数或变量
  const curUrl = window.location.href;
  const curDate = new Date();
  // const $ = window.$ || unsafeWindow.$;
  const _curUrl = () => { return window.location.href; };
  const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const _log = (...args) => console.log("[GM_]\n", ...args);
  const _warn = (...args) => console.warn("[GM_]\n", ...args);
  const _error = (...args) => console.error("[GM_]\n", ...args);
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // Your code here...

})();
