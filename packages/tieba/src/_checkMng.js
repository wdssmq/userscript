import { _warn, $n, fnFindDom } from "./_base";
import { gob } from "./_gob";

gob.addLink = (link) => {
  const { linkLog } = gob;
  if (linkLog.indexOf(link) === -1) {
    linkLog.push(link);
  }
  _warn("addLink()\n", linkLog);
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
