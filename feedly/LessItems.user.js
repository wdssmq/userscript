// ==UserScript==
// @name         「Feedly」Less Item
// @namespace    https://www.wdssmq.com/
// @author       沉冰浮水
// @version      0.1
// @description  减少每次显示的条目数量
// @match        https://feedly.com/i/subscription/feed%2Fhttps%3A%2F%2F*
// @match        https://feedly.com/i/my
// @match        https://feedly.com/i/saved
// @grant        none
// ==/UserScript==

/* jshint esversion: 6 */
(function () {
  'use strict';
  // 基础函数或变量
  const curUrl = window.location.href;
  const curDate = new Date();
  // const $ = window.$ || unsafeWindow.$;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const _log = (...args) => console.log("[Less Item]\n", ...args);
  const _warn = (...args) => console.warn("[Less Item]\n", ...args);
  const _error = (...args) => console.error("[Less Item]\n", ...args);
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // 附加函数
  function fnRmovoDOM(el) {
    el.parentNode.removeChild(el);
  }
  function fnFindDomUp(el, selector, up = 1) {
    // _log("fnFindDomUp", el, selector, up);
    const elParent = el.parentNode;
    if (selector.indexOf(".") == 0 && elParent.className.indexOf(selector.split(".")[1]) > -1) {
      return elParent;
    }
    const elFind = elParent.parentNode.querySelector(selector);
    if (elFind) {
      return elFind;
    }
    if (up > 1) {
      return fnFindDomUp(elParent, selector, up - 1);
    } else {
      return null;
    }
  }

  // 加载完成后执行
  window.onload = function () {
    fnOnLoad();
  };

  async function fnOnLoad() {
    await sleep(3000);

    // 绑定监听事件
    if ($n("#box").dataset.EventBind !== "done") {
      $n("#box").addEventListener("mouseover", fnOnLoad, false);
      $n("#box").dataset.EventBind = "done";
    }

    // 判断页面地址
    if (curUrl.indexOf("subscription/") === -1) {
      return;
    }

    // 移除监听事件
    if ($n("#box").dataset.EventOff !== "done") {
      $n("#box").removeEventListener("mouseover", fnOnLoad, false);
      $n("#box").dataset.EventOff = "done";
    }

    // 判断加载完成
    if (!$n("#feedlyFrame")) {
      fnMain();
      _log("fnMain", "页面加载中");
    }

    // 滚动条滚动时触发
    if ($n("#feedlyFrame") && $n("#feedlyFrame").dataset.LessItem !== "done") {
      $n("#feedlyFrame").dataset.LessItem = "done";
      $n("#feedlyFrame").addEventListener("scroll", fnLessItem);
      _log("fnMain", "列表滚动监听");
    }
  }


  const cur4Minutes = Math.floor(curDate.getTime() / 1000 / 60 / 4);

  function fnGetMod(num, divi) {
    return (num + cur4Minutes) % divi;
  }

  async function fnLessItem() {
    await sleep(3000);

    if ($n(".giant-mark-as-read")) {
      fnRmovoDOM($n(".giant-mark-as-read"));
    }

    const $items = $na(".EntryList__chunk > article");

    // _log("fnLessItem", $items.length);

    let intDivi = 37;
    let lstAgo = "";

    if ($n(".list-entries > h2")) {
      $n("#feedlyFrame").removeEventListener("scroll", fnLessItem);
    }

    [].forEach.call($items, function ($e, i) {
      // _log("fnLessItem", $e);

      const $ago = $e.querySelector(".ago");
      const strAgo = $ago.innerText;
      if (lstAgo === "" && strAgo.indexOf("d") > -1) {
        lstAgo = strAgo;
      }

      // _log("fnLessItem", strAgo, lstAgo);

      if (strAgo === lstAgo) {
        intDivi = 7;
      }

      const link = $e.getAttribute("data-alternate-link");
      const hash = parseInt(link.replace(/\D/g, ""));

      const intNum = parseInt(i);

      // _log("fnLessItem", link, hash, intNum);

      const intMod = fnGetMod(intNum, intDivi);
      if (intMod !== 0 || lstAgo === "") {
        $e.style.display = "none";
        // fnRmovoDOM($e);
      }

    });
  }

  // 自动标记已读
  (() => {
    if (!$n("#box") || $n("#box").dataset.AutoMark === "bind") {
      return;
    }
    $n("#box").dataset.AutoMark = "bind";
    $n("#box").addEventListener("mouseup", function (event) {
      if (
        event.target.className === "link entry__title" &&
        event.target.nodeName === "A"
      ) {
        // 当前条目元素
        const $entry = fnFindDomUp(event.target, ".entry", 2);
        // 标记已读的按钮
        const $btn = event.target.parentNode.querySelector(
          ".EntryMarkAsReadButton"
        );

        // _log("fnMarkRead", event.target);
        // _log("fnMarkRead", $entry, $entry.className);

        // 判断是否含有指定类名
        if ($entry.className.indexOf("entry--read") > -1) {
          return;
        }
        if ($btn) {
          _log(event.button, "自动标记已读");
          $btn.click();
        } else {
          _log(event.button, "自动标记已读失败");
        }
      }
    }, false);
  })();

  return;
})();
