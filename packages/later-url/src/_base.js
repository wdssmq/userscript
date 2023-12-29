import { gm_name } from "./__info";

// 初始常量或函数
const curUrl = window.location.href;
const curDate = new Date();
const curTimestamp = Math.floor(curDate.getTime() / 1000);

// -------------------------------------

const _curUrl = () => { return window.location.href };
const _curDate = () => { return new Date() };
const _curTimestamp = () => { return Math.floor(_curDate().getTime() / 1000) };
const _getDateStr = (date = curDate) => {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
};
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
  _curDate,
  _curTimestamp,
  _curUrl,
  _error,
  _getDateStr,
  _log,
  _sleep,
  _warn,
  // $,
  $n,
  $na,
  curDate,
  curTimestamp,
  curUrl,
  fnElChange,
};
