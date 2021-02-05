// ==UserScript==
// @name         xiuno 管理工具[QQ群：189574683]
// @namespace    沉冰浮水
// @version      0.2
// @description  对不合规的内容加密处理
// @author       沉冰浮水
// @link   ----------------------------
// @link   https://github.com/wdssmq/userscript
// @link   https://afdian.net/@wdssmq
// @link   https://greasyfork.org/zh-CN/users/6865-wdssmq
// @link   ----------------------------
// @match        https://bbs.zblogcn.com/*
// @require      https://cdn.bootcdn.net/ajax/libs/lz-string/1.4.4/lz-string.min.js
// @grant        none
// ==/UserScript==
/*jshint esversion:6 */
(function () {
  "use strict";
  const $ = window.jQuery;
  // console.log($);
  const $btnBad = $(` <a class="btn btn-primary">BAD</a>`);
  const strTip = `<p>此贴内容或签名不符合论坛规范已作屏蔽处理，请查看置顶贴，以下为原始内容备份。</p>`;
  $btnBad.css({ color: "#fff" }).click(function () {
    let um = window.UM.getEditor("message");
    let str = um.getContent();
    if (str.indexOf("#~~") > -1) {
      return;
    }
    let strCode = LZString.compressToBase64(str);
    um.setContent(strTip + `<p>#~~${strCode}~~#</p>`);
    console.log(LZString.decompressFromBase64(strCode));
    //let strDeCode = LZString.decompressFromBase64(strCode);
    //um.setContent(strCode + strDeCode);
  });
  if ($("input[name=update_reason]").length > 0) {
    $("#submit").after($btnBad);
    return;
  }
  // 楼层地址
  const curHref = location.href.replace(location.hash,"");
  $("li.media.post").each(function () {
    const $me = $(this);
    const pid = $me.data("pid");
    const $date = $me.find("span.date");
    $date.after(`<a class="text-grey ml-2" href="${curHref}#${pid}">楼层地址</a>`);
  })
  // 解码
  $("div.message").each(function () {
    let $secP = $(this).find("p:nth-child(2)");
    if ($secP.length == 0) {
      console.log("skip");
      return;
    }
    let str = $secP.html();
    if (str.indexOf("#~~") == -1) {
      return;
    }
    console.log(str);
    str = str.replace(/#~~(.+)~~#/, function (a, b) {
      console.log(arguments);
      let strDeCode = LZString.decompressFromBase64(b);
      console.log(strDeCode);
      return strDeCode;
    });
    $secP.after(str).remove();
  });
})();
