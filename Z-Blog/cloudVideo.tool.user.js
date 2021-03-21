// ==UserScript==
// @name         [Z-Blog] - 插件工具 For 腾讯云点播
// @namespace    https://www.wdssmq.com/
// @author       沉冰浮水
// @version      0.2
// @description  用于快捷得到`[cloudVideo:tencent:${strID}]${strTitle}[/cloudVideo]`格式的代码；
// @include      https://console.cloud.tencent.com/vod/media*
// @grant        GM_setClipboard
// jshint        esversion:6
// ==/UserScript==
(function () {
  "use strict";
  "esversion: 6";
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
  // 直觉应该用mouseenter，然而并不是
  $n("body").addEventListener(
    "mouseover",
    function (e) {
      // console.log(e.target);
      // console.log(e.target.nodeName);
      // console.log(e.target.className || "class为空");
      // 实际代码
      if (e.target.nodeName === "TD") {
        let elThis = e.target;
        if (elThis.dataset.done === "1") {
          return;
        }
        if (!elThis.querySelector(".app-vod-media")) {
          return;
        }
        let strTitle = elThis.querySelector(".media-name").innerHTML.trim();
        let strID = elThis
          .querySelector(".app-vod-media__body p")
          .innerHTML.replace(/ID:/, "")
          .trim();
        let strCode = `[cloudVideo:tencent:${strID}]${strTitle}[/cloudVideo]`;
        console.log(strCode);
        let elA = document.createElement("a");
        // elA.style.paddingLeft = "1em";
        elA.href = "javascript:;";
        elA.innerHTML = `cvp-复制代码`;
        elA.setAttribute("class", "text-vm");
        elA.addEventListener("click", function (e) {
          elA.innerHTML = "cvp-复制成功";
          GM_setClipboard(strCode);
        });
        elThis.querySelector(".app-vod-media__body").appendChild(elA);
        elThis.dataset.done = "1";
      }
    },
    false
  );
})();
