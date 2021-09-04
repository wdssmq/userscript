// ==UserScript==
// @name         xiuno 管理工具（QQ群：189574683）
// @namespace    沉冰浮水
// @version      0.3
// @description  对不合规的内容加密处理
// @author       沉冰浮水
// @link         https://greasyfork.org/zh-CN/scripts/419517
// @link     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @link     ----------------------------
// @match        https://bbs.zblogcn.com/*
// @require      https://cdn.bootcdn.net/ajax/libs/lz-string/1.4.4/lz-string.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/moment.js/2.29.1/moment.js
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
  // 楼层地址
  const curHref = location.href.replace(location.hash, "");
  $("li.media.post").each(function () {
    const $me = $(this);
    const pid = $me.data("pid");
    const $date = $me.find("span.date");
    $date.after(
      `<a class="text-grey ml-2" href="${curHref}#${pid}">楼层地址</a>`
    );
  });
  // 开发者申请
  const $h4 = $(".media-body h4");
  let title = $h4.text().trim();
  if (title.indexOf("申请开发者") > -1) {
    $("div.message").each(function () {
      if ($(this).attr("isfirst") == 1) {
        $(this).prepend(
          `<blockquote class="blockquote"><pre class="pre-yml"></pre></blockquote>`
        );
        $(".pre-yml").text(`标题格式错误`);
      }
    });
    title = title.replace(/\[|【/g, "「").replace(/\]|】/g, "」");
    const objMatch = title.match(/「([^」]+)」「(theme|plugin)」/);
    console.log(objMatch);
    if (!objMatch) {
      return;
    }
    const tplYML = `- id: #id#
    type: #type#
    status: ing
    url: #url#
    date:
      - #date#
    reviewers:
      - 沉冰浮水`;
    const styYML = fnStrtr(
      tplYML,
      {
        id: objMatch[1],
        type: objMatch[2],
        url: location.href,
        date: moment().format("YYYY-MM-DD"),
      },
      (str) => {
        str = str.replace(/\n/g, "\\|");
        str = str.replace(/\s{6}/g, "_2__2_");
        str = str.replace(/\s{4}/g, "_2_");
        str = str.replace(/_2_/g, "  ");
        str = str.replace(/\\\|/g, "\n");
        return str;
      }
    );
    $(".pre-yml").text(`${styYML}`);
  }
  // 工具函数
  function fnStrtr(
    str,
    obj,
    callback = (str) => {
      return str;
    }
  ) {
    let rltStr = str;
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const reg = new RegExp(`#${key}#`, "g");
        rltStr = rltStr.replace(reg, value);
      }
    }
    return callback(rltStr);
  }
})();
