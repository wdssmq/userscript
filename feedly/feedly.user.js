// ==UserScript==
// @name         「Feedly」- 中键标记已读 + 收藏导出为*.url
// @namespace    https://www.wdssmq.com/
// @author       沉冰浮水
// @version      0.3.5
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
  "use strict";
  // 基础函数或变量
  const curUrl = window.location.href;
  const curDate = new Date();
  // const $ = window.$ || unsafeWindow.$;
  const _curUrl = () => { return window.location.href; };
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const _log = (...args) => console.log("[Feedly]\n", ...args);
  const _warn = (...args) => console.warn("[Feedly]\n", ...args);
  const _error = (...args) => console.error("[Feedly]\n", ...args);
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // 附加函数
  function fnRmovoDOM(el) {
    el.parentNode.removeChild(el);
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

  const gob = {
    // 非 ls 字段
    loaded: false,
    curStars: 0,
    // ls 字段
    bolReset: false,
    lstStars: 0,
    diffStars: { decr: 0, incr: 0 },
    // 读取
    load: function () {
      if (this.loaded) {
        return;
      }
      this.loaded = true;
      this.lstStars = lsObj.getItem("lstStars", 0);
      // decrease 减少
      // increase 增加
      this.diffStars = lsObj.getItem("diffStars", this.diffStars);
      this.bolReset = lsObj.getItem("bolReset", false);
      _log("load", gob);
    },
    // 保存
    save: function () {
      lsObj.setItem("lstStars", this.lstStars);
      lsObj.setItem("diffStars", this.diffStars);
      lsObj.setItem("bolReset", this.bolReset);
      _log("save", gob);
    },
  };

  // 拿回订阅源地址
  // 绑定监听事件到 div#box 上
  $n("#box").addEventListener("mouseup", function (event) {
    // 输出触发事件的元素
    // _log("105",event.target);
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
      fnOnScroll();
      GM_setClipboard(fnMKShell($na("div.content a")));
    }
  }, false);

  // 加载完成后执行
  window.onload = function () {
    $n("#box").addEventListener("mouseover", fnOnScroll, false);
    fnOnScroll();
  };

  // 星标计数触发和更新
  async function fnOnScroll(event = null) {
    // 判断页面地址
    if ("https://feedly.com/i/saved" !== _curUrl()) {
      return;
    }
    if (event !== null && $n("#box").dataset.OnScroll === "remove") {
      _log("fnOnScroll", $n("#box").dataset.OnScroll);
      return;
    } else {
      $n("#box").dataset.OnScroll = "remove";
      $n("#box").removeEventListener("mouseover", fnOnScroll, false);
    }
    await _sleep(3000);
    // 全部条目加载后执行
    if ($n(".list-entries > h2")) {
      gob.curStars = $na("div.content a").length;
      fnLaterControl();
      fnViewStars();
      fnColorStars();
      _log("fnOnScroll", "星标计数触发");
    } else {
      fnOnScroll();
      _log("fnOnScroll", "页面加载中");
    }
    // 滚动条滚动时触发
    if ($n("#feedlyFrame") && $n("#feedlyFrame").dataset.addEL !== "done") {
      $n("#feedlyFrame").dataset.addEL = "done";
      $n("#feedlyFrame").addEventListener("scroll", fnViewStars);
      _log("fnOnScroll", "列表滚动监听");
    }
  }

  // 收藏数 View
  function fnViewStars() {
    const objTime = {
      time: 0,
      rem: 0,
    };
    if (fnCheckControl(gob.diffStars.decr, objTime) === "lock") {
      $n(".list-entries").style.backgroundColor = "#ccc";
    }
    const strText = `Read later（${gob.curStars} 丨 -${gob.diffStars.decr} 丨 +${gob.diffStars.incr}）（${objTime.time} - ${objTime.rem}）`;
    $n("h1 #header-title").innerHTML = strText;
    $n("h2.Heading").innerHTML = strText;
    $n("#header-title").innerHTML = strText;
  }

  const curTime = Math.floor(curDate.getTime() / 1000);
  const curHours = Math.floor(curTime / 3600);
  // const cur4Hours = Math.floor(curTime / (60 * 60 * 4));
  const cur4Minutes = Math.floor(curTime / 240);

  const fnCheckControl = (iRead, objSec = {}) => {
    const iTime = curHours;
    objSec.time = iTime;
    objSec.rem = iTime % 4;
    if (iRead < 17) {
      return "default";
    }
    if (iTime % 4 === 0) {
      return "reset";
    } else {
      return "lock";
    }
  };

  // 星标变动控制
  function fnLaterControl() {
    if (gob.loaded) {
      return;
    }
    gob.load();

    // 解锁重置判断
    if (gob.bolReset) {
      gob.diffStars.decr = 0;
      gob.diffStars.incr = gob.curStars;
    }

    // 星标变化计数
    const diff = gob.curStars - gob.lstStars;

    // 大于上一次记录
    if (diff > 0) {
      // 新增星标计数
      gob.diffStars.incr += Math.abs(diff);
    } else {
      // 已读星标计数
      gob.diffStars.decr += Math.abs(diff);
    }

    // 记录变量原始值
    const strReset = gob.bolReset.toString();

    // _log("fnLaterControl", strReset);

    gob.bolReset = ((iRead) => {
      if (fnCheckControl(iRead) === "reset") {
        return true;
      }
      return false;
    })(gob.diffStars.decr);

    gob.lstStars = gob.curStars;

    // 更新 localStorage 存储
    if (diff !== 0 || strReset !== gob.bolReset.toString()) {
      gob.save();
    }
  }

  // 按规则给星标条目着色
  function fnColorStars() {
    // _log("fnColorStars", curTime, cur4Minutes);

    const $stars = $na("div.content a");
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
        $e.parentNode.parentNode.style.backgroundColor = "#ddd";
      }
    });
  }

  // 自动标记已读
  (() => {
    if (!$n("#box") || $n("#box").dataset.AutoMark === "bind") {
      return;
    }
    $n("#box").dataset.AutoMark = "bind";
    $n("#box").addEventListener("mouseup", function (event) {
      if (
        event.target.className === "link entry__title" &&
        event.target.nodeName === "A"
      ) {
        // 当前条目元素
        const $entry = fnFindDomUp(event.target, ".entry", 2);
        // 标记已读的按钮
        const $btn = event.target.parentNode.querySelector(
          ".EntryMarkAsReadButton"
        );

        // _log("fnMarkRead", event.target);
        // _log("fnMarkRead", $entry, $entry.className);

        // 判断是否含有指定类名
        if ($entry.className.indexOf("entry--read") > -1) {
          return;
        }
        if ($btn) {
          _log(event.button, "自动标记已读");
          $btn.click();
        }
      }
    }, false);
  })();

  return;
})();
