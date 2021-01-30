// ==UserScript==
// @name        [zblog]前台编辑文章入口
// @namespace   https://www.wdssmq.com/
// @version     0.1
// @author      沉冰浮水
// @description 配合主题以显示前台编辑入口
// @link        https://afdian.net/@wdssmq
// @link        https://github.com/wdssmq/userscript
// @link        https://greasyfork.org/zh-CN/users/6865-wdssmq
// @match       *://*/post/*.html
// @match       *://*/*.html
// @match       *://*/zb_system/admin/edit.php*
// @grant       none
// ==/UserScript==
/*jshint esversion:6 */
(function () {
  if (!window.jQuery) {
    return false;
  }
  let $ = window.jQuery;
  $(function () {
    $(".js-edt").each(function () {
      const id = $(this).data("id");
      const type = $(this).data("type");
      const act = type ? "PageEdt" : "ArticleEdt";
      $(this).html(
        '[<a title="编辑" rel="external" href="' +
          window.bloghost +
          `zb_system/cmd.php?act=${act}&id=${id}">编辑</a>]`
      );
    }).removeClass("is-hidden hidden");
    // if ($("#edtDateTime").length === 1) {
    // $('#edtDateTime').datetimepicker('setDate', (new Date()));
    // }
  });
})();
