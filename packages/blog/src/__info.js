const gm_banner = `
// ==UserScript==
// @name         「Blog」写作助手
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  发布预定义文章到知乎、简书等平台
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
// @match        https://geeknote.net/*/dashboard/posts/new
// @match        https://geeknote.net/*/dashboard/posts/*/edit
// @match        https://xlog.app/dashboard/*/editor?id=*&type=post
// @grant        none
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "blog-helper";

const gm_require = [
  // {
  //   "url": "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js",
  //   "func": "$",
  // },
  {
    "url": "https://cdn.bootcdn.net/ajax/libs/js-yaml/4.1.0/js-yaml.min.js",
    "func": "jsyaml",
  },
];

export { gm_banner, gm_name, gm_require };
