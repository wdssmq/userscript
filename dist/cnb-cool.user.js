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
  let intTimer$1 = 0;
  let intLast$1 = 0;
  fnElChange($n("body"), () => {
    const intNow = Date.now();
    if (intNow - intLast$1 < 500) {
      clearTimeout(intTimer$1);
    }
    intLast$1 = intNow;
    clearTimeout(intTimer$1);
    intTimer$1 = setTimeout(fnSaveOrgs, 500);
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

})();
