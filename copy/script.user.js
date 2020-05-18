// ==UserScript==
// @name        复制标题网址（QQ群：189574683）
// @namespace   https://www.wdssmq.com
// @description 复制当前页面标题及网址
// @include     http://*
// @include     https://*
// @version     1.7
// @grant       GM_registerMenuCommand
// @grant       GM_setClipboard
// @url         https://greasyfork.org/zh-CN/scripts/28056
// jshint       esversion:6
// ==/UserScript==

(function () {
  /* jshint multistr:true */
  "use strict";
  if (window.frames.length != parent.frames.length) {
    // alert('在iframe中');
    return false;
  }
  let url = document.location.href.replace("?tdsourcetag=s_pctim_aiomsg", "");
  url = url.replace("?from=manga_person", "");
  let title = document.title;
  if (location.host == "greasyfork.org") {
    url = url.replace(/(\/\d+)-.+/, "$1");
  }

  GM_registerMenuCommand("复制", () => {
    GM_setClipboard(document.title + "\n" + url);
    //alert("复制成功：\r\n" + document.title + '\n' + document.location.href);
  });

  GM_registerMenuCommand("复制HTML", () => {
    GM_setClipboard(
      `<p>${title}</p><p><a href="${url}" target="_blank" title="${title}">${url}</a></p>`
    );
    //alert("复制成功：\r\n" + document.title + '\n' + document.location.href);
  });

  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
})();
