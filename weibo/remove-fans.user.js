// ==UserScript==
// @name        [新浪微博] - 批量移除粉丝（QQ群：189574683）
// @namespace   https://www.wdssmq.com/
// @version     1.0.2
// @authour     沉冰浮水
// @description 批量移除新浪微博粉丝（话说我已经不用微博了为什么要留着这个）
// ----------------------------
// @link   https://greasyfork.org/zh-CN/scripts/30730
// ----------------------------
// @link   https://afdian.net/@wdssmq
// @link   https://github.com/wdssmq/userscript
// @link   https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @include     https://weibo.com/*/fans*
// @grant       none
// ==/UserScript==
/*jshint esversion:6 */
(function () {
  "use strict";
  const s = document.createElement("script");
  s.setAttribute(
    "src",
    "https://lib.sinaapp.com/js/jquery/2.0.3/jquery-2.0.3.min.js"
  );
  s.onload = function () {
    const $menuList = $(".opt_box .layer_menu_list");
    if ($menuList.length == 0) {
      return;
    }
    $menuList.addClass("xnxf").show();
    setInterval(function () {
      // if ($('a[action-type="removeFan"]').length === 0) location.reload(true);
      if ($(".W_layer .W_btn_a").length === 0) {
        $('a[action-type="removeFan"]')[0].click();
      } else {
        $(".W_layer .W_btn_a")[0].click();
      }
    }, 379);
  };
  document.head.appendChild(s);
})();
