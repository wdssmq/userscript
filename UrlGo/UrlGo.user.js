// ==UserScript==
// @name         「水水」链接跳转
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  跳转到正确的链接
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
// @match        https://jump.bdimg.com/f?kw=*
// @match        http://jump2.bdimg.com/safecheck/index?url=*
// @match        https://c.pc.qq.com/middlem.html?pfurl=*
// @match        https://mail.qq.com/cgi-bin/readtemplate?t=*
// @grant        none
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const curHost = window.location.host;

  // -------------------------------------

  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }

  // 从页面中获取链接
  function fnGetUrlInDOM(selector, attrName) {
    const $dom = $n(selector);
    if ($dom) {
      return $dom[attrName];
    }
    return null;
  }

  // 监测网址是否带有协议
  function fnCheckUrl(url) {
    if (url.indexOf("http") === 0) {
      return url;
    }
    return "http://" + url;
  }

  const stieList = [
    {
      name: "百度贴吧",
      hostList: ["jump2.bdimg.com"],
      url: fnGetUrlInDOM("p.link", "textContent"),
    },
    {
      name: "QQ 客户端",
      hostList: ["c.pc.qq.com"],
      url: fnGetUrlInDOM("#url", "textContent"),
    },
    {
      name: "QQ 邮箱",
      hostList: ["mail.qq.com"],
      url: fnGetUrlInDOM(".safety-url", "textContent"),
    },
  ];

  // 各种中转页跳过
  stieList.forEach((site) => {
    const { name, hostList, url } = site;
    if (hostList.includes(curHost)) {
      if (url) {
        const newUrl = fnCheckUrl(url);
        window.location.href = newUrl;
      }
    }
  });

  // 百度贴吧的各种链接统一
  const arrHostList = [
    "jump.bdimg.com",
  ];

  if (arrHostList.includes(curHost)) {
    const newUrl = window.location.href.replace(curHost, "tieba.baidu.com");
    window.location.href = newUrl;
  }

})();