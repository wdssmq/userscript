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

const _log = (...args) => console.log(`[${gm_name}] \n`, ...args);
const _warn = (...args) => console.warn(`[${gm_name}] \n`, ...args);
const _error = (...args) => console.error(`[${gm_name}] \n`, ...args);

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

function fnCheckObj(obj, schema) {
  for (const key in schema) {
    const value = obj[key];
    // 模式中定义的键必须存在
    if (typeof value === "undefined") {
      throw new Error(`${key} is missing from object`);
    }
    // 针对每个键值的模式
    const valueSchema = schema[key];
    valueSchema.forEach((itemSchema) => {
      const msg = itemSchema.msg;
      for (const check in itemSchema) {
        if (Object.hasOwnProperty.call(itemSchema, check)) {
          const checkVal = itemSchema[check];
          switch (check) {
            case "not":
              if (value === checkVal) {
                throw new Error(`${key} ${msg}`);
              }
              break;
            default:
              break;
          }
        }
      }
    });
  }
  return true;
}

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
  fnCheckObj,
};
