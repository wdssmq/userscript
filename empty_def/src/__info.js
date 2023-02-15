const gm_banner = `
// ==UserScript==
// @name         New Userscript
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  try to take over the world!
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
// @match        http://127.0.0.1:3000/
// @match        http://localhost:3000/
// @grant        none
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "empty_def";

const gm_require = [
  {
    "url": "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js",
    "func": "$",
  },
];

export { gm_banner, gm_name, gm_require };
