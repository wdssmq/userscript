const gm_banner = `
// ==UserScript==
// @name         「bilibili」- 稍后再看导出为.url
// @namespace    wdssmq.com
// @version      0.2
// @author       沉冰浮水
// @description  将 B 站的稍后再看列表导出为 *.url 文件
// @url          https://greasyfork.org/scripts/398415
// ----------------------------
// @link     https://afdian.net/@wdssmq
// @link     https://github.com/wdssmq/userscript
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @include      https://www.bilibili.com/*
// @include      https://t.bilibili.com/*
// @include      https://manga.bilibili.com/account-center*
// @include      https://account.bilibili.com/account/big/myPackage
// @icon         https://www.bilibili.com/favicon.ico
// @run-at       document-end
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM.openInTab
// ==/UserScript==
/* jshint esversion:6 */
`;

const gm_name = "later";

export { gm_banner, gm_name };
