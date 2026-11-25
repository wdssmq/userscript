import type { HisItem } from "./_gob";

import {
  $n,
  $na,
  _log,
  fnElChange,
} from "./_base";
// 一个全局数据存储封装，带 ls 读写
import { gob } from "./_gob";

// -------------------------------------
// 在「待办」tab 内展示访问历史：
// 记录最近访问过的仓库或 issue，允许固定一条记录以一直显示，也可以取消固定

// 历史卡片标记（无外层容器，卡片直接挂在 tabs-content 内）
const strCardRole = "cnb-history-card";
// 未固定记录的保留条数
const intMaxHis = 20;

// 解析当前路径是否为仓库 / issue 页面
function fnParsePath(strPath: string): HisItem | null {
  const arrSeg = strPath.split("/").filter(Boolean);
  if (arrSeg.length < 2) {
    return null;
  }
  const setReserved = new Set([
    "u",
    "users",
    "explore",
    "search",
    "orgs",
    "settings",
    "notifications",
    "-",
  ]);
  if (setReserved.has(arrSeg[0].toLowerCase())) {
    return null;
  }
  const strType: HisItem["type"] = strPath.includes("/issues") ? "issue" : "repo";
  // issue 列表页（-/issues 结尾）不记录
  if (strType === "issue" && /\/-?\/issues\/?$/.test(strPath)) {
    return null;
  }
  // 仓库只记录根路径，issue 记录完整路径
  const strRec = strType === "issue" ? strPath : `/${arrSeg[0]}/${arrSeg[1]}`;
  return { path: strRec, type: strType };
}

// 记录时抓取页面标题：issue 取实际标题，仓库取描述；取不到返回空串（显示时回退为路径）
function fnScrapeTitle(strType: HisItem["type"]): string {
  // issue 标题按「·」分隔取第一段（如「标题 · 仓库 · 站点名」）
  const fnPick = (strVal: string): string => strType === "issue"
    ? strVal.split("·")[0].trim()
    : strVal.trim();
  const arrSel = strType === "issue"
    ? ["meta[property='og:title']", "meta[name='description']", "h1"]
    : ["meta[property='og:description']", "meta[name='description']"];
  for (const strSel of arrSel) {
    const $el = $n(strSel);
    const strVal = fnPick($el?.getAttribute("content") || $el?.textContent || "");
    if (strVal) {
      return strVal.slice(0, 100);
    }
  }
  // 最后回退 document.title，去掉站点名后缀
  return fnPick(
    (document.title || "")
      .replace(/\s*[-·|]\s*(CNB|cnb\.cool|云原生构建).*/i, ""),
  ).slice(0, 100);
}

// 记录最近访问（去重后置顶，未固定的最多保留 intMaxHis 条）
function fnRecordVisit(): void {
  const strPath = window.location.pathname;
  const obj = fnParsePath(strPath);
  if (!obj) {
    return;
  }
  obj.t = Date.now();
  obj.title = fnScrapeTitle(obj.type);
  // 合并时顺带清理误存的 issue 列表页记录
  const arrOld = gob.hisList
    .filter(item => !/\/-?\/issues\/?$/.test(item.path))
    .filter(item => item.path !== obj.path);
  arrOld.unshift(obj);
  const setPins = new Set(gob.hisPins);
  // 固定项不参与淘汰
  const arrPinned = arrOld.filter(item => setPins.has(item.path));
  const arrRest = arrOld.filter(item => !setPins.has(item.path)).slice(0, intMaxHis);
  gob.hisList = [...arrPinned, ...arrRest];
  gob.save();
  _log("[history]已记录访问", obj);
}

// 切换固定 / 取消固定
function fnTogglePin(strPath: string): void {
  const arrNew = gob.hisPins.filter(item => item !== strPath);
  if (arrNew.length === gob.hisPins.length) {
    arrNew.unshift(strPath);
    _log("[history]已固定", strPath);
  }
  else {
    _log("[history]已取消固定", strPath);
  }
  gob.hisPins = arrNew;
  gob.save();
  fnRenderItems();
}

