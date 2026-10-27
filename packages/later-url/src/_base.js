import { gm_name } from "./__info";
// 时间相关实现在 func/_time.js，此处统一对外输出
import {
  _fmtDate,
  _getDateStr,
  _parseDate,
} from "./func/_time";

// 初始常量或函数
const curUrl = window.location.href;
const curDate = new Date();
const curTimestamp = Math.floor(curDate.getTime() / 1000);

// -------------------------------------

const _curUrl = () => window.location.href;
const _curDate = () => new Date();
const _curTimestamp = () => Math.floor(_curDate().getTime() / 1000);
const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// -------------------------------------

// 记录已输出的 log，用于「只输出一次」
const _logHis = new Set();
const _log = (...args) => console.log(`[${gm_name}] |`, ...args);
const _warn = (...args) => console.warn(`[${gm_name}] |`, ...args);
const _error = (...args) => console.error(`[${gm_name}] |`, ...args);
// 只输出一次的 log，以第一个参数为 key，可用 _logHis.clear() 重置
function _logOnce(...args) {
  let key = typeof args[0] === "string" ? args[0] : "";
  if (!key) {
    try {
      key = JSON.stringify(args);
    }
    catch {
      key = String(args[0]);
    }
  }
  if (_logHis.has(key)) {
    return false;
  }
  _logHis.add(key);
  _log(...args);
  return true;
}

// -------------------------------------

// const $ = window.$ || unsafeWindow.$;
function $n(e) {
  return document.querySelector(e);
}
function $na(e) {
  return document.querySelectorAll(e);
}

// -------------------------------------

// 带校验的输入框：取消返回 null，校验不通过返回 false，通过返回输入值
function fnPrompt(text = "", defValue = "", fnCheck = null) {
  const val = prompt(text, defValue);
  if (val === null) {
    return null;
  }
  const strVal = String(val).trim();
  if (typeof fnCheck === "function" && !fnCheck(strVal)) {
    return false;
  }
  return strVal;
}

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
  _curTimestamp,
  _curUrl,
  _error,
  _fmtDate,
  _getDateStr,
  _log,
  _logHis,
  _logOnce,
  _parseDate,
  _sleep,
  _warn,
  curDate,
  curTimestamp,
  curUrl,
  fnElChange,
  fnPrompt,
};
