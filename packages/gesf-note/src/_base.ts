// 获取当前页面地址
export const _locUrl = () => window.location.href;

// 获取当前时间戳
export const _now = () => Math.floor(Date.now() / 1000);


export const $n = (selector: string, parent: Document | HTMLElement = document): HTMLElement | null => {
  return parent.querySelector<HTMLElement>(selector);
}

// 元素变化监听
export const fnElChange = (el: HTMLElement, fn = (mr: MutationRecord[], mo: MutationObserver) => { console.log(mr, mo);
 }) => {
  const observer = new MutationObserver((mr, mo) => {
    fn(mr, mo);
    // mo.disconnect();
  });
  observer.observe(el, {
    // attributes: false,
    // attributeFilter: ["class"],
    childList: true,
    // characterData: false,
    subtree: true,
  });
};
