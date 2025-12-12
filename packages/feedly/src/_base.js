import { gm_name } from "./__info";

// 初始常量或函数
const curUrl = window.location.href;
const curDate = new Date();
// ---------------------------------------------------
const _curUrl = () => window.location.href;
const _curDate = () => new Date();
function _getDateStr(date = curDate) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
}
const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// ---------------------------------------------------
const _log = (...args) => console.log(`[${gm_name}]|`, ...args);
const _warn = (...args) => console.warn(`[${gm_name}]|`, ...args);
const _error = (...args) => console.error(`[${gm_name}]|`, ...args);
// ---------------------------------------------------
// const $ = window.$ || unsafeWindow.$;
function $n(e) {
  return document.querySelector(e);
}
function $na(e) {
  return document.querySelectorAll(e);
}
// ---------------------------------------------------
function fnElChange(el, fn = () => { }) {
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
}
function fnRemoveDOM(el) {
  el.parentNode.removeChild(el);
}
function fnFindDom(el, selector) {
  return el.querySelectorAll(selector);
}
// 原生 js 实现 jquery 的 closest 方法
function fnFindDomUp(el, selector) {
  const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
  while (el) {
    if (matchesSelector.call(el, selector)) {
      break;
    }
    el = el.parentElement;
  }
  return el;
}
// ---------------------------------------------------
export {
  // $,
  $n,
  $na,
  _curDate,
  _curUrl,
  _error,
  _getDateStr,
  _log,
  _sleep,
  _warn,
  curDate,
  curUrl,
  fnElChange,
  fnFindDom,
  fnFindDomUp,
  fnRemoveDOM,
};
