import {
  _log,
  $n,
  $na,
  fnElChange,
} from "./_base.js";

// 防止误点
const fnStopSource = (e) => {
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
      return;
    }
  }
};

$n("#root").addEventListener("click", fnStopSource);

// 条目标题处理
const fnItemTitle = ($e) => {
  // _log("fnItemTitle", $e);
  if ($e.dataset.ptDone) {
    return;
  }
  const strTitle = $e.innerText;
  const arrMatch = strTitle.match(/(?<cate>\[[^\]]+\])[^[]+-(?<group>[^[]+)(?<title>\[.+\])$/);
  if (arrMatch) {
    const strCate = arrMatch.groups.cate.replace(/^\[[^)]+\(([^)]+)\)\]/, "[$1]");
    const strGroup = arrMatch.groups.group;
    const strTitle = arrMatch.groups.title;
    const strNewTitle = `${strTitle} - ${strCate}[${strGroup}]`;
    $e.innerText = strNewTitle;
    $e.dataset.ptDone = "1";
  }
};

const fnItemTitleWrap = (e) => {
  const $$list = $na("#feedlyPageFX .entry");
  if (!$$list.length) {
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
};

fnElChange($n("#root"), () => {
  fnItemTitleWrap();
});


