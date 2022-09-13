/* global GM_setClipboard */

import { gm_name } from "./__info";

// 初始常量或函数
const curUrl = window.location.href;
const curDate = new Date();

// ---------------------------------------------------

const _curUrl = () => { return window.location.href };
const _curDate = () => { return new Date() };
const _getDateStr = (date = curDate) => {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
};
const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------

const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);
const _warn = (...args) => console.warn(`[${gm_name}]\n`, ...args);
const _error = (...args) => console.error(`[${gm_name}]\n`, ...args);

// ---------------------------------------------------

// const $ = window.$ || unsafeWindow.$;
function $n(e) {
  return document.querySelector(e);
}
function $na(e) {
  return document.querySelectorAll(e);
}

// ---------------------------------------------------

// 添加内容到指定元素后面
function fnAfter($ne, e) {
  const $e = typeof e === "string" ? $n(e) : e;
  $e.parentNode.insertBefore($ne, $e.nextSibling);
}

// ---------------------------------------------------

// 元素变化监听
const fnElChange = (el, fn = () => { }, onetime = true) => {
  const observer = new MutationObserver((mutationRecord, mutationObserver) => {
    // _log('mutationRecord = ', mutationRecord);
    // _log('mutationObserver === observer', mutationObserver === observer);
    fn(mutationRecord, mutationObserver);
    if (onetime) {
      mutationObserver.disconnect(); // 取消监听，正常应该在回调函数中根据条件决定是否取消
    }
  });
  observer.observe(el, {
    // attributes: false,
    // attributeFilter: ["class"],
    childList: true,
    // characterData: false,
    subtree: true,
  });
};

// 点击指定元素复制内容
function fnCopy(eTrig, content, fnCB = () => { }) {
  $n(eTrig).addEventListener("click", function (e) {
    GM_setClipboard(content);
    fnCB(e);
    this.style.color = "gray";
  });
}

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
  },
};

// ---------------------------------------------------

export {
  curUrl,
  curDate,
  _curUrl,
  _curDate,
  _sleep,
  _getDateStr,
  _log,
  _warn,
  _error,
  // $,
  $n,
  $na,
  fnAfter,
  fnElChange,
  fnCopy,
  ckeObj,
};
