import { gm_name } from "./__info";

// 初始常量或函数
const curUrl = window.location.href;
const curDate = new Date();

// -------------------------------------

const _curUrl = () => window.location.href;
const _curDate = () => new Date();
function _getDateStr(date = curDate) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
}
const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// -------------------------------------

const _log = (...args) => console.log(`[${gm_name}] |`, ...args);
const _warn = (...args) => console.warn(`[${gm_name}] |`, ...args);
const _error = (...args) => console.error(`[${gm_name}] |`, ...args);

// -------------------------------------

// const $ = window.$ || unsafeWindow.$;
function $n(e) {
  return document.querySelector(e);
}
function $na(e) {
  return document.querySelectorAll(e);
}

// -------------------------------------

// 添加内容到指定元素后面
function fnAfter(newEl, el) {
  el = typeof el === "string" ? $n(el) : el;
  el.parentNode.insertBefore(newEl, el.nextSibling);
}

// 指定元素内查找子元素
function fnFindDom(el, selector) {
  el = typeof el === "string" ? $n(el) : el;
  const queryList = el.querySelectorAll(selector);
  if (queryList.length === 1) {
    return queryList[0];
  }
  return queryList.length > 1 ? queryList : null;
}

// -------------------------------------

// 元素变化监听
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

// -------------------------------------

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
  fnAfter,
  fnElChange,
  fnFindDom,
};
