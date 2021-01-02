// ==UserScript==
// @name         EasyPHP 面板助手
// @namespace    https://www.wdssmq.com/
// @version      0.1
// @description  try to take over the world!
// @author       沉冰浮水
// @match        http://127.0.0.1:1111/
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==
/*jshint esversion:6 */
(function () {
  "use strict";
  let $ = typeof window.$ == "function" ? window.$ : unsafeWindow.jQuery;
  $("a.list_alias_name").attr("target", "_blank");

  // 自动启用
  $(".btn-success[type=submit]").each(function () {
    $(this).click();
  });

  // 书签
  const bookmarks = GM_getValue("bookmarks", []);
  if (bookmarks.length === 0) {
    GM_setValue("bookmarks", [
      {
        site: "zbp",
        name: "后台",
        url: "/zb_system/cmd.php?act=login",
      },
    ]);
  }

  // 站点列表
  const siteList = {};
  $(".list_alias_name").each(function () {
    const site = $(this).find("b").text();
    siteList[site] = $(this);
  });

  // 输出书签
  bookmarks.forEach((item) => {
    const site = item.site;
    if (!siteList[site]) {
      return;
    }
    const rootUrl = siteList[site].attr("href");
    siteList[site].after(
      ` | <a title="${item.name}" class="list_alias_name" target="_blank" href="${rootUrl}${item.url}">${item.name}</a>`
    );
  });
})();
