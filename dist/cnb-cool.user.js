// ==UserScript==
// @name         cnb-cool
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  提升 cnb.cool 的使用体验
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.com/a/wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://cnb.cool/*
// @grant        none
// ==/UserScript==

/* eslint-disable */

(function () {
  'use strict';

  const gm_name = "cnb-cool";

  // -------------------------------------

  const _curUrl = () => window.location.href;

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}] |`, ...args);

  // -------------------------------------

  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // -------------------------------------

  // 元素变化监听
  function fnElChange(el, fn = () => { }) {
    const observer = new MutationObserver((mutationRecord, mutationObserver) => {
      // _log('mutationRecord = ', mutationRecord);
      // _log('mutationObserver === observer', mutationObserver === observer);
      fn(mutationRecord, mutationObserver);
      // mutationObserver.disconnect();
    });
    observer.observe(el, {
      // attributes: false,
      // attributeFilter: ["class"],
      childList: true,
      // characterData: false,
      subtree: true,
    });
  }

  // localStorage 封装
  const lsObj = {
    setItem(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    getItem(key, def = "") {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return def;
    },
  };

  // 数据读写封装
  const gobInfo = {
    // key: [默认值, 是否记录至 ls]
    // 已加入的组织列表
    orgList: [[], 1],
    // 最近访问的仓库 / issue
    hisList: [[], 1],
    // 历史中固定显示的路径
    hisPins: [[], 1],
  };
  const gob = {
    _lsKey: `${gm_name}_data`,
    _bolLoaded: false,
    data: {},
    // 初始
    init() {
      // 根据 gobInfo 设置 gob 属性
      for (const key in gobInfo) {
        if (Object.hasOwnProperty.call(gobInfo, key)) {
          const item = gobInfo[key];
          this.data[key] = item[0];
          Object.defineProperty(this, key, {
            // value: item[0],
            // writable: true,
            get() { return this.data[key] },
            set(value) { this.data[key] = value; },
          });
        }
      }
      return this;
    },
    // 读取
    load() {
      if (this._bolLoaded) {
        return;
      }
      const lsData = lsObj.getItem(this._lsKey, this.data);
      _log("[log]gob.load()", lsData);
      for (const key in lsData) {
        if (Object.hasOwnProperty.call(lsData, key)) {
          const item = lsData[key];
          this.data[key] = item;
        }
      }
      this._bolLoaded = true;
    },
    // 保存
    save() {
      const lsData = {};
      for (const key in gobInfo) {
        if (Object.hasOwnProperty.call(gobInfo, key)) {
          const item = gobInfo[key];
          if (item[1]) {
            lsData[key] = this.data[key];
          }
        }
      }
      _log("[log]gob.save()", lsData);
      lsObj.setItem(this._lsKey, lsData);
    },
  };

  // 初始化
  gob.init().load();

  // -------------------------------------
  // 收集「我加入的组织」，保存到脚本 ls（localStorage）

  // 解析当前页面中的组织卡片
  function fnParseOrgCards() {
    const curUrl = _curUrl();
    // _log("[org]当前页面", curUrl);
    if (!curUrl.endsWith("/groups"))
      return [];
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
  let intTimer$2 = 0;
  let intLast$2 = 0;
  fnElChange($n("body"), () => {
    const intNow = Date.now();
    if (intNow - intLast$2 < 500) {
      clearTimeout(intTimer$2);
    }
    intLast$2 = intNow;
    clearTimeout(intTimer$2);
    intTimer$2 = setTimeout(fnSaveOrgs, 500);
  });

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
  function fnRenderItems$1($popup) {
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
      fnRenderItems$1($popup);
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
    if (!$logo) {
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
  let intTimer$1 = 0;
  let intLast$1 = 0;
  fnElChange($n("body"), () => {
    const intNow = Date.now();
    if (intNow - intLast$1 < 500) {
      clearTimeout(intTimer$1);
    }
    intLast$1 = intNow;
    clearTimeout(intTimer$1);
    intTimer$1 = setTimeout(fnEnsureMenu, 500);
  });

  // 初次执行 + 短暂重试：脚本在 document-end 运行时头部可能尚未渲染，
  // 且整页加载后可能不再有 DOM 变化，观察者不会触发，需主动兜底
  let intRetry$1 = 0;
  function fnInit$1() {
    fnEnsureMenu();
    if (!$n(`#${strMenuBtnId}`) && intRetry$1 < 10) {
      intRetry$1++;
      setTimeout(fnInit$1, 1000);
    }
  }
  fnInit$1();

  // -------------------------------------
  // 在「待办」tab 内展示访问历史：
  // 记录最近访问过的仓库或 issue，允许固定一条记录以一直显示，也可以取消固定

  // 历史卡片标记（无外层容器，卡片直接挂在 tabs-content 内）
  const strCardRole = "cnb-history-card";
  // 未固定记录的保留条数
  const intMaxHis = 20;

  // 解析当前路径是否为仓库 / issue 页面
  function fnParsePath(strPath) {
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
    const strType = strPath.includes("/issues") ? "issue" : "repo";
    // issue 列表页（-/issues 结尾）不记录
    if (strType === "issue" && /\/-?\/issues\/?$/.test(strPath)) {
      return null;
    }
    // 仓库只记录根路径，issue 记录完整路径
    const strRec = strType === "issue" ? strPath : `/${arrSeg[0]}/${arrSeg[1]}`;
    return { path: strRec, type: strType };
  }

  // 记录时抓取页面标题：issue 取实际标题，仓库取描述；取不到返回空串（显示时回退为路径）
  function fnScrapeTitle(strType) {
    // issue 标题按「·」分隔取第一段（如「标题 · 仓库 · 站点名」）
    const fnPick = strVal => strType === "issue"
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
  function fnRecordVisit() {
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
  function fnTogglePin(strPath) {
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
  function fnFormatTime(intTs) {
    if (!intTs) {
      return "";
    }
    const dt = new Date(intTs);
    const options = { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
    return dt.toLocaleString("zh-CN", options);
  }

  // 克隆页面已有图标，找不到时返回 null
  function fnCloneIcon(strSelector) {
    const $icon = $n(strSelector);
    if (!$icon) {
      return null;
    }
    const $el = $icon.cloneNode(true);
    $el.removeAttribute("id");
    return $el;
  }

  // 待办卡片骨架缓存（grid + t-table，tbody 已清空）
  let $tplCard = null;

  // 生成一条历史记录行（对齐待办卡片内的 tr 结构）
  function fnMakeRow(item) {
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
    const $pinIcon = fnCloneIcon(".ruyi-icon-label-pin");
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
      const $card = $tplCard.cloneNode(true);
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
  function fnGetContent() {
    const $tabs = $n(".t-tabs__content");
    if (!$tabs) {
      return null;
    }
    const $panel = [...$tabs.querySelectorAll(".t-tab-panel")]
      .find($p => $p.querySelector(".issue-pull-list")) || $tabs.querySelector(".t-tab-panel");
    return $panel?.querySelector(".tabs-content") || null;
  }

  // 缓存待办卡片模板（grid + t-table，tbody 已清空），成功返回 true
  function fnCacheTemplate($content) {
    if ($tplCard) {
      return true;
    }
    const $tpl = $content.querySelector(".issue-pull-list")?.closest(".grid");
    if (!$tpl) {
      return false;
    }
    $tplCard = $tpl.cloneNode(true);
    const $tbody = $tplCard.querySelector("tbody");
    if ($tbody) {
      $tbody.innerHTML = "";
    }
    return true;
  }

  // 移除已渲染的历史卡片
  function fnRemoveCards() {
    for (const $el of $na(`[data-role="${strCardRole}"]`)) {
      $el.remove();
    }
  }

  // 渲染历史卡片：固定项在前，其后按最近访问排序
  // 每条记录各自复制一张待办卡片（grid + t-table），逐个挂到 tabs-content
  function fnRenderItems() {
    fnRemoveCards();
    const $content = fnGetContent();
    if (!$content) {
      return;
    }
    const bolTpl = fnCacheTemplate($content);
    const mapHis = new Map(gob.hisList.map(item => [item.path, item]));
    const arrShow = [
      ...gob.hisPins.map(strPath => mapHis.get(strPath) || { path: strPath, type: "repo" }),
      ...gob.hisList.filter(item => !gob.hisPins.includes(item.path)),
    ];
    if (bolTpl) {
      if (!arrShow.length) {
        const $card = $tplCard.cloneNode(true);
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
  function fnEnsureHistory() {
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
  function fnInit() {
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
  fnElChange($n("body"), () => {
    const intNow = Date.now();
    if (intNow - intLast < 500) {
      clearTimeout(intTimer);
    }
    intLast = intNow;
    clearTimeout(intTimer);
    intTimer = setTimeout(fnEnsureHistory, 500);
  });

})();
