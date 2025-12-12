import {
  _log,
} from "./_base";

import config from "./_config";

// // 过滤磁力链接中的 tr
// function fnRemoveTracker(magnet) {
//   const regex = /&tr=.+?(?=&|$)/g;
//   return magnet.replace(regex, "");
// }

// 通过正则表达式筛选文本
function fnPickByRegex(text, regex = null) {
  // 如果没有正则表达式，直接返回 true
  if (!regex) {
    return true;
  }
  regex = Array.isArray(regex) ? regex.join("|") : regex;
  const oRegex = new RegExp(regex, "i");
  // _log("fnPickByRegex() oRegex\n", oRegex);
  return oRegex.test(text);
}

// 绑定指定组的规则设置
function setRuleBinding(groupName, $subscribed) {
  if ($subscribed) {
    // 添加一个文本框到 $subscribed 后边
    const $input = document.createElement("input");
    $input.type = "button";
    $input.value = "点击设置规则";
    $input.className = "btn btn-default btn-xs";
    $subscribed.insertAdjacentElement("afterend", $input);
    $input.addEventListener("click", () => {
      const curRule = config.getRule(groupName);
      const userInput = prompt(`请输入发布组 "${groupName}" 的筛选规则（多个规则用 | 分隔）：`, curRule ? (Array.isArray(curRule.regex) ? curRule.regex.join("|") : curRule.regex) : "");
      if (userInput !== null) {
        const newRegex = userInput.split("|").map(item => item.trim());
        console.log(userInput, newRegex);
        config.updateRule(groupName, newRegex.length === 1 ? newRegex[0] : newRegex);
      }
    });
  }
}

export default function (group) {
  const { name, $table, $subscribed } = group;
  // 获取当前规则
  const curRule = config.getRule(name);
  // 绑定规则设置按钮
  setRuleBinding(name, $subscribed);

  // _log("_pick() group: ", group);
  // _log("_pick() curRule: ", curRule);
  // _log("_pick() name: ", name);
  // _log("_pick() -----\n", "-----");
  if (!curRule) {
    return;
  }
  const $listTr = $table.querySelectorAll("tr");
  // _log($listTr.length);

  $listTr.forEach(($tr, _i) => {
    // _log("_pick()", i, $listTr.length);

    const $curA = $tr.querySelector(".magnet-link-wrap");
    if (!$curA) {
      return;
    }
    const curText = $curA.textContent.toLowerCase();

    if (!fnPickByRegex(curText, curRule.regex)) {
      $tr.remove();
    }
  });
}
