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
    loaded: false,
    curStars: 0,
    lstStars: 0,
    diffStars: 0,
    load: function (lstDef = 0) {
      if (this.loaded) {
        return;
      }
      this.loaded = true;
      this.lstStars = lsObj.getItem("lstStars", lstDef);
      this.diffStars = lsObj.getItem("diffStars", 0);
    },
    save: function () {
      lsObj.setItem("lstStars", this.lstStars);
      lsObj.setItem("diffStars", this.diffStars);
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
  window.onload = async function () {
    do {
      fnOnScroll();
      console.log("waiting…… fnOnScroll");
      await sleep(3000);
    } while (gob.curStars == 0);
    do {
      fnLaterControl();
      console.log("waiting…… fnLaterControl");
      await sleep(3000);
    } while (gob.lstStars == 0);
  };

  // 星标计数触发和更新
  function fnOnScroll() {
    // 一屏能显示时直接触发一次
    if ($n(".list-entries > h2")) {
      fnCountStarts();
    }
    // 滚动条滚动时触发
    if ($n("#feedlyFrame") && $n("#feedlyFrame").dataset.addEL !== "done") {
      $n("#feedlyFrame").dataset.addEL = "done";
      $n("#feedlyFrame").addEventListener("scroll", fnCountStarts);
      console.log("计数事件监听 - 启用成功");
      return true;
    }
    console.log("计数事件监听 - 页面加载中");
    return false;
  }

  // 星标计数
  function fnCountStarts() {
    console.log(location.href);
    if ("https://feedly.com/i/saved" == location.href) {
      let intCount = $na("div.content a").length,
        strText = `Read later（${intCount} - ${gob.diffStars}）`;
      $n("h1 #header-title").innerHTML = strText;
      $n("h2.Heading").innerHTML = strText;
      $n("#header-title").innerHTML = strText;
      gob.curStars = intCount;
    }
  }

  // 星标变动控制
  function fnLaterControl() {
    if (gob.curStars == 0 || gob.loaded) {
      return;
    }
    gob.load(gob.curStars);
    console.log(gob);
    // 星标变化计数；正数减少，负数增加
    const diff = gob.lstStars - gob.curStars;
    gob.diffStars += diff;
    // 更新 localStorage 存储
    gob.lstStars = gob.curStars;
    gob.save();
  }

  // 自动标记已读
  let opt1 = 0;
  addEvent($n("#box"), "mouseup", function (event) {
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
