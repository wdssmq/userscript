// ==UserScript==
// @name         「水水」复制标题网址
// @namespace    https://www.wdssmq.com/
// @version      2.1.1
// @author       沉冰浮水
// @description  复制当前页面标题及网址，支持复制为 HTML 及 Markdown。「QQ 群：189574683」
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
// @run-at       document-end
// @include      http://*
// @include      https://*
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @require      https://greasyfork.org/scripts/460056-mzlibmenu/code/mzLibMenu.js?version=1149985
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  function fnReplace(params) {
    const { url, title } = params;
    // _log("fnReplace", params);
    const titleFilter = [
      // 贴吧
      [/^(.+吧-百度贴吧)--.+/, "$1"],
    ];
    const urlFilter = [
      // QQ
      ["?tdsourcetag=s_pctim_aiomsg", ""],
      // 哔哩哔哩
      [/\?spm_id_from=.+/, ""],
      [/\?vd_source=.+/, ""],
    ];
    let newTitle = title;
    let newUrl = url;
    titleFilter.forEach((item) => {
      newTitle = newTitle.replace(...item);
    });
    urlFilter.forEach((item) => {
      newUrl = newUrl.replace(...item);
    });
    if (location.host == "greasyfork.org") {
      newUrl = newUrl.replace(/(\/\d+)-.+/, "$1");
    }
    // _log("fnReplace", { url, title }, { newUrl, newTitle });
    return { url: newUrl, title: newTitle };
  }

  function fnGetInfo(md = false) {
    let { url, title } = fnReplace({
      url: document.location.href,
      title: document.title.trim(),
    });
    if (md) {
      // eslint-disable-next-line no-useless-escape
      title = title.replace(/([_\[\]])/g, "\\$1");
    }
    return [title, url];
  }

  GM_registerMenuCommand("复制", () => {
    const [title, url] = fnGetInfo();
    GM_setClipboard(title + "\n" + url);
  });

  GM_registerMenuCommand("复制 HTML", () => {
    const [title, url] = fnGetInfo();
    GM_setClipboard(
      `<p>${title}</p><p><a href="${url}" target="_blank" title="${title}">${url}</a></p>`,
    );
  });

  GM_registerMenuCommand("复制为 Markdown「text」", () => {
    const [title, url] = fnGetInfo(true);
    GM_setClipboard(`[${title}](${url} "${title}")`);
  });

  GM_registerMenuCommand("复制为 Markdown「link」", () => {
    const [title, url] = fnGetInfo(true);
    GM_setClipboard(`${title}：\n\n[${url}](${url} "${title}")`);
  });

})();
