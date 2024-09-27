const gm_banner = `
// ==UserScript==
// @name         「蜜柑计划」列表过滤（简繁/画质）
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  过滤蜜柑计划列表，按照简繁/画质过滤
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
// @match        https://mikanani.me/Home/Bangumi/*
// @match        https://mikanime.tv/Home/Bangumi/*
// @match        https://feedly.com/i/subscription/feed*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "Mikan_Proj";

const gm_require = [
  // {
  //   "url": "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js",
  //   "func": "$",
  // },
];

export { gm_banner, gm_name, gm_require };
