const gm_banner = `
// ==UserScript==
// @name         「bilibili」大会员 B 币领取提醒
// @namespace    wdssmq.com
// @version      0.4
// @author       沉冰浮水
// @description  B 币领取提醒、稍后再看列表导出为 *.url 等
// @url          https://greasyfork.org/scripts/398415
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @include      https://www.bilibili.com/*
// @include      https://t.bilibili.com/*
// @include      https://manga.bilibili.com/account-center*
// @include      https://account.bilibili.com/account/big/myPackage
// @match        https://space.bilibili.com/44744006/fans/follow*
// @icon         https://www.bilibili.com/favicon.ico
// @noframes
// @run-at       document-end
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM.openInTab
// ==/UserScript==

/* jshint esversion: 6 */
/* eslint-disable */
`;

const gm_name = "later";

export { gm_banner, gm_name };
