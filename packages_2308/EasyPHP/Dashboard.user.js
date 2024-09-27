// ==UserScript==
// @name         「其他」EasyPHP 面板助手
// @namespace    https://www.wdssmq.com/
// @version      0.1.1
// @author       沉冰浮水
// @description  新窗口打开站点；自动启用服务；书签功能；
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.com/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @match        http://127.0.0.1:1111/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==
/* jshint esversion:6 */
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
      ` | <a title="${item.name}" class="list_alias_name" target="_blank" href="${rootUrl}${item.url}">${item.name}</a>`,
    );
  });
})();
