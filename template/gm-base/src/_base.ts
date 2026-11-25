import { gm_name } from "./__info";

// 初始常量或函数
const curUrl = window.location.href;
const curDate = new Date();

// -------------------------------------

const _curUrl = (): string => window.location.href;
const _curDate = (): Date => new Date();
function _getDateStr(date: Date = curDate): string {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" } as const;
  return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
}
function _sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// -------------------------------------

const _log = (...args: unknown[]): void => console.log(`[${gm_name}] |`, ...args);
const _warn = (...args: unknown[]): void => console.warn(`[${gm_name}] |`, ...args);
const _error = (...args: unknown[]): void => console.error(`[${gm_name}] |`, ...args);

// -------------------------------------

// const $ = window.$ || unsafeWindow.$;
function $n<T extends Element = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}
function $na<T extends Element = Element>(selector: string): NodeListOf<T> {
  return document.querySelectorAll<T>(selector);
}

// -------------------------------------

// 指定元素内查找子元素
function fnFindDom(el: string | Element, selector: string): Element | NodeListOf<Element> | null {
  const target = typeof el === "string" ? $n(el) : el;
  if (!target) {
    return null;
  }
  const queryList = target.querySelectorAll(selector);
  if (queryList.length === 1) {
    return queryList[0];
  }
  return queryList.length > 1 ? queryList : null;
}

// -------------------------------------

// 元素变化监听
function fnElChange(
  el: Element,
  fn: (mutationRecord: MutationRecord[], mutationObserver: MutationObserver) => void = () => {},
): void {
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
  fnElChange,
  fnFindDom,
};
