const gm_banner = `
// ==UserScript==
// @name         __GM_NAME__
// @namespace    __GM_NAMESPACE__
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  __GM_DESCRIPTION__
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
// @match        __GM_MATCH__
// @grant        none
// ==/UserScript==

/* eslint-disable */
`;

const gm_name = "__GM_NAME__";

const gm_require = [
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js",
    func: "$",
  },
];

export { gm_banner, gm_name, gm_require };
