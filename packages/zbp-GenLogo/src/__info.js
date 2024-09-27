const gm_banner = `
// ==UserScript==
// @name         「Z-Blog」Logo 生成
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  自动叠加历史图标制作新的图片
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
// @match        http://*/zb_system/admin/index.php?act=PluginMng
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==
/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "zbp-GenLogo";

const gm_require = [

];

export { gm_banner, gm_name, gm_require };
