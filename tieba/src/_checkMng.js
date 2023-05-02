import { _error, $n, fnFindDom } from "./_base";
import { gob } from "./_gob";

// debug
const _debug = (...args) => {
  // 第一个参数
  const arg0 = args[0];
  if (!arg0) return;
  let className;
  if (typeof arg0 === "string") {
    className = arg0;
  }
  let el = $n(`.${className}`);
  if (!el) {
    el = document.createElement("div");
    el.className = className;
    document.body.appendChild(el);
  }
  el.innerText = args.join(" ");
};

gob.addLink = (link) => {
  const { linkLog } = gob;
  if (linkLog.indexOf(link) === -1) {
    linkLog.push(link);
  }
};

gob.checkLink = () => {
  const { linkLog } = gob;
  // 大于等于 4 时，刷新页面
  if (linkLog.length >= 4) {
    window.location.reload();
  }
};

gob.bindLinkEvent = () => {
  const $table = $n(".forum_table");
  if (!$table) {
    return;
  }
  const $itemLink = fnFindDom($table, "a");
  [].forEach.call($itemLink, ($link) => {
    const text = $link.innerText;
    const title = $link.title;
    if (text === title) {
      $link.classList.add("name");
      // 点击事件，包括中键点击
      $link.addEventListener("mousedown", (e) => {
        gob.addLink(title);
      });
    }
  });
};

gob.bindLinkEvent();

// 绑定页面焦点事件
window.addEventListener("focus", () => {
  gob.checkLink();
});
