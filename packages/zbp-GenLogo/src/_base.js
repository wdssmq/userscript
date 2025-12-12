import { gm_name } from "./__info";

// 初始常量或函数
const curUrl = window.location.href;
const curDate = new Date();
// ---------------------------------------------------
const _curUrl = () => window.location.href;
const _curDate = () => new Date();
const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// ---------------------------------------------------
const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);
const _warn = (...args) => console.warn(`[${gm_name}]\n`, ...args);
const _error = (...args) => console.error(`[${gm_name}]\n`, ...args);
// ---------------------------------------------------
const $ = window.$ || unsafeWindow.$;
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
// ---------------------------------------------------
export {
  $,
  $n,
  $na,
  _curDate,
  _curUrl,
  _error,
  _log,
  _sleep,
  _warn,
  curDate,
  curUrl,
  fnElChange,
};
