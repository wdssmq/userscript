import {
  $n,
  _log,
  fnElChange,
} from "./_base";

// 一个全局数据存储封装，带 ls 读写
import { gob } from "./_gob.js";

// -------------------------------------
// 在 logo 标题后添加下拉菜单，快速跳转 ls 里保存的组织

const strMenuBtnId = "cnb-nav-menu-btn";
const strMenuPopupId = "cnb-nav-menu-popup";

// 从头部头像地址取当前登录用户，如 https://cnb.cool/users/wdssmq/avatar/s
function fnGetCurUser() {
  const $img = $n(".JS-cnb-header .cnb-avatar img");
  const strSrc = $img?.getAttribute("src") || "";
  const m = strSrc.match(/\/users\/([^/]+)\/avatar/);
  return m ? m[1] : "";
}

// 生成单个菜单项，mixIcon 可为图片地址或 DOM 节点（如站点 logo，克隆使用）
function fnMakeItem(strId, strName, mixIcon, strUrl) {
  const $a = document.createElement("a");
  $a.href = strUrl || `https://cnb.cool/${strId}`;
  $a.target = "_self";
  $a.className = "flex items-center gap-2 px-3 py-2 hover:bg-panel-pri-hover hover:text-brand whitespace-nowrap";
  if (typeof mixIcon === "string" && mixIcon) {
    const $img = document.createElement("img");
    $img.src = mixIcon;
    $img.alt = strId;
    $img.width = 20;
    $img.height = 20;
    $img.className = "cnb-avatar rounded-full dark:brightness-90 flex-none";
    $a.append($img);
  }
  else if (mixIcon instanceof Element) {
    const $el = mixIcon.cloneNode(true);
    $el.removeAttribute("id");
    $el.classList.add("flex-none", "cnb-avatar");
    // // SVG 的 width/height 属性是只读的 SVGAnimatedLength，需用 setAttribute
    // $el.setAttribute("width", "20");
    // $el.setAttribute("height", "20");
    // $el.style.width = "20px";
    // $el.style.height = "20px";
    $a.append($el);
  }
  const $span = document.createElement("span");
  $span.className = "text-base";
  $span.textContent = strName || strId;
  $span.title = strName || strId;
  $a.append($span);
  return $a;
}

// 渲染菜单项：首项为登录用户主页，其后为已保存的组织，末项固定为组织管理页
function fnRenderItems($popup) {
  $popup.innerHTML = "";
  const strUser = fnGetCurUser();
  if (strUser) {
    $popup.append(fnMakeItem(
      strUser,
      strUser,
      `https://cnb.cool/users/${strUser}/avatar/s`,
      `https://cnb.cool/u/${strUser}`,
    ));
  }
  if (!gob.orgList.length) {
    const $tip = document.createElement("div");
    $tip.className = "px-3 py-2 text-sm text-sec whitespace-nowrap";
    $tip.textContent = "暂无已保存的组织";
    $popup.append($tip);
  }
  for (const item of gob.orgList) {
    $popup.append(fnMakeItem(item.id, item.name, item.avatar, item.url));
  }
  // 固定末项：组织管理页，图标使用站点 logo
  if (strUser) {
    const $logo = $n("svg.ruyi-icon-logo-monochrome");
    $popup.append(fnMakeItem(
      strUser,
      "组织管理",
      $logo,
      `https://cnb.cool/u/${strUser}/groups`,
    ));
  }
}

// 创建菜单按钮与弹层
function fnCreateMenu() {
  const $btn = document.createElement("button");
  $btn.id = strMenuBtnId;
  $btn.type = "button";
  $btn.className = "flex items-center gap-1 px-1 text-base text-pri cursor-pointer hover:text-brand flex-none";
  $btn.innerHTML = `
    <span>快捷跳转</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" style="width:12px;height:12px">
      <path d="M4 6.5L8 10.5L12 6.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`;

  // 弹层挂在 body 上，避免被头部的 overflow-hidden 裁剪
  const $popup = document.createElement("div");
  $popup.id = strMenuPopupId;
  $popup.className = "hidden fixed z-[9999] min-w-[200px] border border-pri rounded-[3px] bg-panel-pri py-1 shadow-lg";
  document.body.append($popup);

  // hover 触发显示 / 延迟隐藏（留出从按钮移入弹层的时间）
  let intHideTimer = 0;
  const fnShow = () => {
    clearTimeout(intHideTimer);
    fnRenderItems($popup);
    const rect = $btn.getBoundingClientRect();
    $popup.style.left = `${rect.left}px`;
    $popup.style.top = `${rect.bottom + 4}px`;
    $popup.classList.remove("hidden");
  };
  const fnHide = () => {
    clearTimeout(intHideTimer);
    intHideTimer = setTimeout(() => {
      $popup.classList.add("hidden");
    }, 300);
  };
  $btn.addEventListener("mouseenter", fnShow);
  $btn.addEventListener("mouseleave", fnHide);
  $popup.addEventListener("mouseenter", () => clearTimeout(intHideTimer));
  $popup.addEventListener("mouseleave", fnHide);

  // 点击其它区域关闭
  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) {
      return;
    }
    const bolInMenu = e.target.closest(`#${strMenuBtnId}`) || e.target.closest(`#${strMenuPopupId}`);
    if (!bolInMenu) {
      $popup.classList.add("hidden");
    }
  });

  return $btn;
}

// 确保菜单存在（SPA 重渲染后自动补回）
function fnEnsureMenu() {
  if ($n(`#${strMenuBtnId}`)) {
    return;
  }
  const $logo = $n("svg.ruyi-icon-logo-monochrome");
  if (!$logo || !gob.orgList.length) {
    return;
  }
  const $wrap = $logo.closest("a")?.parentElement;
  if (!$wrap) {
    return;
  }
  $wrap.append(fnCreateMenu());
  _log("[nav-menu]组织跳转菜单已添加");
}

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
  intTimer = setTimeout(fnEnsureMenu, 500);
});

// 初次执行 + 短暂重试：脚本在 document-end 运行时头部可能尚未渲染，
// 且整页加载后可能不再有 DOM 变化，观察者不会触发，需主动兜底
let intRetry = 0;
function fnInit() {
  fnEnsureMenu();
  if (!$n(`#${strMenuBtnId}`) && intRetry < 10) {
    intRetry++;
    setTimeout(fnInit, 1000);
  }
}
fnInit();
