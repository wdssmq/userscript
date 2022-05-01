
// ==UserScript==
// @name         「bilibili」- 稍后再看导出为.url
// @namespace    wdssmq.com
// @version      0.2
// @author       沉冰浮水
// @description  将 B 站的稍后再看列表导出为 *.url 文件
// @url          https://greasyfork.org/scripts/398415
// ----------------------------
// @link     https://afdian.net/@wdssmq
// @link     https://github.com/wdssmq/userscript
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @include      https://www.bilibili.com/*
// @include      https://t.bilibili.com/*
// @include      https://manga.bilibili.com/account-center*
// @include      https://account.bilibili.com/account/big/myPackage
// @icon         https://www.bilibili.com/favicon.ico
// @run-at       document-end
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM.openInTab
// ==/UserScript==
/* jshint esversion:6 */

(function () {
  'use strict';

  const gm_name = "later";

  // 初始常量或函数
  const curUrl = window.location.href;
  const curDate = new Date();
  // ---------------------------------------------------
  const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);
  // ---------------------------------------------------
  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }
  // 元素变化监听
  const fnElChange = (el, fn = () => { }) => {
    const observer = new MutationObserver((mutationRecord, mutationObserver) => {
      // _log('body attributes changed!!!'); // body attributes changed!!!
      // _log('mutationRecord = ', mutationRecord); // [MutationRecord]
      // _log('mutationObserver === observer', mutationObserver === observer); // true
      fn(mutationRecord, mutationObserver);
      mutationObserver.disconnect(); // 取消监听，正常应该在回调函数中根据条件决定是否取消
    });
    observer.observe(el, {
      // attributes: false,
      // attributeFilter: ["class"],
      childList: true,
      // characterData: false,
      subtree: true,
    });
  };

  // cookie 封装
  const ckeObj = {
    setItem: function (key, value) {
      const Days = 137;
      const exp = new Date();
      exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
      document.cookie = key + "=" + encodeURIComponent(value) + ";path=/;domain=.bilibili.com;expires=" + exp.toGMTString();
    },
    getItem: function (key, def = "") {
      const reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
      const arr = document.cookie.match(reg);
      if (arr) {
        return decodeURIComponent(arr[2]);
      }
      return def;
    }
  };

  // 日期转字符串
  const getDateStr = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString("zh-CN", options);
  };

  // 判断日期间隔
  const diffDateDays = (date1, date2) => {
    const diff = date1.getTime() - date2.getTime();
    return diff / (1000 * 60 * 60 * 24);
  };

  // B 币领取提醒
  (() => {
    const ckeName = "bilibili-helper-bcoin-nxtDateStr";
    const curDateStr = getDateStr(curDate);
    const nxtDateStr = ckeObj.getItem(ckeName, curDateStr);
    const bcoinUrl = "https://account.bilibili.com/account/big/myPackage";

    _log(`当前日期: ${curDateStr}`);
    _log(`下次领取: ${nxtDateStr}`);

    // 通知事件封装
    const notify = (title, body) => {
      _log(`通知标题: ${title}`);
      GM_notification({
        title: title,
        text: body,
        timeout: 0,
        onclick: () => {
          // window.location.href = bcoinUrl;
          GM.openInTab(bcoinUrl, false);
        }
      });
    };

    // 判断是否已经领取过
    const fnCheckByDOM = () => {
      const $bcoin = $n(".bcoin-wrapper");
      // _log("fnCheckByDOM", $bcoin);
      // $bcoin && _log("fnCheckByDOM", $bcoin.innerHTML);
      if ($bcoin && $bcoin.innerText.includes("本次已领")) {
        const match = $bcoin.innerText.match(/\d{4}\/\d+\/\d+/);
        if (match && match[0] !== nxtDateStr) {
          ckeObj.setItem(ckeName, match[0]);
          _log("已领取过，更新下次领取日期", match[0]);
          return true;
        }
      } else {
        fnElChange($n("#app"), fnCheckByDOM);
      }
      return false;
    };

    // _log($n("body").innerHTML);
    // _log(nxtDateStr, curMonth);

    // 对比日期
    const iniDiff = diffDateDays(curDate, new Date(nxtDateStr));
    if (iniDiff > 0) {
      _log(curUrl, "\n", bcoinUrl);
      if (curUrl.indexOf(bcoinUrl) > -1) {
        fnCheckByDOM();
      } else {
        notify("B 币领取提醒", "点击查看 B 币领取情况");
      }
    }
  })();

  // 番剧链接改为我的追番
  (() => {
    let isDone = false;
    const fnCheckByDOM = () => {
      if (!isDone) {
        fnElChange($n("#app"), fnCheckByDOM);
      }
      const $pick = $n("a[href$='/anime/']");
      const $pick2 = $n("a[href^='//space']");
      // console.log($pick, $pick2);
      if (null === $pick || null === $pick2) {
        return;
      }
      const uid = $pick2.href.match(/\d+/)[0];
      const url = `https://space.bilibili.com/${uid}/bangumi`;
      $pick.href = url;
      _log("番剧链接改为我的追番", url);
      isDone = true;
    };
    fnCheckByDOM();
  })();

})();
