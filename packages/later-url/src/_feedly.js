import {
  _log,
  $n,
  $na,
  curUrl,
  fnElChange,
} from "./_base";

import { gob } from "./_gob";

(() => {
  if (curUrl.indexOf("feedly") === -1) {
    return;
  }
  // _log($n("body").innerHTML);
  const $root = $n("#root");

  // 获取链接信息
  const getUrlInfo = ($con, $title) => {
    const info = {
      url: "",
      title: "",
      category: "",
    };
    info.url = $title.href;
    info.title = $title.textContent;
    // 获取分类
    const textCon = $con.textContent;
    // 判断是否含有 https://space.bilibili.com/\d+/video
    const oMatch = textCon.match(/https:\/\/space.bilibili.com\/(\d+)\/video/);
    if (oMatch) {
      info.category = `bilibili_${oMatch[1]}`;
    }
    return info;
  };

  // 添加按钮并绑定事件
  const addBtn = ($con, $title) => {
    const info = getUrlInfo($con, $title);
    if (!info.category) {
      return;
    }
    // $正文元素内添加一个按钮并绑定点击事件
    const $btn = document.createElement("button");
    $btn.textContent = "从 cf-later 删除";
    $btn.style.margin = "10px";
    $btn.onclick = async () => {
      _log(info);
      await gob.delUrl(info.url, info.category);
    };
    $con.appendChild($btn);
  };

  const onElChange = () => {
    const $$展开的文章 = $na("div > .SelectedEntryScroller");
    let $展开的文章;
    if ($$展开的文章.length > 0) {
      $展开的文章 = $$展开的文章[0];
    } else {
      return;
    }
    // 如果已经设置 data-url-btn="true"，则不再设置
    if ($展开的文章.getAttribute("data-url-btn") === "true") {
      return;
    }
    // 获取正文元素
    const $正文 = $展开的文章.querySelector(".entryBody .content");
    const $标题 = $展开的文章.querySelector(".entryHeader a");
    if (!$正文 || !$标题) {
      return;
    }
    _log("$展开的文章 = ", $展开的文章);
    _log(
      $正文,
      $标题,
    );
    addBtn($正文, $标题);
    // 设置 data-url-btn="true"
    $展开的文章.setAttribute("data-url-btn", "true");
  };

  fnElChange($root, onElChange);

})();
