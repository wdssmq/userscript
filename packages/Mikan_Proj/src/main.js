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
  const $listBtn = $na(".js-expand-episode");
  fnEachNodeList($listBtn, ($btn, i) => {
    $btn.click();
  });
  setTimeout(() => {
    fnMain();
  }, 3000);
}

fnAutoExpand();


// fnElChange($n(".central-container"),
//   () => {
//     fnMain();
//   }
// )

// import _feedly from "./_feedly";

// _feedly.regAction(fnEachNodeList, fnFilter, _filter);
