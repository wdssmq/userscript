// ==UserScript==
// @name         「水水」链接跳转
// @namespace    https://www.wdssmq.com/
// @version      0.1
// @author       沉冰浮水
// @description  跳转到正确的链接
// ----------------------------
// @link     https://afdian.net/@wdssmq
// @link     https://github.com/wdssmq/userscript
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @match        https://jump.bdimg.com/f?kw=*
// @icon         https://www.google.com/s2/favicons?domain=bdimg.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

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
