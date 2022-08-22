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
function fnRemoveDOM(el) {
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
export {
  curUrl,
  curDate,
  _curUrl,
  _curDate,
  _getDateStr,
  _sleep,
  _log,
  _warn,
  _error,
  // $,
  $n,
  $na,
  fnElChange,
  fnRemoveDOM,
  fnFindDomUp,
};
