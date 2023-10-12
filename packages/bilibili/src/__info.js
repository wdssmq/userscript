const gm_banner = `
// ==UserScript==
// @name         「bilibili」水水自用 | B 币领取提醒、播放进度更新至网址等；
// @namespace    wdssmq.com
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  B 币领取提醒、稍后再看列表导出为 *.url ……
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://greasyfork.org/scripts/398415
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @include      https://www.bilibili.com/*
// @include      https://t.bilibili.com/*
// @include      https://manga.bilibili.com/account-center*
// @include      https://account.bilibili.com/account/big/myPackage
// @match        https://space.bilibili.com/44744006/fans/follow*
// @icon         https://www.bilibili.com/favicon.ico
// @noframes
// @run-at       document-end
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM.openInTab
// ==/UserScript==

/* jshint esversion: 6 */
/* eslint-disable */
`;

const gm_name = "bilibili";

const gm_require = [
  // {
  //   "url": "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js",
  //   "func": "$",
  // },
];

export { gm_banner, gm_name, gm_require };
