// ==UserScript==
// @name         「水水」typecho.in 链接提取
// @namespace    https://www.wdssmq.com/
// @version      0.1
// @author       沉冰浮水
// @description  提取 typecho.in 分享的网址
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @match        https://typecho.in/*
// @grant        GM_addStyle
// ==/UserScript==

/* jshint esversion:6 */
(function () {
  "use strict";

  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  GM_addStyle(`
    a.link {
      color: red;
      padding-right: 13px;
    }
  `);

  const re = /https?:\/\/[^\s\n]+/g;
  const sText = $n(".container #content").innerHTML;

  console.log(sText);

  const oMatch = sText.match(re);

  console.log(oMatch, typeof oMatch);

  for (const key in oMatch) {
    if (Object.hasOwnProperty.call(oMatch, key)) {
      const url = oMatch[key];
      const html = `<a class="link" title="${url}" href="${url}" target="_blank">${url}</a>`;

      $n(".container #content").style.marginTop = "10px";
      $n(".container #content").insertAdjacentHTML("beforebegin", html);
    }
  }
})();
