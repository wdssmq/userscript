import {
  $n,
  _log,
  fnElChange,
} from "./_base.js";

import { gob } from "./_gob";

// 防止误点
function fnStopSource(e) {
  const $target = e.target;
  if ($target.classList.contains("entry__source")) {
    // 记录触发次数到 dataset
    const intCount = $target.dataset.clickCount || 0;
    if (intCount === 0) {
      $target.dataset.clickCount = intCount + 1;
      e.preventDefault();
      e.stopPropagation();
      // e.stopImmediatePropagation();
      // alert("entry__source");
    }
  }
}

$n("#root").addEventListener("click", fnStopSource);

// 条目标题处理
function fnItemTitle($e) {
  // _log("fnItemTitle", $e);
  if ($e.dataset.ptDone) {
    return;
  }
  const origTitle = $e.textContent;
  // _log("origTitle", origTitle);
  // 定义一个函数用于获取年度及分辨率
  const fnGetVideoLabel = (videoTitle) => {
    videoTitle = videoTitle.replace("4K.", "2160p.");
    // 定义一个正则数组，用于匹配年度及分辨率
    const arrRegexp = [
      /(?<year>\d{4})\.(?<res>\d+p)\./,
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      /(?<year>\d{4})\.S\d.*?(?<res>\d+p)\./,
      /(?<year>\d{4})\.Complete\.(?<res>\d+p)\./,
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      /(?<year>\d{4})\..+?(?<res>\d+p)\./i,
    ];
    // 遍历正则数组，匹配年度及分辨率
    let objLabel = null;
    for (let i = 0; i < arrRegexp.length; i++) {
      const regexp = arrRegexp[i];
      const match = videoTitle.match(regexp);
      if (match) {
        objLabel = match.groups;
        break;
      }
    }
    return objLabel;
  };
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const arrMatch = origTitle.match(/(?<cate>\[[^\]]+\])[^[]+-(?<group>[^[]+)(?<title>\[.+\])$/);
  if (arrMatch) {
    // eslint-disable-next-line regexp/no-super-linear-backtracking
    const strCate = arrMatch.groups.cate.replace(/^\[[^)]+\(([^)]+)\)\]/, "[$1]");
    const strGroup = arrMatch.groups.group;
    const strTitle = arrMatch.groups.title;
    // 提取年度及分辨率
    const objLabel = fnGetVideoLabel(origTitle);
    const strNewTitle = `${strTitle} - ${strCate}[${objLabel?.year}][${objLabel?.res}][${strGroup}]`;
    $e.textContent = strNewTitle;
    $e.dataset.ptDone = "1";
  }
}

function fnItemTitleWrap() {
  const $$list = gob.GetEntriesList();
  if (!$$list.length) {
    _log("fnItemTitleWrap: No entries found");
    return;
  }
  // 遍历并查找 .EntryTitleLink
  for (let i = 0; i < $$list.length; i++) {
    const $item = $$list[i];
    const $title = $item.querySelector(".EntryTitleLink");
    if ($title) {
      fnItemTitle($title);
    }
  }
}

fnElChange($n("#root"), () => {
  fnItemTitleWrap();
});
