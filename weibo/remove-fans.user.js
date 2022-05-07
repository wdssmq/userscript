// ==UserScript==
// @name        「新浪微博」批量移除粉丝（QQ 群：189574683）
// @namespace   https://www.wdssmq.com/
// @version     1.0.2
// @authour     沉冰浮水
// @description 批量移除新浪微博粉丝（话说我已经不用微博了为什么要留着这个）
// @link   https://greasyfork.org/zh-CN/scripts/30730
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @include     https://weibo.com/*/fans*
// @grant       none
// ==/UserScript==
/* jshint esversion:6 */
(function () {
  "use strict";
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const s = document.createElement("script");
  s.setAttribute(
    "src",
    "https://lib.sinaapp.com/js/jquery/2.0.3/jquery-2.0.3.min.js"
  );
  document.head.appendChild(s);

  function fnDelThisPage() {
    const $menuList = $(".opt_box .layer_menu_list");
    if ($menuList.length == 0) {
      return;
    }
    if (!confirm("将移除当前页全部关注者！")) {
      return;
    }
    $menuList.addClass("xnxf").show();
    const t = setInterval(function () {
      if ($(".W_layer .W_btn_a").length === 0 && $('a[action-type="removeFan"]').length === 0) {
        clearInterval(t);
        return false;
      }
      // if ($('a[action-type="removeFan"]').length === 0) location.reload(true);
      if ($(".W_layer .W_btn_a").length === 0) {
        $('a[action-type="removeFan"]')[0].click();
      } else {
        $(".W_layer .W_btn_a")[0].click();
      }
    }, 379);
  };

  window.onload = async function () {
    let flag = false;
    while (!flag) {
      const $menuList = $(".opt_box .layer_menu_list");
      console.log($menuList, $menuList.length);
      if ($menuList.length > 0) {
        flag = true;
      } else {
        console.log("waiting……");
        await sleep(3000);
      }
    }
    fnDelThisPage();
  }
})();
