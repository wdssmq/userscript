import { gm_name } from "./__info";

// 初始常量或函数
const curUrl = window.location.href;
const curDate = new Date();

// -------------------------------------

const _curUrl = () => { return window.location.href };
const _curDate = () => { return new Date() };
const _getDateStr = (date = curDate) => {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
};
const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// -------------------------------------

const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);
const _warn = (...args) => console.warn(`[${gm_name}]\n`, ...args);
const _error = (...args) => console.error(`[${gm_name}]\n`, ...args);

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
function fnAfter($ne, e) {
  const $e = typeof e === "string" ? $n(e) : e;
  $e.parentNode.insertBefore($ne, $e.nextSibling);
}

// 指定元素内查看子元素
function fnFindDom(el, selector) {
  return el.querySelectorAll(selector);
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

// -------------------------------------

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
  fnFindDom,
  fnElChange,
};
