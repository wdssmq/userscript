// ==UserScript==
// @name         「水水」链接跳转
// @namespace    https://www.wdssmq.com/
// @version      0.1
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
// @match        https://jump.bdimg.com/f?kw=*
// @match        https://c.pc.qq.com/middlem.html?pfurl=*
// @icon         https://www.google.com/s2/favicons?domain=bdimg.com
// @grant        none
// ==/UserScript==

/* jshint esversion:6 */
(function () {
  'use strict';
  // 基础函数或变量
  const curUrl = window.location.href;
  // const curDate = new Date();
  // const $ = window.$ || unsafeWindow.$;
  // const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const _log = (...args) => console.log("[GM_链接跳转助手]\n", ...args);
  // const _warn = (...args) => console.warn("[GM_]链接跳转助手\n", ...args);
  // const _error = (...args) => console.error("[GM_链接跳转助手]\n", ...args);

  // 获取链接中的参数
  function fnGetParamInUrl(name, url) {
    const match = RegExp('[?&]' + name + '=(?<value>[^&]*)').exec(url);
    return match && decodeURIComponent(match.groups.value);
  }

  // 监测网址是否带有协议
  function fnCheckUrl(url) {
    if (url.indexOf("http") === 0) {
      return url;
    }
    return "http://" + url;
  }


  // 各种中转页跳过
  (() => {
    const arrParamName = [
      'pfurl',
    ];
    arrParamName.forEach((paramName) => {
      let paramValue = fnGetParamInUrl(paramName, curUrl);
      if (paramValue) {
        paramValue = fnCheckUrl(paramValue);
        // _log(`${paramName}=${paramValue}`);
        window.location.href = paramValue;
      }
    });
  })();

  // 百度贴吧的各种链接统一
  (() => {
    const arrHostList = [
      "jump.bdimg.com"
    ];
    const curHost = window.location.host;
    if (arrHostList.includes(curHost)) {
      const newUrl = window.location.href.replace(curHost, "tieba.baidu.com");
      window.location.href = newUrl;
    }
  })();

})();
