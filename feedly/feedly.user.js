// ==UserScript==
// @name         「Feedly」中键标记已读 + 收藏导出为*.url
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  新标签页打开条目时自动标记为已读，收藏计数
// @link    https://github.com/wdssmq/userscript/tree/master/feedly
// @link    https://greasyfork.org/zh-CN/scripts/381793
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @match        https://feedly.com/*
// @noframes
// @run-at       document-end
// @grant        GM_openInTab
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

/* jshint esversion: 6 */
/* eslint-disable */

(function () {
  'use strict';

  const gm_name = "feedly";

  const curDate = new Date();
  // ---------------------------------------------------
  const _curUrl = () => { return window.location.href };
  const _getDateStr = (date = curDate) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("zh-CN", options).replace(/\//g, "-");
  };
  // ---------------------------------------------------
  const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);
  const _warn = (...args) => console.warn(`[${gm_name}]\n`, ...args);
  // ---------------------------------------------------
  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
  // ---------------------------------------------------
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
  function fnFindDom(el, selector) {
    return el.querySelectorAll(selector);
  }
  function fnFindDomUp(el, selector, up = 1) {
    // _log("fnFindDomUp", el, selector, up);
    const elParent = el.parentNode;
    if (selector.indexOf(".") == 0 && elParent.className.indexOf(selector.split(".")[1]) > -1) {
      return elParent;
    }
    const elFind = elParent.parentNode.querySelector(selector);
    if (elFind) {
      return elFind;
    }
    if (up > 1) {
      return fnFindDomUp(elParent, selector, up - 1);
    } else {
      return null;
    }
  }

  const curTime = Math.floor(curDate.getTime() / 1000);
  const curHours = Math.floor(curTime / 3600);
  // const cur4Hours = Math.floor(curTime / (60 * 60 * 4));
  const cur4Minutes = Math.floor(curTime / 240);

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
    $$Stars: [null, 0],
    bolUpd: [false, 0],
    bolReset: [false, 1],
    cntStars: [0, 0],
    diffStars: [{ decr: 0, incr: 0 }, 1],
    lstStars: [0, 1],
  };
  // decrease 减少
  // increase 增加
  const gob = {
    _lsKey: `${gm_name}_data`,
    _bolLoaded: false,
    _time: {
      cycle: 0,
      rem: 0,
    },
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

  // 判断当前地址是否是收藏页
  const fnCheckUrl = () => {
    if ("https://feedly.com/i/saved" === _curUrl()) {
      return true;
    }
    return false;
  };

  // 当前星标数获取
  function fnGetItems(obj) {
    const $listWrap = $n("div.list-entries");
    if ($listWrap) {
      obj.$$Stars = $listWrap.querySelectorAll("div.content>a");
      return obj.$$Stars.length;
    }
    return 0;
  }

  const fnCheckControl = (diff) => {
    const iTime = curHours;
    const modTime = iTime % 4;
    gob._time.cycle = iTime;
    gob._time.rem = modTime;
    // _log("fnCheckControl", JSON.stringify(diff), iTime, modTime);
    // diff.decr 累计已读
    // diff.incr 累计新增
    if (diff.decr >= 17 && diff.decr - diff.incr >= 4) {
      if (modTime === 0) {
        return "reset";
      } else {
        return "lock";
      }
    }
    return "default";
  };

  // 星标变动控制
  function fnControl() {
    const $end = $n(".list-entries > h2");
    if (!$end) {
      _log("fnControl", "页面加载中");
      return false;
    }

    // 读取 gob 值备用
    const strReset = gob.bolReset.toString();
    let diffStars = gob.diffStars;

    // 解锁重置判断
    if (gob.bolReset) {
      diffStars = { decr: 0, incr: 0 };
    }
    // decrease 减少
    // increase 增加

    // 星标变化计数
    const diff = gob.cntStars - gob.lstStars;

    // 写入新的星标数
    gob.lstStars = gob.cntStars;

    // 初始化时直接返回
    if (diff === gob.cntStars) {
      gob.save();
      return true;
    }

    // 判断变化状态
    if (diff > 0) {
      // 新增星标计数
      diffStars.incr += Math.abs(diff);
    } else {
      // 已读星标计数
      diffStars.decr += Math.abs(diff);
    }

    gob.bolReset = ((diff) => {
      if (fnCheckControl(diff) === "reset") {
        return true;
      }
      return false;
    })(diffStars);

    // 更新 localStorage 存储
    if (diff !== 0 || strReset !== gob.bolReset.toString()) {
      gob.diffStars = diffStars;
      gob.save();
    }

    return true;
  }

  // 收藏数 View
  function fnViewStars() {
    gob.cntStars = fnGetItems(gob);
    // _log("fnViewStars", gob.cntStars);
    const strText = `Read later（${gob.cntStars} 丨 -${gob.diffStars.decr} 丨 +${gob.diffStars.incr}）（${gob._time.cycle} - ${gob._time.rem}）`;
    $n("h1 #header-title").innerHTML = strText;
    if ($n("header.header h2")) {
      $n("header.header h2").innerHTML = strText;
    }
    $n("#header-title").innerHTML = strText;
  }

  gob.pickRule = {
    forMod: 13,
    minPick: 4,
    maxPick: 7,
    lstPick: 0,
    pickList: [],
  };

  GM_addStyle(`
  .pick,.pick:hover {
    background-color: #ddd !important;
  }
  .un-mark {
    background-color: #f6f7f8 !important;
  }
  .lock {
    color: transparent !important;
  }
`);

  // 按规则给星标条目着色
  function fnColorStars(offset = 0) {
    // begin fnColorStars
    const $stars = gob.$$Stars;
    const isLock = "lock" === fnCheckControl(gob.data.diffStars) ? true : false;
    // console.log("fnColorStars", fnCheckControl(gob.data.diffStars), isLock);
    const oConfig = gob.pickRule;
    const $$pick = $na(".pick");
    // ----------------------------
    let pickCount = $$pick.length;
    if (pickCount >= oConfig.minPick) {
      _log("fnColorStars", "已经选够了");
      return;
    }
    // ----------------------------
    const fnPick = ($item, i) => {
      if (i > 1 && i - oConfig.lstPick < oConfig.minPick / 2) {
        return;
      }
      oConfig.lstPick = i;
      $item.classList.add("pick");
      pickCount += 1;
    };
    // ----------------------------
    [].forEach.call($stars, function ($e, i) {
      // begin forEach
      const $ago = fnFindDomUp($e, ".ago", 2);
      const href = $e.href;
      const hash = parseInt((href + $ago.innerHTML).replace(/\D/g, ""));
      // _log("fnColorStars", $ago, href, hash);
      const $item = $e.parentNode.parentNode;
      if ($item.classList.contains("pick")) {
        oConfig.lstPick = i;
        return;
      }
      // ----------------------------
      const $saved = fnFindDom($item, ".EntryReadLaterButton--saved");
      if (!$saved) {
        $item.classList.add("un-mark");
      }
      // ----------------------------
      if (oConfig.pickList.includes(hash)) {
        // fnPick($item);
        return;
      }
      // ----------------------------
      const bolPick = (() => {
        let rlt = true;
        if (i >= 37) {
          rlt = false;
        }
        if (pickCount >= oConfig.maxPick) {
          rlt = false;
        }
        return rlt;
      })();
      // ----------------------------
      let intNum = parseInt(hash + cur4Minutes) + offset;
      if (intNum % oConfig.forMod == 0 && bolPick) {
        oConfig.pickList.push(hash);
        fnPick($item, i);
      } else {
        if (isLock || i >= 37) {
          $item.classList.add("lock");
          [].forEach.call(fnFindDom($item, "a, span, div>svg, .summary"), function ($ite) {
            $ite.classList.add("lock");
          });
        }
      }
      // end forEach
    });
    // ----------------------------
    if (pickCount <= oConfig.minPick) {
      if (offset < oConfig.forMod) {
        fnColorStars(offset + 1);
        return;
      } else {
        _log("fnColorStars", "未能选够");
        _log("fnColorStars", oConfig);
        oConfig.pickList = [];
        oConfig.lstPick = 0;
      }
    }
    // end fnColorStars
  }

  // 滚动条滚动时触发
  function fnOnScroll() {
    fnViewStars();
    fnColorStars();
  }

  // 处理器函数
  function fnHandler(e = null) {
    if (!fnCheckUrl()) {
      return;
    }
    // 判断是否为滚动事件
    if (e && e.type === "scroll") {
      fnOnScroll();
    }
    // 更新 ls 记录
    let bolUpd = false;
    if (!gob.bolUpd) {
      bolUpd = fnControl();
    }
    if (bolUpd) {
      _warn("fnHandler", gob.data);
      gob.bolUpd = true;
    }
  }

  // 星标部分入口函数
  function fnMain(record, observer) {
    if (!fnCheckUrl()) {
      return;
    }
    // 随机直接返回
    if (Math.random() > 0.6) {
      return;
    }
    gob.cntStars = fnGetItems(gob);
    _log("fnMain", gob.cntStars);
    if (gob.cntStars === 0) {
      return;
    }
    // observer.disconnect();
    // 绑定事件
    if ($n("#feedlyFrame") && $n("#feedlyFrame").dataset.addEL !== "done") {
      // 加载后尝试执行一次
      fnHandler();
      $n("#feedlyFrame").addEventListener("scroll", fnHandler);
      $n("#feedlyFrame").dataset.addEL = "done";
      _log("fnMain", "绑定滚动监听");
      observer.disconnect();
    }
  }

  fnElChange($n("#root"), fnMain);

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
      let title = e.title || e.innerText;
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
  $n("#root").addEventListener("mouseup", function (event) {
    if (event.target.innerHTML.indexOf("Read later") > -1 && $n(".list-entries > h2")) {
      const $el = event.target;
      console.log($el);
      const listItems = fnNodeListToArray($na("div.content a"));
      GM_setClipboard(fnMKShell(listItems, "feedly"));
      $n(".list-entries > h2").innerHTML = "已复制到剪贴板";
    }
  }, false);

  // 拿回订阅源地址
  // 绑定监听事件到 div#box 上
  $n("#root").addEventListener("mouseup", function (event) {
    // 输出触发事件的元素
    // 根据内容判断是否执行相应操作
    const elText = event.target.innerHTML;
    if (
      // elText.indexOf("Feed not found") > -1 ||
      elText.indexOf("Wrong feed URL") > -1
    ) {
      // 内部再输出一次确定判断条件正确
      console.log(event.target);
      // 拿到解码后的订阅源地址
      const curUrl = ((url) => {
        return url.replace("https://feedly.com/i/subscription/feed/", "");
      })(decodeURIComponent(curUrl));
      // 输出到页面中
      $n("#feedlyPageFX h2").insertAdjacentHTML(
        "beforeend",
        `<div class="sub">${curUrl}</div>`,
      );
    }
  }, false);

  // 自动标记已读
  (() => {
    if (!$n("#root") || $n("#root").dataset.MarkRead === "bind") {
      return;
    }
    // _log("fnAutoMark", "自动标记已读");
    $n("#root").dataset.MarkRead = "bind";

    // 根据事件返回需要的 dom 元素
    const fnEventFilter = (eType, eTgt) => {
      // _log("fnEventFilter", eType, eTgt);

      let pick = false;
      let objRlt = null, objDef = {
        $entry: null,
        $btn: null,
      };
      if (eType === "mouseup") {
        if (
          eTgt.classList.contains("entry__title") && eTgt.nodeName === "A"
        ) {
          objRlt = {
            // 当前条目元素
            $entry: eTgt.parentNode.parentNode,
            // 标记已读的按钮
            $btn: eTgt.parentNode.querySelector("button.EntryMarkAsReadButton"),
          };
          pick = true;
        }
      } else if (eType === "mouseover") {
        if (eTgt.nodeName === "ARTICLE" && eTgt.className.indexOf("entry") > -1) {
          objRlt = {
            // 当前内容条目元素
            $entry: eTgt,
            // 标记已读的按钮
            $btn: eTgt.querySelector("button.EntryMarkAsReadButton"),
          };

          // _log("fnEventFilter", "移入");
          // _log("fnEventFilter", eTgt.dataset.leaveCount, typeof eTgt.dataset.leaveCount);

          const intLeaveCount = parseInt(eTgt.dataset.leaveCount);

          // 已经触发过 leave 事件时才通过
          pick = intLeaveCount >= 1 ? true : false;
          if (pick) {
            return objRlt;
          }

          // _log("fnEventFilter", intLeaveCount);

          if (!isNaN(intLeaveCount)) {
            // _log("fnEventFilter", "已绑定移出事件");
            return objDef;
          }

          // 绑定移出事件
          eTgt.addEventListener("mouseleave", () => {
            // _log("fnEventFilter", "移出");
            const intLeaveCount = parseInt(eTgt.dataset.leaveCount);
            if (intLeaveCount === 0) {
              // await _sleep(1000);
              eTgt.dataset.leaveCount = "1";
            }
          }, false);

          // 设置初始值
          eTgt.dataset.leaveCount = 0;
        }
      }
      if (pick) {
        return objRlt;
      }
      return objDef;
    };
    // 事件处理函数
    const fnEventHandler = (event) => {
      // 限制鼠标在元素右侧移入才会触发
      if (event.type === "mouseover") {
        const intDiff = Math.abs(event.offsetX - event.target.offsetWidth);
        if (intDiff > 17) {
          return;
        }
      }
      const { $entry, $btn } = fnEventFilter(event.type, event.target);
      if (!$entry || !$btn) {
        return;
      }
      // 判断是否含有指定类名
      if ($entry.className.indexOf("entry--read") === -1) {
        _log("fnMarRead", event.button, "自动标记已读");
        $btn.click();
      }
    };
    // 绑定监听事件
    $n("#root").addEventListener("mouseup", fnEventHandler, false);
    $n("#root").addEventListener("mouseover", fnEventHandler, false);
  })();

  // 防止误点
  const fnStopSource = (e) => {
    const $target = e.target;
    if ($target.classList.contains("entry__source")) {
      // 记录触发次数到 dataset
      const intCount = $target.dataset.clickCount || 0;
      if (intCount === 0) {
        $target.dataset.clickCount = intCount + 1;
        e.preventDefault();
        e.stopPropagation();
        // e.stopImmediatePropagation();
        // alert("entry__source");
        return;
      }
    }
  };

  $n("#root").addEventListener("click", fnStopSource);

})();
