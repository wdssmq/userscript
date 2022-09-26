// ==UserScript==
// @name         「Feedly」中键标记已读 + 收藏导出为*.url
// @namespace    https://www.wdssmq.com/
// @version      0.3.7
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
  const gob = {
    // 非 ls 字段
    _loaded: false,
    _curStars: 0,
    _time: {
      cycle: 0,
      rem: 0,
    },
    // ls 字段
    data: {
      bolReset: false,
      lstStars: 0,
      diffStars: { decr: 0, incr: 0 },
      // decrease 减少
      // increase 增加
    },
    // 读取
    load: function () {
      if (this._loaded) {
        return;
      }
      this._loaded = true;
      this.data = lsObj.getItem("feedly_bld_data", this.data);
      _log("load", gob);
    },
    // 保存
    save: function () {
      lsObj.setItem("feedly_bld_data", this.data);
      _log("save", gob);
    },
  };

  // 判断当前地址是否是收藏页
  const fnCheckUrl = () => {
    if ("https://feedly.com/i/saved" === _curUrl()) {
      return true;
    }
    return false;
  };

  // 当前星标数获取
  function fnLaterGetItems(obj) {
    const $listWrap = $n("div.list-entries");
    if ($listWrap) {
      obj.$list = $listWrap.querySelectorAll("div.content a");
      return obj.$list.length;
    }
    return 0;
  }

  // 收藏数 View
  function fnLaterViewStars() {
    gob._curStars = fnLaterGetItems(gob);
    const strText = `Read later（${gob._curStars} 丨 -${gob.data.diffStars.decr} 丨 +${gob.data.diffStars.incr}）（${gob._time.cycle} - ${gob._time.rem}）`;
    $n("h1 #header-title").innerHTML = strText;
    if ($n("header.header h2")) {
      $n("header.header h2").innerHTML = strText;
    }
    $n("#header-title").innerHTML = strText;
  }

  // 滚动条滚动时触发
  function fnLaterOnScroll() {
    if (!fnCheckUrl()) {
      return;
    }
    fnLaterViewStars();
    fnColorStars();
    // 全部条目加载后执行
    if ($n(".list-entries > h2")) {
      !gob._loaded && _log("fnLaterOnScroll", "页面加载完成");
      fnLaterControl();
    } else {
      _log("fnLaterOnScroll", "页面加载中");
    }
  }

  // 星标部分入口函数
  function fnLaterMain(record, observer) {
    if (!fnCheckUrl()) {
      return;
    }
    // 随机直接返回
    if (Math.random() > 0.4) {
      return;
    }
    gob._curStars = fnLaterGetItems(gob);
    if (gob._curStars === 0) {
      return;
    }
    // observer.disconnect();
    // 绑定事件
    if ($n("#feedlyFrame") && $n("#feedlyFrame").dataset.addEL !== "done") {
      fnLaterOnScroll();
      $n("#feedlyFrame").addEventListener("scroll", fnLaterOnScroll);
      $n("#feedlyFrame").dataset.addEL = "done";
      _log("fnLaterMain", "绑定滚动监听");
    }
  }

  fnElChange($n("#root"), fnLaterMain);

  const curTime = Math.floor(curDate.getTime() / 1000);
  const curHours = Math.floor(curTime / 3600);
  // const cur4Hours = Math.floor(curTime / (60 * 60 * 4));
  const cur4Minutes = Math.floor(curTime / 240);

  const fnCheckControl = (diff) => {
    const iTime = curHours;
    const modTime = iTime % 4;
    gob._time.cycle = iTime;
    gob._time.rem = modTime;
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
  function fnLaterControl() {
    if (gob._loaded) {
      return;
    }
    gob.load();

    // 解锁重置判断
    if (gob.data.bolReset) {
      gob.data.diffStars.decr = 0;
      gob.data.diffStars.incr = 0;
    }

    // 星标变化计数
    const diff = gob._curStars - gob.data.lstStars;

    // 写入新的星标数
    gob.data.lstStars = gob._curStars;

    // 初始化时直接返回
    if (diff === gob._curStars) {
      gob.save();
      return;
    }

    // 大于上一次记录
    if (diff > 0) {
      // 新增星标计数
      gob.data.diffStars.incr += Math.abs(diff);
    } else {
      // 已读星标计数
      gob.data.diffStars.decr += Math.abs(diff);
    }

    // 记录变量原始值
    const strReset = gob.data.bolReset.toString();

    // _log("fnLaterControl", strReset);

    gob.data.bolReset = ((diff) => {
      if (fnCheckControl(diff) === "reset") {
        return true;
      }
      return false;
    })(gob.data.diffStars);

    // 更新 localStorage 存储
    if (diff !== 0 || strReset !== gob.data.bolReset.toString()) {
      gob.save();
    }
  }

  // 按规则给星标条目着色
  function fnColorStars(offset = 0) {
    // _log("fnColorStars", curTime, cur4Minutes);

    const $stars = gob.$list;
    const isLock = "lock" === fnCheckControl(gob.data.diffStars) ? true : false;
    // if (isLock) {
    //   $n(".list-entries").style.backgroundColor = "#666";
    // }
    let pickCount = 0;
    const oConfig = {
      forMod: 13,
      minPick: 4,
      maxPick: 7,
    };
    // _log("fnColorStars", "isLock", isLock);
    [].forEach.call($stars, function ($e, i) {
      // _log("fnColorStars", $e, i);
      // _log("fnColorStars", "==============================");

      const $ago = fnFindDomUp($e, ".ago", 2);
      const href = $e.href + $ago.innerHTML;
      const hash = parseInt(href.replace(/\D/g, ""));

      // _log("fnColorStars", href, hash);

      let intNum = parseInt(hash + cur4Minutes);
      const $parent = $e.parentNode.parentNode;
      // pickCount <= oConfig.maxPick

      if (intNum % oConfig.forMod <= offset && i < 37) {
        // _log("fnColorStars", intNum, intNum % 4);
        pickCount++;
        $parent.style.backgroundColor = "#ddd";
      } else {
        $parent.style.backgroundColor = "transparent";
        let styleColor = "";
        // 符合条件时设置为透明
        if (isLock || i >= 37) {
          styleColor = "transparent";
        }
        $parent.style.color = $e.style.color = styleColor;
        [].forEach.call(fnFindDom($parent, "a, span, div>svg, .summary"), function ($item) {
          // _log("fnColorStars", $item);
          // $item.style.backgroundColor = styleColor;
          $item.style.color = styleColor;
        });
      }
    });
    if (pickCount < oConfig.minPick && offset < oConfig.forMod) {
      fnColorStars(offset + 1);
    }
  }

  /* global GM_setClipboard:true */

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

})();
