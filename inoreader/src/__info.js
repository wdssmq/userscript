const gm_banner = `
// ==UserScript==
// @name         「水水」Inoreader 功能增强
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  自用脚本，导出星标收藏为 *.url 文件等
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
// @match        https://www.inoreader.com/starred
// @grant        GM_setClipboard
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "inoreader";

const gm_require = [
  // {
  //   "url": "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js",
  //   "func": "$",
  // },
];

export { gm_banner, gm_name, gm_require };
