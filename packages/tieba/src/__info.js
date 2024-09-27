const gm_banner = `
// ==UserScript==
// @name         「水水」自用贴吧辅助
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  置百丈玄冰而崩裂，掷须臾池水而漂摇。
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
// @match        https://tieba.baidu.com
// @match        https://tieba.baidu.com/index.html
// @match        https://tieba.baidu.com/i/i/forum*
// @match        https://tieba.baidu.com/f?kw=*
// @grant        GM_addStyle
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

if (unsafeWindow.console) {
  unsafeWindow.console.firebug = true;
} else {
  console.firebug = true;
}
`;

const gm_name = "tieba";

const gm_require = [
  // {
  //   "url": "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js",
  //   "func": "$",
  // },
];

export { gm_banner, gm_name, gm_require };
