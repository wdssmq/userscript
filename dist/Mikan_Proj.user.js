// ==UserScript==
// @name         「蜜柑计划」列表过滤（简繁/画质）
// @namespace    https://www.wdssmq.com/
// @version      1.0.3
// @author       沉冰浮水
// @description  过滤蜜柑计划列表，仅保留匹配规则的条目
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.com/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://mikanani.me/Home/Bangumi/*
// @match        https://mikanime.tv/Home/Bangumi/*
// @match        https://mikanani.me/
// @match        https://mikanime.tv/
// @match        https://feedly.com/i/subscription/feed*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = ".is-flex {\n  display: flex;\n}\n\n.is-align-center {\n  align-items: center;\n}\n\n.is-justify-evenly {\n  justify-content: space-evenly;\n}\n\n.pagebar a:focus,\n.pagebar a:hover,\n.pagebar a:active {\n  outline: none;\n  color: #ff6f61;\n  text-decoration: none;\n}";
  styleInject(css_248z);

  const gm_name = "Mikan_Proj";

  // ---------------------------------------------------
  const _log = (...args) => console.log(`[${gm_name}]|`, ...args);
  // ---------------------------------------------------
  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
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

  const _config = {
    data: {},
    dataDef: {
      pickRules: [
        {
          name: "Kirara Fantasia",
          regex: "Baha\\s",
        },
        {
          name: "漫猫字幕组&爱恋字幕组",
          regex: "1080p.+(简中|简日)",
        },
        {
          name: "华盟字幕社&千夏字幕组",
          regex: "简体",
        },
        {
          name: "北宇治字幕组",
          regex: "简日内嵌",
        },
        {
          name: "喵萌奶茶屋",
          regex: [
            "简体",
            "简日",
          ],
        },
        {
          name: "动漫国字幕组",
          regex: [
            "简体",
            "简日",
          ],
        },
      ],
      // 记录是否为第一次运行
      firstRun: true,
    },
    // 获取指定规则
    getRule: (name) => {
      return _config.data.pickRules.find(rule => rule.name === name);
    },
    // 更新指定规则
    updateRule: (name, regex) => {
      // _log("updateRule() ", name, regex);
      const index = _config.data.pickRules.findIndex(rule => rule.name === name);
      if (index !== -1) {
        _config.data.pickRules[index] = { name, regex };
      }
      else {
        _config.data.pickRules.push({ name, regex });
      }
      _config.save();
    },
    save: () => {
      GM_setValue("config", _config.data);
    },
    load: () => {
      _config.data = GM_getValue("config", _config.dataDef);
      // 初始化配置
      if (_config.data.firstRun) {
        _log("首次运行，初始化配置");
        _config.data.firstRun = false;
        _config.save();
      }
    },
  };

  _config.load();

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
        const curRule = _config.getRule(groupName);
        const userInput = prompt(`请输入发布组 "${groupName}" 的筛选规则（多个规则用 | 分隔）：`, curRule ? (Array.isArray(curRule.regex) ? curRule.regex.join("|") : curRule.regex) : "");
        if (userInput !== null) {
          const newRegex = userInput.split("|").map(item => item.trim());
          console.log(userInput, newRegex);
          _config.updateRule(groupName, newRegex.length === 1 ? newRegex[0] : newRegex);
        }
      });
    }
  }

  function _pick(group) {
    const { name, $table, $subscribed } = group;
    // 获取当前规则
    const curRule = _config.getRule(name);
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

  // 遍历 nodeList
  function fnEachNodeList(nodeList, fn) {
    // 倒序遍历
    for (let i = nodeList.length - 1; i >= 0; i--) {
      fn(nodeList[i], i);
    }
  }

  // 按发布组获取信息
  function fnGetGroupInfo() {
    const arrGroup = [];
    // 获取全部 div.subgroup-text
    const $listGroup = $na(".subgroup-text");
    fnEachNodeList($listGroup, ($group, _i) => {
      const $groupTitle = $group.querySelector("div.dropdown-toggle span") || $group.querySelector("a");
      const $subscribed = $group.querySelector(".subscribed");

      const groupName = $groupTitle.textContent;
      const $groupTable = $group.nextElementSibling;
      arrGroup.push({
        name: groupName,
        $table: $groupTable,
        $subscribed,
      });
    });
    return arrGroup;
  }

  // 自动展开更多
  function fnAutoExpand() {
    const $more = $na(".js-expand-episode");
    const moreLen = $more.length;

    // 定义一个计数，用于记录点击的按钮数量
    let clickCount = 0;

    // 判断每个按钮是否为 display: none
    const isVisible = el => el.offsetParent !== null;
    fnEachNodeList($more, ($btn, _i) => {
      if (isVisible($btn)) {
        $btn.click();
      }
      else {
        clickCount++;
      }
    });
    if (clickCount === moreLen) {
      const arrGroup = fnGetGroupInfo();
      // _log("arrGroup", arrGroup);
      arrGroup.forEach((group) => {
        _pick(group);
        // _log("group", group);
      });
      return;
    }
    setTimeout(() => {
      fnAutoExpand();
    }, 2000);
  }

  fnAutoExpand();

  const LAST_PAGE_KEY = "lastPage";

  const pageBar = {
    curPage: 1,
    nextPage: null,
    prevPage: null,
    gotoFlag: false,

    $anList: null,

    $dateText: null,
    $$dateLi: null,

    // 初始化
    init() {
      this.$anList = $n("#an-list");
      this.$dateText = $n(".date-text");
      // console.log(this.$anList, this.$dateText);
      if (!this.$anList || !this.$dateText) {
        // _log("未找到必要的 DOM 元素，分页组件无法初始化");
        return;
      }
      this.$$dateLi = $na(".date-select .dropdown-submenu li>a");
      const lastPage = lsObj.getItem(LAST_PAGE_KEY, 1);
      if (lastPage >= 1 && lastPage <= this.$$dateLi.length) {
        this.curPage = lastPage;
      }
      this.insertPagebar();
    },

    // 插入分页组件
    insertPagebar() {
      const pagebar = document.createElement("div");
      pagebar.classList.add("sk-bangumi", "pagebar", "is-flex", "is-align-center", "is-justify-evenly");
      let pagebarHTML = `
      <a href="javascript:;" class="prev">上一页</a>
      <span class="cur-page">{{curPage}}</span>
      <a href="javascript:;" class="next">下一页</a>
    `;
      pagebarHTML = pagebarHTML.replace("{{curPage}}", this.$dateText.textContent.trim());
      pagebar.innerHTML = pagebarHTML;
      this.$anList.insertAdjacentElement("afterend", pagebar);

      // 获取分页按钮
      const $prev = $n(".pagebar .prev");
      const $next = $n(".pagebar .next");

      // 绑定点击事件
      $prev.addEventListener("click", () => {
        if (this.prevPage !== null) {
          this.gotoPage(this.prevPage, $prev, $next);
        }
      });
      $next.addEventListener("click", () => {
        if (this.nextPage !== null) {
          this.gotoPage(this.nextPage);
        }
      });

      // 监听 $dateText 的变化，更新分页信息
      fnElChange(this.$dateText, () => {
        this.updatePageInfo($prev, $next);
      });

      if (this.curPage !== 1) {
        // 自动跳转到上次访问的页码
        this.gotoPage(this.curPage);
      }
      else {
        // 初始更新分页信息
        this.updatePageInfo($prev, $next, true);
      }
    },

    // 跳转到指定页码（页码从 1 开始）
    gotoPage(pageNo) {
      if (pageNo < 1 || pageNo > this.$$dateLi.length) {
        return;
      }
      this.gotoFlag = true;
      this.curPage = pageNo;
      const pageIndex = pageNo - 1;
      this.$$dateLi[pageIndex].click();
    },

    // 根据季度文本获取页码（页码从 1 开始）
    getPageByDate(dateText) {
      for (let i = 0; i < this.$$dateLi.length; i++) {
        const $li = this.$$dateLi[i];
        const year = $li.getAttribute("data-year");
        const season = $li.getAttribute("data-season");
        if (dateText === `${year} ${season}季番组`) {
          return i + 1;
        }
      }
      return 1;
    },

    // 更新分页信息
    updatePageInfo($prev = null, $next = null, isInit = false) {
      const dateText = this.$dateText.textContent.trim();
      if (!isInit) {
        if (this.gotoFlag) {
          this.gotoFlag = false;
        }
        else {
          this.curPage = this.getPageByDate(dateText);
        }
        lsObj.setItem(LAST_PAGE_KEY, this.curPage);
      }

      const nextPage = this.curPage + 1;
      if (nextPage <= this.$$dateLi.length) {
        this.nextPage = nextPage;
        $next.textContent = `下一页（${this.nextPage}）`;
        $next.classList.remove("disabled");
      }
      else {
        this.nextPage = null;
        $next.textContent = "";
        $next.classList.add("disabled");
      }
      const prevPage = this.curPage - 1;
      if (prevPage >= 1) {
        this.prevPage = prevPage;
        $prev.textContent = `上一页（${this.prevPage}）`;
        $prev.classList.remove("disabled");
      }
      else {
        this.prevPage = null;
        $prev.textContent = "";
        $prev.classList.add("disabled");
      }
      $n(".pagebar .cur-page").textContent = `${dateText}（${this.curPage}）`;
    },
  };

  pageBar.init();

})();
