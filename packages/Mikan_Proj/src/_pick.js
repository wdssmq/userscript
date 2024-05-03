import {
  _log
} from "./_base";

import config from "./_config";

// 添加批量复制磁力链接功能
function fnAddBatchCopy($th, magnetList) {
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
  let $curTh = null;
  // let $lstTh = null;
  let magnetList = [];
  $listTr.forEach(($tr, i) => {
    if ($tr.innerText.includes("番组名")) {
      $curTh = $tr.querySelector("th");
      // $lstTh = $curTh;
      // _log("fnMain() $curTh\n", $curTh);
      fnAddBatchCopy($curTh, magnetList);
      magnetList = [];
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
    if (fnPickByRegex(curText, curRule?.regex)) {
      magnetList.push(magnet);
    } else {
      $tr.remove();
    }
  });
}
