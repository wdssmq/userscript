const gm_banner = `
// ==UserScript==
// @name         「水水」qBittorrent 管理脚本
// @namespace    做最终做到的事，成为最终成为的人。
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  通过 WebUI 的 API 批量替换 Tracker
// @license      MIT
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.com/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @noframes
// @run-at       document-end
// @include      http://*:8088/
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "qBit";

const gm_require = [
  // {
  //   "url": "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js",
  //   "func": "jQuery",
  // },
  // {
  //   "url": "https://cdn.jsdelivr.net/gh/wdssmq/userscript@main/dist-lib/lib-paiad.js",
  //   "func": "mzPaiad",
  // },
];

export { gm_banner, gm_name, gm_require };
