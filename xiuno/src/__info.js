const gm_banner = `
// ==UserScript==
// @name         「xiuno」管理工具（QQ 群：189574683）
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  对不合规的内容加密处理
// @license      MIT
// @link         https://greasyfork.org/zh-CN/scripts/419517
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
// @match        https://bbs.zblogcn.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "xiuno";

const gm_require = [
  {
    "url": "https://cdn.bootcdn.net/ajax/libs/lz-string/1.4.4/lz-string.min.js",
    "func": "LZString",
  },
  {
    "url": "https://cdn.bootcdn.net/ajax/libs/js-yaml/4.1.0/js-yaml.min.js",
    "func": "jsyaml",
  },
];

export { gm_banner, gm_name, gm_require };
