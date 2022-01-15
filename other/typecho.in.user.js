// ==UserScript==
// @name         「水水」typecho.in 链接提取
// @namespace    https://www.wdssmq.com/
// @version      0.1
// @description  提取 typecho.in 分享的网址
// @author       沉冰浮水
// ----------------------------
// @link     https://afdian.net/@wdssmq
// @link     https://github.com/wdssmq/userscript
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @match        https://typecho.in/*
// @icon         https://www.google.com/s2/favicons?domain=typecho.in
// @grant        none
// ==/UserScript==

/** jshint esversion:6 **/
(function () {
  "use strict";

  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  const re = /https?:\/\/[^\s\n]+/g;
  const sText = $n(".container #content").innerHTML;

  console.log(sText);

  const oMatch = sText.match(re);

  console.log(oMatch, typeof oMatch);

  for (const key in oMatch) {
    if (Object.hasOwnProperty.call(oMatch, key)) {
      const url = oMatch[key];
      const $a = document.createElement("a");
      $a.href = url;
      $a.innerText = url;
      $a.target = "_blank";
      // $a.style.color = "#175199";
      $a.style.color = "red";
      $n(".container #content").style.marginTop = "10px";
      $n(".container #content").parentNode.insertBefore(
        $a,
        $n(".container #content")
      );
    }
  }
})();