// 时间显示：MM-DD HH:mm
function fnFormatTime(intTs: number | undefined): string {
  if (!intTs) {
    return "";
  }
  const dt = new Date(intTs);
  const options = { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" } as const;
  return dt.toLocaleString("zh-CN", options);
}

// 克隆页面已有图标，找不到时返回 null
function fnCloneIcon<T extends Element = Element>(strSelector: string): T | null {
  const $icon = $n<T>(strSelector);
  if (!$icon) {
    return null;
  }
  const $el = $icon.cloneNode(true) as T;
  $el.removeAttribute("id");
  return $el;
}

// 待办卡片骨架缓存（grid + t-table，tbody 已清空）
let $tplCard: HTMLElement | null = null;

// 生成一条历史记录行（对齐待办卡片内的 tr 结构）
function fnMakeRow(item: HisItem): HTMLElement {
  const bolPinned = gob.hisPins.includes(item.path);
  const arrSeg = item.path.split("/").filter(Boolean);
  const strRepo = arrSeg.slice(0, 2).join("/");

  // 状态图标：issue 用待办里的 issue 图标，仓库用仓库图标
  const $iconWrap = document.createElement("span");
  const $icon = fnCloneIcon(item.type === "issue"
    ? ".ruyi-icon-issue-open,.ruyi-icon-issue"
    : ".ruyi-icon-code,.ruyi-icon-issue-open");
  if ($icon) {
    $iconWrap.append($icon);
  }

  // 主内容：标题行 + meta 行
  const $main = document.createElement("div");
  $main.className = "flex flex-col gap-y-1 flex-1 min-w-0";

  // 标题行：粗体主色链接
  const $titleLine = document.createElement("div");
  $titleLine.className = "flex flex-wrap items-center gap-1";
  const $titleSpan = document.createElement("span");
  $titleSpan.className = "break-all align-middle xl:text-m max-xl:text-base font-bold text-pri";
  const $titleInner = document.createElement("span");
  const $a = document.createElement("a");
  $a.href = `https://cnb.cool${item.path}`;
  $a.target = "_blank";
  $a.className = "hover:underline cursor-pointer";
  // 标题：优先记录时抓到的 issue 标题 / 仓库描述，回退为路径
  $a.textContent = item.title
    || (item.type === "issue" ? `${strRepo} #${arrSeg[arrSeg.length - 1]}` : strRepo);
  $titleInner.append($a);
  $titleSpan.append($titleInner);
  $titleLine.append($titleSpan);
  $main.append($titleLine);

  // meta 行：仓库路径（截断）+ issue 号 + 访问时间
  const $meta = document.createElement("div");
  $meta.className = "flex flex-wrap items-center gap-x-1 text-sm font-normal break-all text-sec";
  const $pathWrap = document.createElement("div");
  $pathWrap.className = "inline-flex items-center";
  const $pathTrunc = document.createElement("div");
  $pathTrunc.className = "max-w-xl max-xl:max-w-[50vw] truncate";
  $pathTrunc.style.direction = "rtl";
  const $pathSpan = document.createElement("span");
  $pathSpan.style.direction = "ltr";
  $pathSpan.style.unicodeBidi = "embed";
  $pathSpan.textContent = strRepo;
  $pathTrunc.append($pathSpan);
  $pathWrap.append($pathTrunc);
  if (item.type === "issue") {
    const $num = document.createElement("span");
    $num.textContent = `#${arrSeg[arrSeg.length - 1]}`;
    $pathWrap.append($num);
  }
  $meta.append($pathWrap);
  if (item.t) {
    const $time = document.createElement("span");
    $time.className = "text-sm text-sec";
    $time.append(`访问于 `);
    const $trig = document.createElement("span");
    $trig.className = "t-trigger";
    $trig.textContent = fnFormatTime(item.t);
    $time.append($trig);
    $meta.append($time);
  }
  $main.append($meta);

  // 固定按钮：复用站点的图钉图标，未固定时半透明
  const $btn = document.createElement("button");
  $btn.type = "button";
  $btn.className = "cursor-pointer flex-none";
  $btn.title = bolPinned ? "取消固定" : "固定显示";
  const $pinIcon = fnCloneIcon<SVGElement>(".ruyi-icon-label-pin");
  if ($pinIcon) {
    $pinIcon.style.opacity = bolPinned ? "1" : "0.3";
    $btn.append($pinIcon);
  }
  else {
    const $txt = document.createElement("span");
    $txt.className = "text-sm text-sec";
    $txt.textContent = bolPinned ? "取消固定" : "固定";
    $btn.append($txt);
  }
  $btn.addEventListener("click", () => fnTogglePin(item.path));

  // 行容器：与待办 td.title 内的结构一致
  const $row = document.createElement("div");
  $row.className = "flex items-stretch gap-2 group";
  $row.append($iconWrap, $main);

  // 卡片模式：每条记录各自复制一张待办卡片，填入单行
  if ($tplCard) {
    const $card = $tplCard.cloneNode(true) as HTMLElement;
    const $tbody = $card.querySelector("tbody");
    if ($tbody) {
      const $tr = document.createElement("tr");
      const $tdTitle = document.createElement("td");
      $tdTitle.className = "title";
      $tdTitle.append($row);
      const $tdAct = document.createElement("td");
      $tdAct.className = "max-xl:invisible";
      const $actWrap = document.createElement("div");
      $actWrap.className = "flex items-center justify-center h-full";
      $actWrap.append($btn);
      $tdAct.append($actWrap);
      $tr.append($tdTitle, $tdAct);
      $tbody.append($tr);
    }
    return $card;
  }

  // 兜底：找不到待办卡片模板时用简单容器
  $row.append($btn);
  const $wrap = document.createElement("div");
  $wrap.className = "w-full px-0 py-2 border-pri rounded-md";
  $wrap.append($row);
  return $wrap;
}

// 定位「待办」tab 的 .tabs-content：优先取包含 issue/PR 列表的面板
function fnGetContent(): Element | null {
  const $tabs = $n(".t-tabs__content");
  if (!$tabs) {
    return null;
  }
  const $panel = [...$tabs.querySelectorAll(".t-tab-panel")]
    .find($p => $p.querySelector(".issue-pull-list")) || $tabs.querySelector(".t-tab-panel");
  return $panel?.querySelector(".tabs-content") || null;
}

// 缓存待办卡片模板（grid + t-table，tbody 已清空），成功返回 true
function fnCacheTemplate($content: Element): boolean {
  if ($tplCard) {
    return true;
  }
  const $tpl = $content.querySelector(".issue-pull-list")?.closest(".grid");
  if (!$tpl) {
    return false;
  }
  $tplCard = $tpl.cloneNode(true) as HTMLElement;
  const $tbody = $tplCard.querySelector("tbody");
  if ($tbody) {
    $tbody.innerHTML = "";
  }
  return true;
}

// 移除已渲染的历史卡片
function fnRemoveCards(): void {
  for (const $el of $na(`[data-role="${strCardRole}"]`)) {
    $el.remove();
  }
}

// 渲染历史卡片：固定项在前，其后按最近访问排序
// 每条记录各自复制一张待办卡片（grid + t-table），逐个挂到 tabs-content
function fnRenderItems(): void {
  fnRemoveCards();
  const $content = fnGetContent();
  if (!$content) {
    return;
  }
  const bolTpl = fnCacheTemplate($content);
  const mapHis = new Map(gob.hisList.map((item): [string, HisItem] => [item.path, item]));
  const arrShow: HisItem[] = [
    ...gob.hisPins.map((strPath): HisItem => mapHis.get(strPath) || { path: strPath, type: "repo" }),
    ...gob.hisList.filter(item => !gob.hisPins.includes(item.path)),
  ];
  if (bolTpl && $tplCard) {
    if (!arrShow.length) {
      const $card = $tplCard.cloneNode(true) as HTMLElement;
      $card.dataset.role = strCardRole;
      const $tbody = $card.querySelector("tbody");
      const $tr = document.createElement("tr");
      const $td = document.createElement("td");
      $td.className = "title";
      const $tip = document.createElement("div");
      $tip.className = "py-2 text-sm text-sec";
      $tip.textContent = "暂无访问记录";
      $td.append($tip);
      $tr.append($td);
      $tbody?.append($tr);
      $content.append($card);
    }
    else {
      for (const item of arrShow) {
        const $card = fnMakeRow(item);
        $card.dataset.role = strCardRole;
        $content.append($card);
      }
    }
  }
  else {
    // 兜底：找不到待办卡片模板时用简单容器（模板就绪后会自动升级为卡片模式）
    const $list = document.createElement("div");
    $list.dataset.role = strCardRole;
    $list.dataset.fallback = "1";
    $list.className = "grid grid-cols-1 gap-2 my-6";
    if (!arrShow.length) {
      const $tip = document.createElement("div");
      $tip.className = "py-2 text-sm text-sec";
      $tip.textContent = "暂无访问记录";
      $list.append($tip);
    }
    else {
      for (const item of arrShow) {
        $list.append(fnMakeRow(item));
      }
    }
    $content.append($list);
  }
  _log("[history]历史卡片已渲染", arrShow.length, bolTpl ? "卡片模式" : "兜底模式");
}

// 确保历史卡片存在（SPA 重渲染后自动补回），顺带记录当前访问
function fnEnsureHistory(): void {
  fnRecordVisit();
  const $content = fnGetContent();
  if (!$content) {
    return;
  }
  fnCacheTemplate($content);
  const $exist = $n(`[data-role="${strCardRole}"]`);
  if ($exist) {
    // 已按卡片模式渲染则跳过；兜底模式下模板刚就绪时升级重渲染
    if (!$exist.dataset.fallback || !$tplCard) {
      return;
    }
  }
  fnRenderItems();
}

// 初次执行 + 短暂重试：页面加载完成时可能不再有 DOM 变化，观察者不会触发
let intRetry = 0;
function fnInit(): void {
  fnEnsureHistory();
  if (!$n(`[data-role="${strCardRole}"]`) && intRetry < 10) {
    intRetry++;
    setTimeout(fnInit, 1000);
  }
}
fnInit();

// SPA 路由 / DOM 变化时重新检测（简单防抖）
let intTimer = 0;
let intLast = 0;
fnElChange(document.body, () => {
  const intNow = Date.now();
  if (intNow - intLast < 500) {
    clearTimeout(intTimer);
  }
  intLast = intNow;
  clearTimeout(intTimer);
  intTimer = setTimeout(fnEnsureHistory, 500);
});
