import { gm_name } from "./__info";

// 初始常量或函数
const curUrl = window.location.href;
const curDate = new Date();
// ---------------------------------------------------
const _curUrl = () => { return window.location.href; };
const _curDate = () => { return new Date(); };
const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
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
export {
  curUrl,
  // curDate,
  _curUrl,
  // _curDate,
  // _sleep,
  _log,
  // _warn,
  // _error,
  // $,
  $n,
  $na,
};
