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
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
  function addEvent(element, evnt, funct) {
    return element.addEventListener(evnt, funct, false);
  }
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const _log = (...args) => console.log("[feedly-helper]", ...args);
  const _warn = (...args) => console.warn("[feedly-helper]", ...args);
  const _error = (...args) => console.error("[feedly-helper]", ...args);

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
    resetLocked: true,
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
      this.resetLocked = lsObj.getItem("resetLocked", true);
      _log("load", gob);
    },
    // 保存
    save: function () {
      lsObj.setItem("lstStars", this.lstStars);
      lsObj.setItem("diffStars", this.diffStars);
      lsObj.setItem("resetLocked", this.resetLocked);
      _log("save", gob);
    },
  };

  // 拿回订阅源地址
  // 绑定监听事件到 div#box 上
  addEvent($n("#box"), "mouseup", function (event) {
    // 输出触发事件的元素
    console.log(event.target);
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
      })(decodeURIComponent(location.href));
      // 输出到页面中
      $n("#feedlyPageFX h2").insertAdjacentHTML(
        "beforeend",
        `<div class="sub">${curUrl}</div>`
      );
    }
  });

  // 星标文章导出为 *.url 文件
  function fnMKShell($list) {
    const today = new Date(); //获得当前日期
    const year = today.getFullYear(); //获得年份
    const month = today.getMonth() + 1; //此方法获得的月份是从0---11，所以要加1才是当前月份
    const day = today.getDate(); //获得当前日期
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
  addEvent($n("#box"), "mouseup", function (event) {
    if (event.target.innerHTML.indexOf("Read later") > -1) {
      const $el = event.target;
      console.log($el);
      fnOnScroll();
      GM_setClipboard(fnMKShell($na("div.content a")));
    }
  });

  // 加载完成后执行
  window.onload = function () {
    fnOnScroll();
    $n("#box").addEventListener("mouseover", fnOnScroll, false);
  };

  // 星标计数触发和更新
  async function fnOnScroll() {
    await sleep(3000);
    // 判断页面地址
    if ("https://feedly.com/i/saved" !== location.href) {
      return;
    }
    $n("#box").removeEventListener("mouseover", fnOnScroll, false);
    // 一屏能显示时直接触发一次
    if ($n(".list-entries > h2")) {
      gob.curStars = $na("div.content a").length;
      fnLaterControl();
      fnViewStarts();
      fnColorStars();
      _log("fnOnScroll", "星标计数触发");
    } else {
      fnOnScroll();
      _log("fnOnScroll", "页面加载中");
    }
    // 滚动条滚动时触发
    if ($n("#feedlyFrame") && $n("#feedlyFrame").dataset.addEL !== "done") {
      $n("#feedlyFrame").dataset.addEL = "done";
      $n("#feedlyFrame").addEventListener("scroll", fnViewStarts);
      _log("fnOnScroll", "列表滚动监听");
    }
  }

  // 收藏数 View
  function fnViewStarts() {
    const strText = `Read later（${gob.curStars} 丨 -${gob.diffStars.decr} 丨 +${gob.diffStars.incr}）`;
    $n("h1 #header-title").innerHTML = strText;
    $n("h2.Heading").innerHTML = strText;
    $n("#header-title").innerHTML = strText;
  }

  // 星标变动控制
  function fnLaterControl() {
    if (gob.curStars == 0 || gob.loaded) {
      return;
    }
    gob.load();

    // 星标变化计数
    const diff = gob.curStars - gob.lstStars;

    // 记录相等时不触发
    if (diff === 0) {
      return;
    }

    // 大于上一次记录
    if (diff > 0) {
      // 新增星标计数
      gob.diffStars.incr += Math.abs(diff);
    } else {
      // 已读星标计数
      gob.diffStars.decr += Math.abs(diff);
    }

    // 解锁重置判断
    if (!gob.resetLocked) {
      gob.diffStars.decr = 0;
      gob.diffStars.incr = 0;
    }

    // 更新 localStorage 存储
    gob.resetLocked =
      gob.diffStars.decr - gob.diffStars.incr >= 4 ? false : true;
    // gob.resetLocked = gob.diffStars.decr >= 7 ? false : true;
    gob.lstStars = gob.curStars;
    gob.save();
  }

  // 按规则给星标条目着色
  function fnColorStars() {
    const curTime = Math.floor(new Date().getTime() / 1000);
    // const curDays = Math.floor(curTime / 86400);
    const cur4Minutes = Math.floor(curTime / 240);
    // _log("fnColorStars", curTime, cur4Minutes);
    const $stars = $na("div.content a");
    [].forEach.call($stars, function ($e, i) {
      // _log("fnColorStars", $e, i);
      // _log("fnColorStars", "==============================");
      const href = $e.href;
      const hash = parseInt(href.replace(/\D/g, ""));
      // _log("fnColorStars", href, hash);
      const intNum = parseInt(hash + cur4Minutes);
      // const intNum = parseInt(i + cur4Minutes);

      if (intNum % 4 === 0) {
        $e.parentNode.parentNode.style.backgroundColor = "#ddd";
      }
    });
  }

  // 自动标记已读
  let opt1 = 0;
  addEvent($n("#box"), "mouseover", function (event) {
    if (
      event.target.className === "link entry__title" &&
      event.target.nodeName === "A"
    ) {
      console.log(event.target);
      const $btn = event.target.parentNode.querySelector(
        ".EntryMarkAsReadButton"
      );
      // if ($btn.title === "Mark as read") {
      console.log($btn.title);
      console.log("自动标记已读");
      $btn.click();
      // }
      if (event.button !== 1 && opt1) {
        GM_openInTab(event.target.href, true);
      }
    }
  });

  return;
})();
