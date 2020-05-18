// ==UserScript==
// @name         Xino 管理工具
// @namespace    沉冰浮水
// @version      0.1
// @description  对不合规的内容加密处理
// @author       沉冰浮水
// @match        https://bbs.zblogcn.com/*
// @require      https://cdn.bootcdn.net/ajax/libs/lz-string/1.4.4/lz-string.min.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  const $ = window.jQuery;
  // console.log($);
  const $btnBad = $(` <a class="btn btn-primary">BAD</a>`);
  const strTip = `<p>此贴因不符合论坛规范已作屏蔽处理，请查看置顶贴，以下为原始内容备份。</p>`;
  $btnBad.css({ color: "#fff" }).click(function () {
    let um = window.UM.getEditor("message");
    let str = um.getContent();
    if (str.indexOf("~~") > -1) {
      return;
    }
    let strCode = LZString.compress(str);
    um.setContent(strTip + `<p>~~${strCode}~~</p>`);

    // let strDeCode = LZString.decompress(strCode);
    // um.setContent(strCode + strDeCode);
  });
  if ($("input[name=update_reason]").length > 0) {
    $("#submit").after($btnBad);
    return;
  }
  // 解码
  $("div.message").each(function () {
    let $secP = $(this).find("p:nth-child(2)");
    if ($secP.length == 0) {
      console.log("skip");
      return;
    }
    let str = $secP.html();
    if (str.indexOf("~~") == -1) {
      return;
    }
    console.log(str);
    str = str.replace(/~~(.+)~~/, function (a, b) {
      console.log(arguments);
      let strDeCode = LZString.decompress(b);
      // console.log(strDeCode);
      return strDeCode;
    });
    $secP.after(str).remove();
  });
})();
