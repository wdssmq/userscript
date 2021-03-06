// ==UserScript==
// @name        复制标题网址（QQ群：189574683）
// @namespace   https://www.wdssmq.com
// @version     2.0
// @author      沉冰浮水
// @description 复制当前页面标题及网址
// @url         https://greasyfork.org/zh-CN/scripts/28056
// ----------------------------
// @link   https://afdian.net/@wdssmq
// @link   https://github.com/wdssmq/userscript
// @link   https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @include     http://*
// @include     https://*
// @grant       GM_registerMenuCommand
// @grant       GM_setClipboard
// ==/UserScript==

/** jshint       esversion:6 **/
/** jshint multistr:true **/
(function () {
  "use strict";
  if (window.frames.length != parent.frames.length) {
    // alert('在iframe中');
    return false;
  }
  function fnGetInfo(md = false) {
    let url = document.location.href.replace("?tdsourcetag=s_pctim_aiomsg", "");
    url = url.replace("?from=manga_person", "");
    let title = document.title.trim();
    title = title.replace(/^(.+吧-百度贴吧)--.+/, "$1");
    if (md) {
      title = title.replace(/([_\[\]])/g, "\\$1");
    }
    if (location.host == "greasyfork.org") {
      url = url.replace(/(\/\d+)-.+/, "$1");
    }
    return [title, url];
  }

  GM_registerMenuCommand("复制", () => {
    const [title, url] = fnGetInfo();
    GM_setClipboard(title + "\n" + url);
  });

  GM_registerMenuCommand("复制HTML", () => {
    const [title, url] = fnGetInfo();
    GM_setClipboard(
      `<p>${title}</p><p><a href="${url}" target="_blank" title="${title}">${url}</a></p>`
    );
  });

  GM_registerMenuCommand("复制为Markdown[text]", () => {
    const [title, url] = fnGetInfo(true);
    GM_setClipboard(`[${title}](${url} "${title}")`);
  });

  GM_registerMenuCommand("复制为Markdown[link]", () => {
    const [title, url] = fnGetInfo(true);
    GM_setClipboard(`${title}：\n\n[${url}](${url} "${title}")`);
  });

  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
})();
