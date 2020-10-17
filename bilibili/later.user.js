// ==UserScript==
// @name         [bilibili]稍后再看导出为.url
// @namespace    wdssmq.com
// @version      0.1
// @description  将B站的稍后再看列表导出为.url文件
// @author       沉冰浮水
// @url          https://greasyfork.org/scripts/398415
// @include      https://www.bilibili.com/watchlater/*
// @include      https://www.bilibili.com/video/av*
// @include      https://www.bilibili.com/video/BV*
// @include      https://www.bilibili.com/bangumi/play/ep*
// @include      https://manga.bilibili.com/account-center*
// @icon         https://www.bilibili.com/favicon.ico
// @run-at       document-end
// @grant        GM_setClipboard

// ==/UserScript==
/* jshint esversion:6 */
(function () {
  "use strict";
  const $ = unsafeWindow.jQuery;
  //const pic = unsafeWindow.__INITIAL_STATE__.videoData.pic;
  //if (pic){
  //console.log(pic);
  //}
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
  function fnCopy(eTrig, content) {
    $n(eTrig).addEventListener("click", function (e) {
      GM_setClipboard(content);
      this.style.color = "gray";
    });
  }
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
      // console.log(e);
      const title = e.title.replace(/\\|\/|:|\*|!|\?]|<|>/g, "");
      const href = e.href || e.url;
      // echo [InternetShortcut] > "*.url"
      // echo "URL=*" >> "*.url"
      strRlt += `echo [InternetShortcut] > "${serial}-${title}.url"\n`;
      strRlt += `echo "URL=${href}" >> "${serial}-${title}.url"\n`;
    });
    strRlt += "exit\n\n";
    // strRlt = strRlt.replace(/\/\/\//g, "//www.bilibili.com/");
    //console.log(strRlt);
    return strRlt;
    //$("body").innerHTML = strRlt.replace(/\n/g, "<br/>");
  }
  function fnGetAjax(callback = function () {}) {
    $.ajax({
      url: "https://api.bilibili.com/x/v2/history/toview/web",
      type: "GET",
      xhrFields: {
        withCredentials: true, // 这里设置了withCredentials
      },
      success: function (data) {
        // console.log();
        callback(data.data.list);
      },
      error: function (err) {
        console.error(err);
      },
    });
    // $.get("https://api.bilibili.com/x/v2/history/toview/web", function (data) {
    //   console.log(data);
    // });
  }
  (function () {
    // 导出稍后再看
    if (/#\/list|#\/video/g.test(location.href)) {
      fnGetAjax(function (list) {
        const arrRlt = [];
        list.forEach((item, index) => {
          arrRlt.push({
            title: item.title,
            href: `https://www.bilibili.com/video/${item.bvid}`,
            bvid: item.bvid,
          });
          console.log(item, index);
        });
        // 注册点击复制
        fnCopy("span.t", fnMKShell(arrRlt));
      });
      return false;
    }
  })();
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
          console.log($magList);
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
  function fnGenUrl(url) {
    let more = 0;
    if ($n(".watched.on")) {
      url = $n(".watched.on a").href;
      more = 1;
    }
    // console.log(more);
    // console.log($n(".bilibili-player-video-time-now"));
    if ($n(".bilibili-player-video-time-now")) {
      let strQurey = document.location.search;
      let matchRlt = strQurey.match(/t=(\d+)/);
      //console.log(matchRlt);
      let oldTime = matchRlt && matchRlt[1] ? parseInt(matchRlt[1]) : 0;
      if (more) {
        url = url + "&";
      } else {
        url = url.split("?")[0] + "?";
      }
      let arrTime = $n(".bilibili-player-video-time-now").innerText.split(":");
      let t = parseInt(arrTime[0]) * 60 + parseInt(arrTime[1]) - 7;
      console.log(oldTime,t);
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
  (function () {
    let url = document.location.href.replace("?tdsourcetag=s_pctim_aiomsg", "");
    console.log(url);
    document.addEventListener(
      "mouseover",
      function (e) {
        // console.log(
        // e.target,
        // e.target.nodeName,
        // e.target.className || "class为空"
        // );
        // 实际代码
        if (e.target.nodeName === "DIV" && e.target.className === "bilibili-player-dm-tip-wrap") {
          console.log(e.target);
          url = fnGenUrl(url);
        }
      },
      false
    );
  })();
})();
