const gm_banner = `
// ==UserScript==
// @name         「水水」网络剪切版助手
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  针对网络剪切版的辅助工具，匹配网址链接使其可以点击打开...
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
// @match        https://netcut.cn/*
// @grant        GM_addStyle
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "CutNoteHelper";

const gm_require = [
  // {
  //   "url": "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js",
  //   "func": "$",
  // },
];

export { gm_banner, gm_name, gm_require };
