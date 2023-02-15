const gm_banner = `
// ==UserScript==
// @name         「水水」复制标题网址
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  复制当前页面标题及网址，支持复制为 HTML 及 Markdown。「QQ 群：189574683」
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
// @include      http://*
// @include      https://*
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "copy";

const gm_require = [
  {
    "url": "https://greasyfork.org/scripts/460056-mzlibmenu/code/mzLibMenu.js?version=1149985",
    "func": "mzLibMenu",
  },
];

export { gm_banner, gm_name, gm_require };
