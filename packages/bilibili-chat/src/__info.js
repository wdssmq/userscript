const gm_banner = `
// ==UserScript==
// @name         B 站直播间网页变「聊天群」
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  清除直播间聊天群左边的「空黑」区域
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.com/a/wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://live.bilibili.com/*
// @grant        none
// ==/UserScript==

/* eslint-disable */
`;

const gm_name = "bilibili-chat";

const gm_require = [
  // {
  //   url: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js",
  //   func: "$",
  // },
];

export { gm_banner, gm_name, gm_require };
