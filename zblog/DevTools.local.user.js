// ==UserScript==
// @name         [zblog] - 开发者工具（本地）
// @namespace    https://www.wdssmq.com/
// @author       沉冰浮水
// @description  自动填写Z-Blog应用的配置项
// @version      0.2
// @link   ----------------------------
// @link   https://github.com/wdssmq/userscript
// @link   https://afdian.net/@wdssmq
// @link   https://greasyfork.org/zh-CN/users/6865-wdssmq
// @link   ----------------------------
// @include        http://*/zb_users/plugin/AppCentre/plugin_edit.php*
// @include        http://*/zb_users/plugin/AppCentre/theme_edit.php*
// @include        http://*/zb_system/admin/index.php?act=PluginMng*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==
/*jshint esversion:6 */
(function () {
  "use strict";
  const $ = window.jQuery || unsafeWindow.jQuery || function () {};
  // console.log($);
  /**
   * @param {string} selc  文本选择器
   * @param {string} value 值
   * @param {boolean} f    强制覆盖
   */
  function fnFill(selc, value, f = 0) {
    if ($(selc).val() === "" || f) {
      $(selc).val(value);
    }
  }
  // 初始化配置
  const config = GM_getValue("config", {});
  if (JSON.stringify(config) === "{}") {
    GM_setValue("config", {
      appUrl: "//jq.qq.com/?_wv=1027&k=555hND5",
      appPHPVer: "5.4",
      appDesc: "置百丈玄冰而崩裂，掷须臾池水而漂摇。",
      authName: "沉冰浮水",
      authEmail: "wdssmq@qq.com",
      authUrl: "https://www.wdssmq.com",
    });
  }
  console.log(config);
  const curUsr = [$("div.username").text(), $("#app_author_name").val()];
  // 只在新建时填写
  if (curUsr[0].indexOf(curUsr[1]) > -1) {
    fnFill("#app_author_name", config.authName, 1);
    fnFill("#app_author_email", config.authEmail, 1);
    fnFill("#app_author_url", config.authUrl, 1);
    fnFill("#app_phpver", config.appPHPVer, 1);
  }
  // 值为空时填写
  fnFill("#app_url", config.appUrl);
  fnFill("#app_description", config.appDesc);

  const app_id = $("#app_id").val();
  if (/LinksManage/.test(app_id)) {
    fnFill("#app_phpver", "5.2", 1);
  }

  /**
   *
   * @param {str} string 日期文本
   * @param {int} d 指定天数内的，或者指定天数前的；
   */
  function DateMinus(string, d = [5, 1024]) {
    const sDate = new Date(string.replace(/-/g, "/"));
    const nDate = new Date();
    const intDiff = nDate.getTime() - sDate.getTime();
    const day = parseInt(intDiff / (1000 * 60 * 60 * 24));
    return day <= d[0] || day >= d[1];
  }
  $("tr").each(function () {
    const curHtml = $(this).html();
    if ($(this).find("th").length > 0) {
      return;
    }
    const strDate = $(this).find(".td20 + .td20").html().trim();
    const strAuthor = $(this).find(".td20 a").text().trim();
    if (DateMinus(strDate) && strAuthor == config.authName) {
      console.log(strDate, strAuthor);
      $(this).css({ color: "red" }).insertAfter("table tbody tr:first-child");
    }
    if (/Todo|mzGrunt|FileIgnore/.test(curHtml)) {
      $(this).css({
        color: "cornflowerblue",
      });
    }
  });
})();
