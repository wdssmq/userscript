// ==UserScript==
// @name         「水水」自用知乎脚本
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  隐藏视频等辅助功能
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.com/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://www.zhihu.com/
// @grant        none
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  // -------------------------------------

  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // -------------------------------------

  // 元素变化监听
  const fnElChange = (el, fn = () => { }) => {
    const observer = new MutationObserver((mutationRecord, mutationObserver) => {
      // _log('mutationRecord = ', mutationRecord);
      // _log('mutationObserver === observer', mutationObserver === observer);
      fn(mutationRecord, mutationObserver);
      // mutationObserver.disconnect();
    });
    observer.observe(el, {
      // attributes: false,
      // attributeFilter: ["class"],
      childList: true,
      // characterData: false,
      subtree: true,
    });
  };

  function fnLoad() {
    const $topBanner = $n(".Topstory > div");
    $topBanner.style.display = "none";
    fnHideVideos();
  }

  function fnHideVideos() {
    const $TopstoryList = $na(".TopstoryItem");
    // 循环并判断是否为视频
    for (let i = 0; i < $TopstoryList.length; i++) {
      const $Topstory = $TopstoryList[i];
      const $video = $Topstory.querySelector(".VideoAnswerPlayer");
      if ($video) {
        $Topstory.style.display = "none";
      }
    }
  }

  fnElChange($n("#root"), fnHideVideos);
  fnLoad();

  // ----------------------

  const map = {
    closeBtn: "css-1x9te0t",
    mask: "css-18hmmtu",
  };

  // 点击遮罩关闭评论
  $n("body").addEventListener("click", (e) => {
    const $tgt = e.target;
    if ($tgt.classList.contains(map.mask)) {
      const $closeBtn = $n(`.${map.closeBtn}`);
      $closeBtn.click();
    }
  });

})();
