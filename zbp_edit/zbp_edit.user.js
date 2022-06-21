
// ==UserScript==
// @name         「Z-Blog」前台编辑文章入口
// @namespace    https://www.wdssmq.com/
// @version      0.3
// @author       沉冰浮水
// @description  配合主题以显示前台编辑入口
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
// @match       *://*/post/*.html*
// @match       *://*/*.html
// @match       *://*/zb_system/admin/edit.php*
// @grant        none
// ==/UserScript==

/* jshint esversion: 6 */

(function () {
  'use strict';

  // ---------------------------------------------------
  const $ = window.$ || unsafeWindow.$;

  $(function () {
    // 添加编辑按钮
    $(".js-edt")
      .each(function () {
        const id = $(this).data("id");
        const type = $(this).data("type");
        const act = type ? "PageEdt" : "ArticleEdt";
        $(this).html(
          `[<a title="编辑" rel="external" href="${window.bloghost}zb_system/cmd.php?act=${act}&id=${id}">编辑</a>]`
        );
      })
      .removeClass("is-hidden hidden");

    // 清理评论失效网址
    $(".cmt-tips").each(function () {
      const $this = $(this);
      const authName = $this.data("name");
      $this.append(
        ` <a class="cmt-edit" title="查找编辑" rel="external" href="${window.bloghost}zb_users/plugin/cmt2rss/main.php?act=update&read_getWord=${authName}" target="_blank">查找编辑</a>`
      );
    });
    $(".cmt-edit").css({ color: "#175199" });

    // 设置文章为回收
    $("#edtTitle").after(
      '<a class="js-empty" href="javascript:;" title="设置为回收"> [设置为回收]</a>'
    );
    let editor_api = window.editor_api;
    $(".js-empty").click(function () {
      $("#edtTitle").val("回收");
      $("#edtTag").val("回收");
      $('#edtDateTime').datetimepicker('setDate', (new Date()));
      let strMore = "";
      if (typeof window.EDITORMD == "object") {
        strMore = "\n\n<!--more-->";
      } else {
        strMore = '<hr class="more" />';
      }
      let oBody = "回收" + strMore;
      editor_api.editor.content.put(oBody);
      editor_api.editor.intro.put("");
    });
  });

})();
