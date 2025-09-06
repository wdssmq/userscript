import {
  _log,
  $n,
  $na,
  fnElChange,
} from "./_base";

import _pick from "./_pick";

// 遍历 nodeList
function fnEachNodeList(nodeList, fn) {
  // 倒序遍历
  for (let i = nodeList.length - 1; i >= 0; i--) {
    fn(nodeList[i], i);
  }
}

// 按发布组获取信息
function fnGetGroupInfo() {
  const arrGroup = [];
  // 获取全部 div.subgroup-text
  const $listGroup = $na(".subgroup-text");
  fnEachNodeList($listGroup, ($group, i) => {
    const $groupTitle = $group.querySelector("div.dropdown-toggle span") || $group.querySelector("a");
    const groupName = $groupTitle.innerText;
    const $groupTable = $group.nextElementSibling;
    arrGroup.push({
      name: groupName,
      $table: $groupTable,
    });
  });
  return arrGroup;
}

// main
function fnMain() {
  const arrGroup = fnGetGroupInfo();
  // _log("arrGroup", arrGroup);
  arrGroup.forEach((group) => {
    _pick(group.name, group.$table);
    // _log("group", group);
  });
}

// 自动展开更多
function fnAutoExpand() {
  const $more = $na(".js-expand-episode");
  const moreLen = $more.length;

  // 定义一个计数，用于记录点击的按钮数量
  let clickCount = 0;

  // 判断每个按钮是否为 display: none
  const isVisible = (el) => el.offsetParent !== null;
  fnEachNodeList($more, ($btn, i) => {
    if (isVisible($btn)) {
      $btn.click();
    } else {
      clickCount++;
    }
  });
  if (clickCount === moreLen) {
    fnMain();
    return;
  }
  setTimeout(() => {
    fnAutoExpand();
  }, 2000);
}

fnAutoExpand();
