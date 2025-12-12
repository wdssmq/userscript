// ==UserScript==
// @name        「水水」度盘接生成（QQ 群：189574683）
// @namespace   wdssmq
// @version     2.0
// @author      沉冰浮水
// @description 度盘分享文件时自动复制为 HTML 或 MarkDown
// @link         https://greasyfork.org/zh-CN/scripts/6505
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.com/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @include     https://pan.baidu.com/disk/main*
// @grant       GM_setClipboard
// ==/UserScript==
// jshint       esversion:6
(function () {
  "use strict";
  // 基础函数或变量
  // const curUrl = window.location.href;
  // const curDate = new Date();
  // const $ = window.$ || unsafeWindow.$;
  // const _curUrl = () => { return window.location.href; };
  // const _curDate = () => { return new Date(); };
  // const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const _log = (...args) => console.log("[GM_Pan]\n", ...args);
  // const _warn = (...args) => console.warn("[GM_Pan]\n", ...args);
  // const _error = (...args) => console.error("[GM_Pan]\n", ...args);
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
  // 添加元素指定元素前
  function $i2be4($ne, e) {
    const $e = typeof e === "string" ? $n(e) : e;
    $e.parentNode.insertBefore($ne, $e);
  }

  // _log($n("body").innerHTML);
  _log("[Pan] 开始执行");

  // 元素变化监听
  const fnElChange = (el, fn = () => { }) => {
    const observer = new MutationObserver((mutationRecord, mutationObserver) => {
      // _log('body attributes changed!!!'); // body attributes changed!!!
      // _log('mutationRecord = ', mutationRecord); // [MutationRecord]
      // _log('mutationObserver === observer', mutationObserver === observer); // true
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

  // 构建复制内容
  function fnBuid(url, pwd, title, type = 1) {
    if (type === 2) {
      // eslint-disable-next-line no-useless-escape
      title = title.replace(/([_\[\]])/g, "\\$1");
    }
    switch (type) {
      case 1:
        return `<p>${title}</p><p>链接：<a href="${url}" target="_blank" title="${title}">${url}</a> 提取码：${pwd}</p>`;
      case 2:
        return `${title}：\n\n链接：[${url}](${url} "${title}") 提取码：${pwd}`;
    }
  }

  // 全局变量
  const gob ={
    lstUrl: "",
  };
  const fnMain = (mutationRecord, mutationObserver) => {
    const $shareBox = $n(".nd-share");
    if (!$shareBox) {
      _log("[Pan] 监听到元素变化");
      return;
    }
    const strHTML = $shareBox.innerHTML;
    if (strHTML.indexOf("复制链接及提取码") === -1) {
      _log("[Pan] 已生成分享链接");
      return;
    }
    const $listInput = $na(".nd-share .u-input__inner");
    let url, pwd;
    let title = $n(".nd-share .u-dialog__title")
      .textContent
      .replace(/分享文件\(夹\):|文件上传|上传完成/g, "");

    if (gob.lstUrl === url) {
      _log("[Pan] 感觉这里并不会执行到？");
      return;
    } else {
      gob.lstUrl = url;
    }

    // _log("$listInput = ", $listInput);

    [...$listInput].forEach((el) => {
      if (el.value.indexOf("http") === 0) {
        url = el.value;
      } else {
        pwd = el.value;
      }
    });

    const $newel = document.createElement("div");
    $newel.innerHTML = `
    <button id="cp-html" class="u-button u-button--primary u-button--medium is-round">复制为 HTML</button>
    <button id="cp-md" class="u-button u-button--primary u-button--medium is-round">复制为 Markdown</button>
    `;

    $newel.addEventListener("click", (e) => {
      const $target = e.target;
      if ($target.id === "cp-html") {
        const strHTML = fnBuid(url, pwd, title, 1);
        GM_setClipboard(strHTML);
        alert("已复制为 HTML");
      } else if ($target.id === "cp-md") {
        const strHTML = fnBuid(url, pwd, title, 2);
        GM_setClipboard(strHTML);
        alert("已复制为 Markdown");
      }
    });

    $i2be4($newel, $n(".wp-share-file__link-copy-wrapper"));

    _log("$shareBox = ", $shareBox);
  };

  fnElChange($n("body"), fnMain);

  return;
})();
