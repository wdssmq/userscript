const gm_banner = `
// ==UserScript==
// @name         php-v
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  获取符合要求的 PHP 版本信息
// @license      MIT
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
// @match        https://www.php.net/*
// @grant        none
// ==/UserScript==

/* eslint-disable */
`;

const gm_name = "php-v";

const gm_require = [
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js",
    func: "$",
  },
];

export { gm_banner, gm_name, gm_require };
