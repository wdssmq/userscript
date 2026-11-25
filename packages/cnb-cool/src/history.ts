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

// 历史卡片标记（独立 .grid 容器，直接挂在 tabs-content 内）
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

// 模板填充生成的固定按钮用事件委托绑定
document.addEventListener("click", (e) => {
  if (!(e.target instanceof Element)) {
    return;
  }
  const $btn = e.target.closest("[data-his-pin]") as HTMLElement | null;
  const strPath = $btn?.dataset.hisPin;
  if (strPath) {
    fnTogglePin(strPath);
  }
});

// 时间显示：MM-DD HH:mm
function fnFormatTime(intTs: number | undefined): string {
  if (!intTs) {
    return "";
  }
  const dt = new Date(intTs);
  const options = { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" } as const;
  return dt.toLocaleString("zh-CN", options);
}

// HTML 转义（标题来自页面抓取，路径要写进属性）
const mapEscape: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
};
function fnEscapeHTML(strVal: string): string {
  return strVal.replace(/[&<>"']/g, ch => mapEscape[ch]);
}

// 模板填充（用回调返回替换值，避免值中的 $ 被当作特殊替换模式）
function fnFill(strTpl: string, mapPart: Record<string, string>): string {
  return strTpl.replace(/\{\{(\w+)\}\}/g, (_m, strKey: string) => mapPart[strKey] ?? "");
}

// 克隆页面已有图标并返回 outerHTML，找不到时返回空串
function fnCloneIconHTML(strSelector: string): string {
  const $icon = $n(strSelector);
  if (!$icon) {
    return "";
  }
  const $el = $icon.cloneNode(true) as Element;
  $el.removeAttribute("id");
  return $el.outerHTML;
}

// 历史记录独立容器（对齐待办列表的 grid + t-table 结构）
const tplGrid = `
<div class="grid grid-cols-1 gap-2 my-6" data-role="${strCardRole}">
  <div class="t-table w-full cnb-table__content-bordered cnb-pagination issue-pull-list" style="position: relative;">
    <div class="t-table__content">
      <table class="t-table--layout-fixed">
        <colgroup>
          <col style="min-width: 330px;">
          <col style="width: 60px;">
        </colgroup>
        <tbody class="t-table__body">{{rows}}</tbody>
      </table>
    </div>
  </div>
</div>
`;

// mark
const tplItem = `
<tr>
  <td class="title">
    <div class="flex items-stretch gap-2 group">
      <span>{{icon}}</span>
      <div class="flex flex-col gap-y-1">
        <div class="flex flex-wrap items-center gap-1">
          <span class="break-all align-middle xl:text-m max-xl:text-base font-bold text-pri">
            <a href="{{href}}" target="_blank" class="hover:underline" rel="noopener noreferrer">{{title}}</a>
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-x-1 text-sm font-normal break-all text-sec">
          <div class="inline-flex items-center">
            <div class="max-w-xl max-xl:max-w-[50vw] truncate" style="direction: rtl;">
              <span style="direction: ltr; unicode-bidi: embed;">{{repo}}</span>
            </div>
            <span>{{num}}</span>
          </div>
          <span>{{time}}</span>
        </div>
      </div>
    </div>
  </td>
  <td>{{pin}}</td>
</tr>
`;

// 固定按钮：复用站点的图钉图标，未固定时半透明；找不到图标时用文字
function fnMakePinHTML(strPath: string, bolPinned: boolean): string {
  const strPinIcon = fnCloneIconHTML(".ruyi-icon-label-pin");
  const strInner = strPinIcon || `<span class="text-sm text-sec">${bolPinned ? "取消固定" : "固定"}</span>`;
  const strStyle = strPinIcon && !bolPinned ? ` style="opacity: 0.3;"` : "";
  return `<button type="button" class="cursor-pointer flex-none" title="${bolPinned ? "取消固定" : "固定显示"}"${strStyle} data-his-pin="${fnEscapeHTML(strPath)}">${strInner}</button>`;
}

// 填充一条历史记录
function fnFillItem(item: HisItem): string {
  const bolPinned = gob.hisPins.includes(item.path);
  const arrSeg = item.path.split("/").filter(Boolean);
  const strRepo = arrSeg.slice(0, 2).join("/");

  // 状态图标：issue 用待办里的 issue 图标，仓库用仓库图标
  const strIcon = fnCloneIconHTML(item.type === "issue"
    ? ".ruyi-icon-issue-open,.ruyi-icon-issue"
    : ".ruyi-icon-code,.ruyi-icon-issue-open");

  // 标题：优先记录时抓到的 issue 标题 / 仓库描述，回退为路径
  const strTitle = fnEscapeHTML(item.title
    || (item.type === "issue" ? `${strRepo} #${arrSeg[arrSeg.length - 1]}` : strRepo));

  // meta 行：仓库路径 + issue 号 + 访问时间
  const strNum = item.type === "issue" ? `<span>#${arrSeg[arrSeg.length - 1]}</span>` : "";
  const strTime = item.t
    ? `<span class="text-sm text-sec">访问于 <span class="t-trigger">${fnFormatTime(item.t)}</span></span>`
    : "";

  return fnFill(tplItem, {
    icon: strIcon,
    href: fnEscapeHTML(`https://cnb.cool${item.path}`),
    title: strTitle,
    repo: fnEscapeHTML(strRepo),
    num: strNum,
    time: strTime,
    pin: fnMakePinHTML(item.path, bolPinned),
  });
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

// 移除已渲染的历史卡片
function fnRemoveCards(): void {
  for (const $el of $na(`[data-role="${strCardRole}"]`)) {
    $el.remove();
  }
}

// 渲染历史卡片：固定项在前，其后按最近访问排序
// 历史记录占用独立的一个 .grid，整体挂到 tabs-content
function fnRenderItems(): void {
  fnRemoveCards();
  const $content = fnGetContent();
  if (!$content) {
    return;
  }
  // 将历史列表转换为 Map，方便查找
  const mapHis = new Map(gob.hisList.map((item): [string, HisItem] => [item.path, item]));
  // 显示列表：固定项在前，其后按最近访问排序
  const arrShow: HisItem[] = [
    ...gob.hisPins.map((strPath): HisItem => mapHis.get(strPath) || { path: strPath, type: "repo" }),
    ...gob.hisList.filter(item => !gob.hisPins.includes(item.path)),
  ];
  // 逐条填充模板，空状态用占位提示行
  const strRows = arrShow.length
    ? arrShow.map(fnFillItem).join("\n")
    : `<tr><td class="title"><div class="py-2 text-sm text-sec">暂无访问记录</div></td><td></td></tr>`;
  $content.insertAdjacentHTML("beforeend", fnFill(tplGrid, { rows: strRows }));
  _log("[history]历史卡片已渲染", arrShow.length);
}

// 确保历史卡片存在（SPA 重渲染后自动补回），顺带记录当前访问
function fnEnsureHistory(): void {
  fnRecordVisit();
  const $content = fnGetContent();
  if (!$content || $n(`[data-role="${strCardRole}"]`)) {
    return;
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
