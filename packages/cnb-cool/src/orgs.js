import {
  $n,
  $na,
  _log,
  fnElChange,
} from "./_base";

// 一个全局数据存储封装，带 ls 读写
import { gob } from "./_gob.js";

// -------------------------------------
// 收集「我加入的组织」，保存到脚本 ls（localStorage）

// 解析当前页面中的组织卡片
function fnParseOrgCards() {
  const arrOrg = [];
  for (const $a of $na("a[href^=\"/\"]")) {
    const $avatar = $a.querySelector(".cnb-avatar img");
    const $h1 = $a.querySelector("h1");
    const $p = $a.querySelector("p");
    if (!$avatar || !$h1 || !$p) {
      continue;
    }
    const strHref = $a.getAttribute("href") || "";
    // 组织路径为单段，如 /zblogcn
    if (!/^\/[^/]+$/.test(strHref)) {
      continue;
    }
    const $span = $h1.querySelector("span");
    arrOrg.push({
      id: strHref.slice(1),
      name: $span ? $span.textContent.replace(/^[（(]|[）)]$/g, "") : "",
      desc: $p.textContent.trim(),
      avatar: $avatar.getAttribute("src") || "",
      url: `https://cnb.cool${strHref}`,
    });
  }
  _log("[org]解析到组织卡片", arrOrg);
  return arrOrg;
}

// 合并保存组织列表（按 id 去重，有变化才写入 ls）
function fnSaveOrgs() {
  const arrCur = fnParseOrgCards();
  if (!arrCur.length) {
    return;
  }
  const mapOrg = new Map(gob.orgList.map(item => [item.id, item]));
  let bolChanged = false;
  for (const item of arrCur) {
    const old = mapOrg.get(item.id);
    if (!old || JSON.stringify(old) !== JSON.stringify(item)) {
      bolChanged = true;
    }
    mapOrg.set(item.id, item);
  }
  if (!bolChanged) {
    return;
  }
  gob.orgList = [...mapOrg.values()];
  gob.save();
  _log("[org]已保存组织列表", gob.orgList);
}

// 首次执行
fnSaveOrgs();

// SPA 路由 / DOM 变化时重新检测（简单防抖）
let intTimer = 0;
let intLast = 0;
fnElChange($n("body"), () => {
  const intNow = Date.now();
  if (intNow - intLast < 500) {
    clearTimeout(intTimer);
  }
  intLast = intNow;
  clearTimeout(intTimer);
  intTimer = setTimeout(fnSaveOrgs, 500);
});
