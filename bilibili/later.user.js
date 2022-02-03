// ==UserScript==
// @name         「bilibili」- 稍后再看导出为.url
// @namespace    wdssmq.com
// @version      0.1
// @author       沉冰浮水
// @description  将 B 站的稍后再看列表导出为.url 文件
// @url          https://greasyfork.org/scripts/398415
// ----------------------------
// @link     https://afdian.net/@wdssmq
// @link     https://github.com/wdssmq/userscript
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @include      https://www.bilibili.com/*
// @include      https://t.bilibili.com/*
// @include      https://manga.bilibili.com/account-center*
// @include      https://account.bilibili.com/account/big/myPackage
// @icon         https://www.bilibili.com/favicon.ico
// @run-at       document-end
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM.openInTab

// ==/UserScript==
/* jshint esversion:6 */
(function () {
  "use strict";
  // 基础函数或变量
  const curUrl = window.location.href;
  const $ = window.$ || unsafeWindow.$;
  const curDate = new Date();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const _log = (...args) => console.log('[bilibili-helper]', ...args);
  const _warn = (...args) => console.warn('[bilibili-helper]', ...args);
  const _error = (...args) => console.error('[bilibili-helper]', ...args);
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // cookie 封装
  const ckeObj = {
    setItem: function (key, value) {
      const Days = 137;
      const exp = new Date();
      exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
      document.cookie = key + "=" + encodeURIComponent(value) + ";path=/;domain=.bilibili.com;expires=" + exp.toGMTString();
    },
    getItem: function (key, def = "") {
      const reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
      const arr = document.cookie.match(reg);
      if (arr) {
        return arr[2];
      }
      return def;
    }
  };

  // B 币领取提醒
  (() => {
    const ckeName = "bilibili-helper-bcoin-lstMonth";
    const curMonth = curDate.getMonth() + 1;
    const lstMonth = ckeObj.getItem(ckeName, 0);
    const bcoinUrl = "https://account.bilibili.com/account/big/myPackage";

    // 元素变化监听
    const fnElChange = (el, fn = () => { }) => {
      const observer = new MutationObserver((mutationRecord, mutationObserver) => {
        _log('body attributes changed!!!'); // body attributes changed!!!
        _log('mutationRecord = ', mutationRecord); // [MutationRecord]
        _log('mutationObserver === observer', mutationObserver === observer); // true
        fn(mutationRecord, mutationObserver);
        mutationObserver.disconnect();
      });
      observer.observe(el, {
        // attributes: false,
        // attributeFilter: ["class"],
        childList: true,
        // characterData: false,
        subtree: true,
      });
    }

    // 通知事件封装
    const notify = (title, body) => {
      GM_notification({
        title: title,
        text: body,
        timeout: 0,
        onclick: () => {
          // window.location.href = bcoinUrl;
          GM.openInTab(bcoinUrl, false);
        }
      });
    }

    // 判断是否已经领取过
    const fnCheckByDOM = () => {
      const $bcoin = $n(".bcoin-wrapper");
      _log("---");
      // $bcoin && _log($bcoin.innerHTML);
      if ($bcoin && $bcoin.innerText.includes("本月已领")) {
        ckeObj.setItem(ckeName, curMonth);
        return true;
      } else {
        fnElChange($n("#app"), fnCheckByDOM);
      }
      return false;
    }

    // _log($n("body").innerHTML);
    // _log(lstMonth, curMonth);

    // 对比 ls 数据
    if (lstMonth != curMonth) {
      _log(curUrl, bcoinUrl);
      if (curUrl.indexOf(bcoinUrl) > -1) {
        fnCheckByDOM();
      } else {
        notify("B 币领取提醒", "点击查看 B 币领取情况");
      }
    }
  })();

  // 番剧链接改为我的追番
  (() => {
    document.addEventListener(
      "mouseover",
      function (e) {
        const $ = unsafeWindow.$ || window.$;
        if (!$) {
          return;
        }
        const $pick = $("a[href$='/anime/'],.pick");
        if ($pick.data("uid")) {
          return;
        }
        const uid = ((url) => {
          // _log(url.match(/\d+/));
          if (url) {
            return url.match(/\d+/)[0];
          } else {
            return "";
          }
        })($("a.count-item[href^='//space']").attr("href"));
        _log("用户 uid", uid);
        $pick
          .attr("href", `https://space.bilibili.com/${uid}/bangumi`)
          .data("uid", uid).addClass("pick");
      },
      false
    );
  })();

  // 点击指定元素复制内容
  function fnCopy(eTrig, content) {
    $n(eTrig).addEventListener("click", function (e) {
      GM_setClipboard(content);
      this.style.color = "gray";
    });
  }

  // 构造 Bash Shell 脚本
  function fnMKShell(arrList) {
    const today = new Date(); //获得当前日期
    const year = today.getFullYear(); //获得年份
    const month = today.getMonth() + 1; //此方法获得的月份是从0---11，所以要加1才是当前月份
    const day = today.getDate(); //获得当前日期
    const arrDate = [year, month, day];
    let strRlt =
      'if [ ! -d "bilibili-foldername" ]; then\n' +
      "mkdir bilibili-foldername\n" +
      "fi\n" +
      "cd bilibili-foldername\n";
    strRlt = strRlt.replace(/foldername/g, arrDate.join("-"));
    /**
     * e {title:"",href:""}
     */
    arrList.forEach(function (e, i) {
      const serial = i + 1;
      // _log(e);
      const title = e.title.replace(/\\|\/|:|\*|!|\?]|<|>/g, "");
      const href = e.href || e.url;
      // echo [InternetShortcut] > "*.url"
      // echo "URL=*" >> "*.url"
      strRlt += `echo [InternetShortcut] > "${serial}-${title}.url"\n`;
      strRlt += `echo "URL=${href}" >> "${serial}-${title}.url"\n`;
    });
    strRlt += "exit\n\n";
    // strRlt = strRlt.replace(/\/\/\//g, "//www.bilibili.com/");
    //_log(strRlt);
    return strRlt;
    //$("body").innerHTML = strRlt.replace(/\n/g, "<br/>");
  }

  // Ajax 封装
  function fnGetAjax(callback = function () { }) {
    $.ajax({
      url: "https://api.bilibili.com/x/v2/history/toview/web",
      type: "GET",
      xhrFields: {
        withCredentials: true, // 这里设置了withCredentials
      },
      success: function (data) {
        // _log();
        callback(data.data.list);
      },
      error: function (err) {
        console.error(err);
      },
    });
    // $.get("https://api.bilibili.com/x/v2/history/toview/web", function (data) {
    //   _log(data);
    // });
  }

  // 导出稍后再看为 .lnk 文件
  (function () {
    if (/#\/list|#\/video/g.test(location.href)) {
      fnGetAjax(function (list) {
        const arrRlt = [];
        list.forEach((item, index) => {
          arrRlt.push({
            title: item.title,
            href: `https://www.bilibili.com/video/${item.bvid}`,
            bvid: item.bvid,
          });
          _log(item, index);
        });
        // 注册点击复制
        fnCopy("span.t", fnMKShell(arrRlt));
      });
      return false;
    }
  })();

  // 收藏夹导出为 .lnk 文件
  (function () {
    if (location.hash === "#/my-favourite") {
      let f = 0;
      document.addEventListener(
        "mouseover",
        function (e) {
          if (f) {
            return false;
          }
          let $magList = $na("div.text-info-section a:first-child");
          _log($magList);
          if ($magList.length) {
            f = 1;
            fnCopy(
              "h1.page-title",
              fnMKShell,
              "div.text-info-section a:first-child"
            );
          }
        },
        false
      );
      return false;
    }
  })();

  // 时间轴书签
  (function () {
    function fnGenUrl(url) {
      let more = 0;
      if ($n(".watched.on")) {
        url = $n(".watched.on a").href;
        more = 1;
      }
      if ($n("#multi_page li.on")) {
        url = $n("#multi_page li.on a").href;
        more = 1;
      }
      const $curTime = $n(".bilibili-player-video-time-now");
      // _log("当前时间元素", $curTime);
      _log();
      if ($curTime && $curTime.innerHTML) {
        let strQurey = document.location.search;
        let matchRlt = strQurey.match(/t=(\d+)/);
        let oldTime = matchRlt && matchRlt[1] ? parseInt(matchRlt[1]) : 0;
        _log("上次记录", oldTime);
        if (more) {
          url = url + "&";
        } else {
          url = url.split("?")[0];
        }
        const fnTime = ((str) => {
          const arr = str.split(":");
          if (arr.length === 3) {
            return parseInt(arr[0]) * 3600 + parseInt(arr[1]) * 60 + parseInt(arr[2]);
          } else {
            return fnTime(`0:${str}`);
          }
        });
        let t = fnTime($curTime.innerHTML) - 7;
        _log("已播放", t);
        if (t - oldTime <= 73) {
          return url;
        }
        let title = $n("h1.video-title").title;
        let nURL = `${url}?t=${t}`;
        $n("title").innerHTML = `${title}_${t}_bilibili`;
        //$n("h1.video-title").innerHTML = `<a href="${nURL}" title="${t}">${title}_${t}</a>`;
        window.history.pushState(null, null, nURL);
        return url;
      }
      return url;
    }

    let url = document.location.href.replace("?tdsourcetag=s_pctim_aiomsg", "");
    _log(url);
    document.addEventListener(
      "mouseover",
      function (e) {
        if (
          e.target.nodeName === "DIV" &&
          e.target.className === "bilibili-player-dm-tip-wrap"
        ) {
          // _log(e.target);
          url = fnGenUrl(url);
        }
      },
      false
    );
  })(); // 时间轴书签
})();
