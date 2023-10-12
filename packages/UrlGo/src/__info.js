const gm_banner = `
// ==UserScript==
// @name         「水水」链接跳转
// @namespace    https://www.wdssmq.com/
// @version      placeholder.pkg.version
// @author       沉冰浮水
// @description  跳转到正确的链接；
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
// @match        https://jump.bdimg.com/f*
// @match        https://jump2.bdimg.com/f*
// @match        http://jump.bdimg.com/safecheck/index?url=*
// @match        http://jump2.bdimg.com/safecheck/index?url=*
// @match        https://tieba.baidu.com/safecheck/index?url=*
// @match        https://c.pc.qq.com/middlem.html?pfurl=*
// @match        https://mail.qq.com/cgi-bin/readtemplate?t=*
// @match        https://www.jianshu.com/go-wild*
// @match        https://www.v2ex.com/t/*
// @match        https://link.zhihu.com/*
// @match        https://link.juejin.cn/?target=*
// @grant        none
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */
`;

const gm_name = "UrlGo";

const gm_require = [
];

export { gm_banner, gm_name, gm_require };
