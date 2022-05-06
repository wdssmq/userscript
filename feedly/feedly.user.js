
// ==UserScript==
// @name         「Feedly」- 中键标记已读 + 收藏导出为*.url
// @namespace    https://www.wdssmq.com/
// @version      0.3.6
// @author       沉冰浮水
// @description  新标签页打开条目时自动标记为已读，收藏计数
// ----------------------------
// @raw    https://github.com/wdssmq/userscript/tree/master/feedly
// @raw    https://greasyfork.org/zh-CN/scripts/381793
// ----------------------------
// @link   https://afdian.net/@wdssmq
// @link   https://github.com/wdssmq/userscript
// @link   https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @match        https://feedly.com/*
// @grant        GM_openInTab
// @grant        GM_setClipboard
// ==/UserScript==
/* jshint esversion: 6 */
(function () {
  'use strict';

  const gm_name = "feedly";

  const curDate = new Date();
  // ---------------------------------------------------
  const _curUrl = () => { return window.location.href; };
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
    const objTime = {
      time: 0,
      rem: 0,
    };
    if (fnCheckControl(gob.data.diffStars, objTime) === "lock") {
      $n(".list-entries").style.backgroundColor = "#ddd";
    }
    gob._curStars = fnLaterGetItems(gob);
    const strText = `Read later（${gob._curStars} 丨 -${gob.data.diffStars.decr} 丨 +${gob.data.diffStars.incr}）（${objTime.time} - ${objTime.rem}）`;
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

  fnElChange($n("#box"), fnLaterMain);

  const curTime = Math.floor(curDate.getTime() / 1000);
  const curHours = Math.floor(curTime / 3600);
  // const cur4Hours = Math.floor(curTime / (60 * 60 * 4));
  const cur4Minutes = Math.floor(curTime / 240);

  const fnCheckControl = (diff, objSec = {}) => {
    const iTime = curHours;
    objSec.time = iTime;
    objSec.rem = iTime % 4;
    // 累计已读少于 17 或者累计新增大于累计已读
    if (diff.decr < 17 || diff.incr - diff.decr > 4) {
      return "default";
    }
    // 每 4 小时且累计已读大于累计新增，或者累计新增过大（一般为初始运行时）
    if ((iTime % 4 === 0 && diff.decr - diff.incr > 4) || gob._curStars - diff.incr < 4) {
      return "reset";
    }
    return "lock";
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

    gob.data.lstStars = gob._curStars;

    // 更新 localStorage 存储
    if (diff !== 0 || strReset !== gob.data.bolReset.toString()) {
      gob.save();
    }
  }

  // 按规则给星标条目着色
  function fnColorStars() {
    // _log("fnColorStars", curTime, cur4Minutes);

    const $stars = $na("div.content a");
    let pickCount = 0;
    [].forEach.call($stars, function ($e, i) {
      // _log("fnColorStars", $e, i);
      // _log("fnColorStars", "==============================");

      const href = $e.href;
      const hash = parseInt(href.replace(/\D/g, ""));

      // _log("fnColorStars", href, hash);

      const intNum = parseInt(hash + cur4Minutes + i);
      // const intNum = parseInt(i + cur4Minutes);

      // _log("fnColorStars", intNum, intNum % 4);

      if (intNum % 4 === 0) {
        pickCount++;
        $e.parentNode.parentNode.style.backgroundColor = "#ddd";
      } else {
        $e.parentNode.parentNode.style.backgroundColor = "transparent";
        if (fnCheckControl(gob.data.diffStars) === "lock" || pickCount > 13) {
          // console.log($e.parentNode.parentNode.classList);
          $e.parentNode.parentNode.style.backgroundColor = "#666";
        }
      }
    });
  }

  // 星标文章导出为 *.url 文件
  function fnMKShell($list) {
    const today = new Date(); // 获得当前日期
    const year = today.getFullYear(); // 获得年份
    const month = today.getMonth() + 1; // 此方法获得的月份是从0---11，所以要加1才是当前月份
    const day = today.getDate(); // 获得当前日期
    const arrDate = [year, month, day];
    let strRlt =
      'if [ ! -d "foldername" ]; then\n' +
      "mkdir foldername\n" +
      "fi\n" +
      "cd foldername\n";
    strRlt = strRlt.replace(/foldername/g, "later-" + arrDate.join("-"));
    $list.forEach(function (e, i) {
      // console.log(e);
      let strTitle = `${i}丨`;
      strTitle += e.textContent.replace(/\\|\/|:|\*|!|\?]|<|>/g, "");
      const lenTitle = strTitle.length;
      if (lenTitle >= 155) {
        strTitle = `${i}丨标题过长丨${lenTitle}`;
      }
      let strUrl = e.href;
      // strRlt += `\n#${i} - ${lenTitle}\n`;
      strRlt += 'echo [InternetShortcut] > "' + strTitle + '.url"\n';
      strRlt += 'echo "URL=' + strUrl + '" >> "' + strTitle + '.url"\n';
    });
    strRlt += "exit\n\n";
    strRlt = strRlt.replace(/\/\/\//g, "//www.bilibili.com/");
    //console.log(strRlt);
    return strRlt;
    //$n("body").innerHTML = strRlt.replace(/\n/g, "<br/>");
  }
  $n("#box").addEventListener("mouseup", function (event) {
    if (event.target.innerHTML.indexOf("Read later") > -1) {
      const $el = event.target;
      console.log($el);
      GM_setClipboard(fnMKShell($na("div.content a")));
    }
  }, false);

  // 拿回订阅源地址
  // 绑定监听事件到 div#box 上
  $n("#box").addEventListener("mouseup", function (event) {
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
        `<div class="sub">${curUrl}</div>`
      );
    }
  }, false);

  // 自动标记已读
  (() => {
    if (!$n("#box") || $n("#box").dataset.MarkRead === "bind") {
      return;
    }
    // _log("fnAutoMark", "自动标记已读");
    $n("#box").dataset.MarkRead = "bind";

    // 根据事件返回需要的 dom 元素
    const fnEventFilter = (eType, eTgt) => {
      // _log("fnEventFilter", eType, eTgt);

      let pick = false;
      let objRlt = null, objDef = {
        $entry: null,
        $btn: null
      };
      if (eType === "mouseup") {
        if (
          eTgt.classList.contains("entry__title") && eTgt.nodeName === "A"
        ) {
          objRlt = {
            // 当前条目元素
            $entry: eTgt.parentNode.parentNode,
            // 标记已读的按钮
            $btn: eTgt.parentNode.querySelector("button.EntryMarkAsReadButton")
          };
          pick = true;
        }
      } else if (eType === "mouseover") {
        if (eTgt.nodeName === "ARTICLE" && eTgt.className.indexOf("entry") > -1) {
          objRlt = {
            // 当前内容条目元素
            $entry: eTgt,
            // 标记已读的按钮
            $btn: eTgt.querySelector("button.EntryMarkAsReadButton")
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
    $n("#box").addEventListener("mouseup", fnEventHandler, false);
    $n("#box").addEventListener("mouseover", fnEventHandler, false);
  })();

})();
