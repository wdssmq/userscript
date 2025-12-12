const gm_banner = `
// ==UserScript==
// @name         「Z-Blog」论坛辅助
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  针对 Z-Blog 官方论坛的辅助脚本
// @license      MIT
// @link         https://greasyfork.org/zh-CN/scripts/419517
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
// @match        https://bbs.zblogcn.com/*
// @match        https://app.zblogcn.com/zb_system/admin/edit.php*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "zbp-xiuno";

const gm_require = [
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js",
    func: "LZString",
  },
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js",
    func: "jsyaml",
  },
  {
    url: "https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js",
    func: "showdown",
  },
];

export { gm_banner, gm_name, gm_require };
