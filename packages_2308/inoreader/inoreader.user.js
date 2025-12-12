// ==UserScript==
// @name         「水水」Inoreader 功能增强
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  自用脚本，导出星标收藏为 *.url 文件等
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
// @match        https://www.inoreader.com/starred
// @grant        GM_setClipboard
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "inoreader";

  const curDate = new Date();
  const _getDateStr = (date = curDate) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
  };

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
  const fnElChange = (el, fn = () => { }) => {
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
  };

  // localStorage 封装
  const lsObj = {
    setItem: function (key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    getItem: function (key, def = "") {
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
    $$Stars: [[], false],
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
    // 获取星标项目
    GetStarItems() {
      // const $$Stars = $na("div.article");
      const $$Stars = $na(".article_title_wrapper a, div.article_magazine_title a.article_magazine_title_link");
      // _log("GetStarItems\n", $$Stars);
      if ($$Stars.length === 0) {
        return;
      }
      this.$$Stars = $$Stars;
    },
  };

  // 初始化
  gob.init().load();

  fnElChange($n("#reader_pane"), function () {
    gob.GetStarItems();
    // _log("def\n", gob.$$Stars);
  });

  // nodeList 转换为 Array
  function fnNodeListToArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }

  // 构造 Bash Shell 脚本
  function fnMKShell(arrList, prefix = "") {
    const curDateStr = _getDateStr();
    let strRlt =
      "if [ ! -d \"prefix-date\" ]; then\n" +
      "mkdir prefix-date\n" +
      "fi\n" +
      "cd prefix-date\n\n";
    strRlt = strRlt.replace(/prefix/g, prefix);
    strRlt = strRlt.replace(/date/g, curDateStr);

    /**
     * e {title:"", href:""}
     */
    arrList.forEach(function (e, i) {
      const serial = i + 1;
      // _log(e);

      // 移除不能用于文件名的字符
      let title = e.title || e.textContent;
      title = title.replace(/\\|\/|:|\*|!|\?]|<|>/g, "");
      title = title.replace(/["'\s]/g, "");
      // _log(title);

      const lenTitle = title.length;
      if (lenTitle >= 155) {
        title = `标题过长丨${lenTitle}`;
      }

      // 获取文章链接
      const href = e.href || e.url;

      // url 文件名
      const urlFileName = `${serial}丨${title}.url`;

      strRlt += `echo [InternetShortcut] > "${urlFileName}"\n`;
      strRlt += `echo "URL=${href}" >> "${urlFileName}"\n`;
      strRlt += "\n";
    });

    {
      strRlt += "exit\n\n";
    }

    return strRlt;
  }

  // 星标文章导出为 *.url 文件
  $n("#reader_pane").addEventListener("mouseup", function (event) {
    const $target = event.target;
    if ($target.tagName !== "DIV" || "已没有更多文章." !== $target.textContent) {
      return;
    }
    // _log("$target", $target);
    const listItems = fnNodeListToArray(gob.$$Stars);
    GM_setClipboard(fnMKShell(listItems, "inoreader"));
    $target.textContent = "已复制到剪贴板";
  }, false);

})();
