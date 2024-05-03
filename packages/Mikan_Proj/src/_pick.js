import {
  _log,
} from "./_base";

import config from "./_config";

// 添加批量复制磁力链接功能
function fnAddBatchCopy($th, magnetList) {
  // _log("fnAddBatchCopy", magnetList);
  const $btn = document.createElement("button");
  $btn.innerText = "批量复制";
  $btn.addEventListener("click", () => {
    const magnetStr = magnetList.join("\n");
    GM_setClipboard(magnetStr);
    $btn.innerText = "复制成功";
    _log(`已复制 ${magnetStr}`);
  }, false);
  // appendChild 2 elements
  $th.appendChild($btn);
}

// 过滤磁力链接中的 tr
function fnRemoveTracker(magnet) {
  const regex = /&tr=.+?(?=&|$)/g;
  return magnet.replace(regex, "");
}

// 通过正则表达式筛选文本
function fnPickByRegex(text, regex = null) {
  // 如果没有正则表达式，直接返回 true
  if (!regex) {
    return true;
  }
  const oRegex = new RegExp(regex, "i");
  // _log("fnPickByRegex() oRegex\n", oRegex);
  return oRegex.test(text);
}


export default function(name, $table) {
  const pickRules = config.data.pickRules;
  // 数组中查找 name 对应的规则
  const curRule = pickRules.find((rule) => {
    return name == rule.name;
  });
  // _log("_pick() curRule: ", curRule);
  // _log("_pick() name: ", name);
  // _log("_pick() -----\n","-----");
  const $listTr = $table.querySelectorAll("tr");
  // _log($listTr.length);

  const magnetList = [];
  // 记录第一个 th
  let $firstTh = null;

  $listTr.forEach(($tr, i) => {
    // _log("_pick()", i, $listTr.length);
    if ($tr.innerText.includes("番组名")) {
      $firstTh = $tr.querySelector("th");
      // $lstTh = $curTh;
      // _log("fnMain() $curTh\n", $curTh);
      // return;
    }
    const $curA = $tr.querySelector(".magnet-link-wrap");
    const $curB = $tr.querySelector(".js-magnet");
    if (!$curA) {
      return;
    }
    const curText = $curA.innerText.toLowerCase();
    // data-clipboard-text
    let magnet = $curB.getAttribute("data-clipboard-text");
    magnet = fnRemoveTracker(magnet);
    // _log("_pick():", magnet);
    if (fnPickByRegex(curText, curRule?.regex)) {
      magnetList.push(magnet);
    } else {
      $tr.remove();
    }
  });

  // 添加批量复制按钮
  fnAddBatchCopy($firstTh, magnetList);
}
