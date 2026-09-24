// ==UserScript==
// @name         「水水」自用贴吧辅助
// @namespace    https://www.wdssmq.com/
// @version      1.0.3
// @author       沉冰浮水
// @description  置百丈玄冰而崩裂，掷须臾池水而漂摇。
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
// @match        https://tieba.baidu.com
// @match        https://tieba.baidu.com/index.html
// @match        https://tieba.baidu.com/i/i/forum*
// @match        https://tieba.baidu.com/f?kw=*
// @grant        GM_addStyle
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

if (unsafeWindow.console) {
  unsafeWindow.console.firebug = true;
} else {
  console.firebug = true;
}

(function () {
  'use strict';

  const gm_name = "tieba";

  const curDate = new Date();

  // -------------------------------------

  const _curUrl = () => window.location.href;
  function _getDateStr(date = curDate) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
  }

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}] |`, ...args);
  const _warn = (...args) => console.warn(`[${gm_name}] |`, ...args);

  // -------------------------------------

  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }

  // -------------------------------------

  // 添加内容到指定元素后面
  function fnAfter(newEl, el) {
    el = typeof el === "string" ? $n(el) : el;
    el.parentNode.insertBefore(newEl, el.nextSibling);
  }

  // 指定元素内查找子元素
  function fnFindDom(el, selector) {
    el = typeof el === "string" ? $n(el) : el;
    const queryList = el.querySelectorAll(selector);
    if (queryList.length === 1) {
      return queryList[0];
    }
    return queryList.length > 1 ? queryList : null;
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
    linkLog: [[], false],
    当前吧名: ["", false],
    当前日期: ["", false],
    签到列表: [{}, true],
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
    load(force = false) {
      if (this._bolLoaded && !force) {
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

  // 获取当前吧名
  gob.getCurForumName = () => {
    const $forumName = $n(".card_title a.card_title_fname");
    if ($forumName) {
      gob.当前吧名 = $forumName.textContent;
    }
  };

  gob.addLink = (link) => {
    const { linkLog } = gob;
    if (!linkLog.includes(link)) {
      linkLog.push(link);
    }
    _warn("addLink()\n", linkLog);
  };

  gob.checkLink = () => {
    const { linkLog } = gob;
    // 大于等于 4 时，刷新页面
    if (linkLog.length >= 4) {
      window.location.reload();
    }
  };

  // 绑定页面焦点事件
  window.addEventListener("focus", () => {
    gob.checkLink();
  });

  // 记录已签到的贴吧

  function fnLogSigned() {
    const curUrl = _curUrl();
    // 地址内不含有 /i/i/forum 且 不含有 /f?kw= 的不执行
    if (!curUrl.includes("/i/i/forum") && !curUrl.includes("/f?kw=")) {
      return;
    }

    let 中止监听 = false;

    // 贴吧列表处理
    const colorForumList = () => {
      const $table = $n(".forum_table");
      if (!$table) {
        return;
      }
      中止监听 = true;
      const $itemLink = fnFindDom($table, "a");
      // 遍历判断是否已签到
      [].forEach.call($itemLink, ($link) => {
        const text = $link.textContent;
        const title = $link.title;
        if (text === title) {
          const item = gob.签到列表[`${title}吧`];
          // 判断是否已签到
          if (item && item === _getDateStr()) {
            // $link.style.color = "#000";
            $link.parentNode.style.backgroundColor = "#eee";
          }
          // 监听点击事件
          $link.classList.add("name");
          // 点击事件，包括中键点击
          $link.addEventListener("mousedown", (_e) => {
            gob.addLink(title);
          });
        }
      });
    };

    // 判断是否与签到
    const isSigned = () => {
      const $signstar_wrapper = $n("#signstar_wrapper");
      // 如果含有类名 sign_box_bright_signed，说明已签到
      if ($signstar_wrapper.classList.contains("sign_box_bright_signed")) {
        // alert("已签到");
        return true;
      }
      return false;
    };

    // 记录签到到 ls
    const logSigned = () => {
      gob.load(true);
      const { 签到列表, _当前日期, 当前吧名 } = gob;
      签到列表[当前吧名] = _getDateStr();
      gob.签到列表 = 签到列表;
      gob.save();
    };

    const $body = $n("body");

    fnElChange($body, (_mr, mo) => {
      // 贴吧列表页
      colorForumList();
      if (中止监听) {
        mo.disconnect();
      }
      // 贴吧签到页
      const $sign_today_date = $n(".sign_today_date");
      if (!$sign_today_date) {
        return;
      }
      const sign_today_date = $sign_today_date.textContent;
      gob.当前日期 = sign_today_date.trim();
      gob.getCurForumName();
      // console.log(gob.data);
      if (isSigned()) {
        logSigned();
        mo.disconnect();
      }
    });
  }

  try {
    fnLogSigned();
  }
  catch (error) {
    _warn(error);
  }

  function fnFixReply() {
    const $body = $n("body");
    // 判断封装
    const loadCheck = {
      t: null,
      check(text) {
        return text.includes("查看回复");
      },
      delay() {
        loadCheck.clearDelay();
        loadCheck.t = setTimeout(() => {
          location.reload();
        }, 1000);
      },
      clearDelay() {
        clearTimeout(loadCheck.t);
      },
      addLink() {
        // 创建一个新的导航链接
        const $u_notify_replay = document.createElement("li");
        $u_notify_replay.className = "category_item category_item_empty";
        $u_notify_replay.innerHTML = `<a class="j_cleardata" href="/i/sys/jump?type=replyme" target="_blank" data-type="reply">
          查看回复
      </a>
    `;
        // 添加链接到页面
        fnAfter($u_notify_replay, $n(".sys_notify .category_item"));
      },
    };

    // 监听页面改动
    fnElChange($body, () => {
      const $sys_notify = $n("div.u_notity_bd");
      if (!$sys_notify || !$sys_notify.textContent.includes("查看私信")) {
        return;
      }
      if (!loadCheck.check($sys_notify.textContent)) {
        // _warn($sys_notify.textContent.replace(/\s+/g, " "));
        loadCheck.addLink($sys_notify);
        // loadCheck.clearDelay()
      }
    });
  }

  try {
    fnFixReply();
  }
  catch (error) {
    _warn(error);
  }

  function fnMain$1() {
    // 导航设置
    const $sub_nav_list = $n(".sub_nav_list");
    if (!$sub_nav_list) {
      return;
    }
    // 宽度 100%
    $sub_nav_list.style.width = "100%";
    // 匹配「个性动态」元素
    const $nav_personal = $n("#nav-personal-wraper");
    _warn($nav_personal);
    // 创建一个新的导航链接
    const $nav_i = document.createElement("li");
    $nav_i.className = "nav-i-forum";
    $nav_i.innerHTML = `
    <a href="https://tieba.baidu.com/i/i/forum?&pn=2" class="nav-item-link" target="_blank">
      我关注的贴吧
    </a>
  `;
    $nav_i.style.float = "right";
    // 插入到导航栏
    fnAfter($nav_i, $nav_personal);
  }

  try {
    fnMain$1();
  }
  catch (error) {
    _warn(error);
  }

  // 【小书签】一键骨架屏（Skeleton Screen） - 大家的板块 / 稻米鼠的频道🐹 - 小众软件官方论坛
  // https://meta.appinn.net/t/topic/21419

  const skeletonLoader = {
    selectList: [],
    textNodes: [],
    midColor(rgb) {
      return rgb.replace(/\d+/g, num => (num * 2) >= 128 ? 128 + (num - 128) / 2 : 128 - (128 - num) / 2);
    },
    getPic(width, height, text) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = "#F3F3F3";
      ctx.fillRect(0, 0, width, height);
      const strArr = text.split(/\n/g);
      const maxLength = Math.max.apply(null, strArr.map(s => s.length));
      if (maxLength) {
        const fontSize = Math.min(width / maxLength, height / strArr.length);
        ctx.font = `Bold ${fontSize}px Consolas`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#999";
        const x = width / 2;
        const y = (height - fontSize * strArr.length) / 2 + fontSize;
        strArr.forEach((str, i) => {
          ctx.fillText(str, x, y + i * fontSize);
        });
      }
      return canvas.toDataURL("image/png");
    },

    copyAtts(newEl, el) {
      const atts = ["id", "class", "style"];
      for (const att of atts) el.getAttribute(att) && newEl.setAttribute(att, el.getAttribute(att));
    },

    addSelector(selector) {
      this.selectList.push(selector);
    },

    applySkeleton() {
      this.selectList.forEach((selector) => {
        // 获取 selector 元素
        const el = $n(selector);
        // 获取 selector 元素下的所有子孙元素
        const elList = fnFindDom(el, "*");
        // 遍历所有子孙元素
        elList.forEach((el) => {
          for (const e of el.childNodes) e.nodeType === Node.TEXT_NODE && this.textNodes.push(e);
          const elStyle = window.getComputedStyle(el);
          if (elStyle.backgroundImage !== "none" && /^url\(.*\)$/.test(elStyle.backgroundImage)) {
            const img = document.createElement("img");
            img.src = elStyle.backgroundImage.replace(/^url\("(.*)"\)$/, "$1");
            img.onload = () => {
              el.style.backgroundImage = `url("${this.getPic(img.width, img.height, img.width > 30 && img.height > 30 ? `background\n${img.width}x${img.height}` : "")}")`;
            };
          }
          if (["IMG", "SVG", "CANVAS", "VIDEO"].includes(el.tagName)) {
            const width = (+elStyle.width.replace(/px$/, ""))
              .toFixed();
            const height = (+elStyle.height.replace(/px$/, ""))
              .toFixed();
            if (el.tagName === "IMG") {
              el.src = this.getPic(el.naturalWidth, el.naturalHeight, `${width}x${height}`);
              return (el.srcset.length && (el.srcset = el.src));
            }
            const newEl = document.createElement("img");
            newEl.src = this.getPic(width, height, `${el.tagName}\n${width}x${height}`);
            this.copyAtts(newEl, el);
            el.parentNode.replaceChild(newEl, el);
            return;
          }
          if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
            el.value = el.value.replace(/./g, "▮");
            void (el.placeholder = el.placeholder.replace(/./g, "▮"));
          }
        });
      });
      this.textNodesUnder();
    },

    // 遍历所有文本节点函数
    textNodesUnder(_el) {
      this.textNodes.forEach((textEl) => {
        if (/^\s*$/.test(textEl.textContent))
          return;
        const elStyle = window.getComputedStyle(textEl.parentNode);
        if (!elStyle.lineHeight || !elStyle.fontSize)
          return;
        const newTextNode = document.createElement("span");
        const color = "rgba(0,0,0,0) !important";
        const bgColor = elStyle.color;
        const lineHeight = +elStyle.lineHeight.replace(/px$/, "");
        const fontSize = +elStyle.fontSize.replace(/px$/, "");
        (100 * (lineHeight - 0.8 * fontSize) / 2 / lineHeight).toFixed();
        const bgGradient = `linear-gradient(to bottom, transparent 20%, ${this.midColor(bgColor)} 20% 80%, transparent 80%) !important`;
        newTextNode.style = `color: ${color}; background: ${bgGradient};`;
        newTextNode.innerHTML = textEl.textContent;
        textEl.parentNode.replaceChild(newTextNode, textEl);
      });
    },

  };

  // 封装一个函数，用于创建元素
  function fnCreateDom(tagName, innerHTML, attr = {}) {
    const $dom = document.createElement(tagName);
    for (const key in attr) {
      $dom.setAttribute(key, attr[key]);
    }
    $dom.innerHTML = innerHTML;
    return $dom;
  }

  function fnMain() {
    const $my = $n("#my_tieba_mod");
    if ($my) {
      const $h4 = fnFindDom($my, "h4");
      // 创建一个按钮
      const $btn = fnCreateDom("a", "一键骨架屏", {
        href: "javascript:;",
        class: "skeleton_btn pull_right",
      });
      // 将按钮插入到 h4 标签后面
      $h4.append($btn);
      // 给按钮绑定点击事件
      $n(".skeleton_btn").addEventListener("click", () => {
        skeletonLoader.selectList = [
          "#new_list",
        ];
        skeletonLoader.applySkeleton();
      });
    }
  }

  try {
    fnMain();
  }
  catch (error) {
    _warn("一键骨架屏", error);
  }

})();
