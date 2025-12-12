import {
  $n,
  _log,
  curUrl,
} from "./_base";

import { gob } from "./_gob";

// 样式设置
GM_addStyle(`
.mz-box {
  margin: 5px 0;
}
a.mz-link {
  color: #1779ba;
  padding-right: 13px;
  text-decoration: underline;
}
a.mz-link:hover {
  color: red;
}
`);

// 匹配不同的服务站点
gob.initInfoBySite = () => {
  // netcut.cn
  if (curUrl.match(/netcut\.cn/)) {
    gob.$note = $n(".note-wrapper .pre-box");
    gob.insertTo = [".note-wrapper", "before"];
    gob.getTextBy = "textContent";
  }
  gob.textContent = gob.$note[gob.getTextBy];
  // _log("gob.data = ", gob.data);
};

// 解析文本内容，将网址转换为链接
gob.parseText = (text) => {
  const reg = /(https?:\/\/\S+)/g;
  const newText = text.replace(reg, (_match, p1) => {
    return `<a class="mz-link" title="${p1}" href="${p1}" target="_blank">${p1}</a>`;
  });
  return newText;
};

// 添加内容到页面，位置由 gob.insertTo 决定
gob.addContent = (content) => {
  const newEl = document.createElement("div");
  newEl.className = "mz-box";
  newEl.innerHTML = content;
  // 用于插入新元素的参考元素
  const $ref = $n(gob.insertTo[0]);
  if (gob.insertTo[1] === "before") {
    $ref.parentNode.insertBefore(newEl, $ref);
  }
};

// 通用函数
gob.main = (retry = 3) => {
  gob.initInfoBySite();
  if (!gob.textContent && retry > 0) {
    setTimeout(() => {
      gob.main(retry - 1);
      _log("retry = ", retry);
    }, 1000);
    return;
  }
  gob.text = gob.textContent;
  const newText = gob.parseText(gob.text);
  // _log("text = ", gob.text);
  // _log("newText = ", newText);
  gob.addContent(newText);
};

gob.main();
