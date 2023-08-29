const gm_banner = `
// ==UserScript==
// @name         「漫画」打包下载
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  按章节打包下载漫画柜的资源「QQ 群：189574683」
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
// @match        https://www.manhuagui.com/comic/*/*.html
// @match        https://tw.manhuagui.com/comic/*/*.html
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "comic";

const gm_require = [
  // {
  //   "url": "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js",
  //   "func": "$",
  // },
  {
    "url": "https://cdn.jsdelivr.net/npm/comlink@4.3.0/dist/umd/comlink.min.js",
    "func": "Comlink",
  },
  {
    "url": "https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js",
    "func": "saveAs",
  },
];

export { gm_banner, gm_name, gm_require };
