const gm_banner = `
// ==UserScript==
// @name         「Feedly」中键标记已读 + 收藏导出为*.url
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  新标签页打开条目时自动标记为已读，收藏计数
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
// @match        https://feedly.com/*
// @grant        GM_openInTab
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

/* jshint esversion: 6 */
/* eslint-disable */
`;

const gm_name = "feedly";

const gm_require = [

];

export { gm_banner, gm_name, gm_require };
