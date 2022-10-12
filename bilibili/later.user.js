// ==UserScript==
// @name         「bilibili」大会员 B 币领取提醒
// @namespace    wdssmq.com
// @version      0.4
// @author       沉冰浮水
// @description  B 币领取提醒、稍后再看列表导出为 *.url 等
// @url          https://greasyfork.org/scripts/398415
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @include      https://www.bilibili.com/*
// @include      https://t.bilibili.com/*
// @include      https://manga.bilibili.com/account-center*
// @include      https://account.bilibili.com/account/big/myPackage
// @match        https://space.bilibili.com/44744006/fans/follow*
// @icon         https://www.bilibili.com/favicon.ico
// @noframes
// @run-at       document-end
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM.openInTab
// ==/UserScript==

/* jshint esversion: 6 */
/* eslint-disable */

(function () {
  'use strict';

  const gm_name = "later";

  /* global GM_setClipboard */

  // 初始常量或函数
  const curUrl = window.location.href;
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

  // 添加内容到指定元素后面
  function fnAfter($ne, e) {
    const $e = typeof e === "string" ? $n(e) : e;
    $e.parentNode.insertBefore($ne, $e.nextSibling);
  }

  // ---------------------------------------------------

  // 元素变化监听
  const fnElChange = (el, fn = () => { }, onetime = true) => {
    const observer = new MutationObserver((mutationRecord, mutationObserver) => {
      // _log('mutationRecord = ', mutationRecord);
      // _log('mutationObserver === observer', mutationObserver === observer);
      fn(mutationRecord, mutationObserver);
      if (onetime) {
        mutationObserver.disconnect(); // 取消监听，正常应该在回调函数中根据条件决定是否取消
      }
    });
    observer.observe(el, {
      // attributes: false,
      // attributeFilter: ["class"],
      childList: true,
      // characterData: false,
      subtree: true,
    });
  };

  // 点击指定元素复制内容
  function fnCopy(eTrig, content, fnCB = () => { }) {
    $n(eTrig).addEventListener("click", function (e) {
      GM_setClipboard(content);
      fnCB(e);
      this.style.color = "gray";
    });
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
        return decodeURIComponent(arr[2]);
      }
      return def;
    },
  };

  /* global GM_notification GM */

  // 日期转字符串
  const getDateStr = (date) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("zh-CN", options);
  };

  // 判断日期间隔
  const diffDateDays = (date1, date2) => {
    const diff = date1.getTime() - date2.getTime();
    return diff / (1000 * 60 * 60 * 24);
  };

  // B 币领取提醒
  (() => {
    const ckeName = "bilibili-helper-bcoin-nxtDateStr";
    const curDateStr = getDateStr(curDate);
    const nxtDateStr = ckeObj.getItem(ckeName, curDateStr);
    const bcoinUrl = "https://account.bilibili.com/account/big/myPackage";

    _log(`当前日期: ${curDateStr}`);
    _log(`下次领取: ${nxtDateStr}`);

    // 通知事件封装
    const notify = (title, body) => {
      _log(`通知标题: ${title}`);
      GM_notification({
        title: title,
        text: body,
        timeout: 0,
        onclick: () => {
          // window.location.href = bcoinUrl;
          GM.openInTab(bcoinUrl, false);
        },
      });
    };

    // 判断是否已经领取过
    const fnCheckByDOM = () => {
      const $bcoin = $n(".bcoin-wrapper");
      // _log("fnCheckByDOM", $bcoin);
      // $bcoin && _log("fnCheckByDOM", $bcoin.innerHTML);
      if ($bcoin && $bcoin.innerText.includes("本次已领")) {
        const match = $bcoin.innerText.match(/\d{4}\/\d+\/\d+/);
        if (match && match[0] !== nxtDateStr) {
          ckeObj.setItem(ckeName, match[0]);
          _log("已领取过，更新下次领取日期", match[0]);
          return true;
        }
      } else {
        fnElChange($n("body"), fnCheckByDOM);
      }
      return false;
    };

    // _log($n("body").innerHTML);
    // _log(nxtDateStr, curMonth);

    // 对比日期
    const iniDiff = diffDateDays(curDate, new Date(nxtDateStr));
    if (iniDiff > 0) {
      _log(curUrl, "\n", bcoinUrl);
      if (curUrl.indexOf(bcoinUrl) > -1) {
        fnCheckByDOM();
      } else {
        notify("B 币领取提醒", "点击查看 B 币领取情况");
      }
    }
  })();

  // 番剧链接改为我的追番
  (() => {
    let isDone = false;
    // 获取 uid
    const getUidByUrlOrCookie = (url) => {
      let uid = null;
      const match = url.match(/\d+/);
      if (match) {
        uid = match[0];
        ckeObj.setItem("bilibili-helper-uid", uid);
      } else {
        uid = ckeObj.getItem("bilibili-helper-uid");
      }
      return uid;
    };
    // 更新链接
    const fnCheckByDOM = () => {
      if (!isDone) {
        fnElChange($n("body"), fnCheckByDOM);
      }
      const $pick = $n("a[href$='/anime/']");
      // const $pick2 = $n("a[href^='//space']");
      const $pick2 = $n("a.header-entry-avatar");
      // _log($pick, $pick2);

      let usrUrl = $pick2 ? $pick2.href : "";
      const uid = getUidByUrlOrCookie(usrUrl);
      if (!$pick || !uid) {
        return;
      }
      const url = `https://space.bilibili.com/${uid}/bangumi`;
      $pick.href = url;
      _log("番剧链接改为我的追番", url);
      isDone = true;
    };
    fnCheckByDOM();
  })();

  /* global GM_notification $ */

  _log("_later2url.js", "开始");

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
  }

  // 导出稍后再看为 .lnk 文件
  (function () {
    if (/#\/list|#\/video/g.test(location.href)) {
      let tmpHTML = $("span.t").html();
      fnGetAjax(function (list) {
        const arrRlt = [];
        list.forEach((item, index) => {
          arrRlt.push({
            title: item.title,
            href: `https://www.bilibili.com/video/${item.bvid}`,
            bvid: item.bvid,
          });
          // _log(item, index);
        });
        // _log("稍后再看", arrRlt.length);
        tmpHTML = tmpHTML.replace(/0\//g, arrRlt.length + "/");
        $("span.t").html(tmpHTML + "「点击这里复制 bash shell 命令」");
        let appCon = "「已复制」";
        if (arrRlt.length > 37) {
          appCon = "「已复制，数量过多建议保存为 .sh 文件执行」";
        }
        // 注册点击复制
        fnCopy("span.t", fnMKShell(arrRlt, "bilibili"), () => {
          $("span.t").html(tmpHTML + appCon);
        });
      });
      return false;
    }
  })();

  _log("_later2url.js", "结束");

  // 关注列表增强
  (() => {
    const gob = {
      done: false,
      _rssUrl: (uid) => {
        let RSSHub = localStorage.RSSHub ? localStorage.RSSHub : "https://rsshub.app/bilibili/user/video/:uid/";
        localStorage.RSSHub = RSSHub;
        return RSSHub.replace(":uid", uid);
      },
    };
    // 获取关注列表
    const fnGetFollowList = () => {
      let $list = $na("li.list-item");
      return $list;
    };

    // 针对每个关注列表项
    const fnUpView = ($up) => {
      const url = $up.querySelector("a.cover").href;
      const name = $up.querySelector("span.fans-name").innerText;

      const { uid, uname } = ((url, name) => {
        const uid = url.match(/\/(\d+)\/$/)[1];
        let uname = name.replace(/\b/g, "_").replace(/_+/g, "_");
        uname = uname.replace(/^_|_$/g, "");
        // _log(`${uid} ${uname}`);
        return { uid, uname };
      })(url, name);

      const $desc = $up.querySelector("p.auth-description") || $up.querySelector("p.desc");
      if ($desc && $desc.dataset.fnUpView === "done") {
        return;
      }
      $desc.dataset.fnUpView = "done";
      // _log($desc);

      // 创建新 p 元素
      const $p = document.createElement("p");
      const RSSUrl = gob._rssUrl(uid);
      $p.className = "desc";
      $p.innerHTML = `
    <hr>
    <a href="${RSSUrl}" target="_blank">「RSS」</a> |
    ${uid} ${uname}
    `;

      fnAfter($p, $desc);
    };

    // 页面元素更新监听
    const fnCheckByDOM = () => {
      const $ul = $n("ul.relation-list");
      const $list = fnGetFollowList();
      if ($list.length > 0 && !$ul.dataset.fnCheckByDOM !== "done") {
        $ul.dataset.fnCheckByDOM = "done";
        _log("$list.length = ", $list.length);
        // nodeList to array
        const $listArr = Array.from($list);
        $listArr.forEach(($li) => {
          fnUpView($li);
        });
      }
      fnElChange($n("body"), fnCheckByDOM);
    };
    fnCheckByDOM();

  })();

  // 姑且引入一些大概会用到的函数 ↑

  const $body = $n("body");

  // 设置一个标记
  let isDone = false;

  // 用来实现实际功能的函数
  const fnMain = () => {
    // 视频播放时页面一直在变化，所以这里会一直调用
    _warn("_cover => fnMain");
    const $listCover = $na(".header-history-video__image");
    // isDone 则控制这里只执行一次
    if ($listCover.length > 0 && !isDone) {
      isDone = true;
      Array.from($listCover).forEach(($cover, index) => {
        // _warn(`.header-history-video__image[${index}] = `, $cover);
        // _warn("---");
        const $coverImg = $cover.querySelector("img");
        const $coverSource = $cover.querySelector("source");
        // src 或 srcset 属性
        let imgUrl = $coverImg.src;
        let imgSrcset = $coverSource.getAttribute("srcset");
        _warn("imgUrl = ", imgUrl);
        _warn("imgSrcset = ", imgSrcset);
        // 使用正则替换去除后边的内容
        imgUrl = imgUrl.replace(/@.+$/, "");
        imgSrcset = imgSrcset.replace(/@.+$/, "");
        // 设置回去
        $coverImg.src = imgUrl;
        $coverSource.setAttribute("srcset", imgSrcset);
      });
    }
  };
  // 当页面内容产生变化时，触发函数 fnMain
  fnElChange($body, fnMain, false);

  // 时间轴书签

  const gob = {
    lstTime: 0,
    curTime: 0,
    title: "",
  };

  const fnUpTitle = (time) => {
    if (gob.title === "") {
      gob.title = $n("h1.video-title").innerHTML;
    }
    $n("title").innerHTML = `${gob.title}_${time}_bilibili`;
    // debug
    _warn(`title: ${gob.title}_${time}_bilibili`);
  };

  const fnUpUrl = (time) => {
    let url = _curUrl();
    let urlNew = url;
    // 清理参数
    url = url.split("?")[0];
    // 拼接参数
    urlNew = `${url}?t=${time}`;
    window.history.pushState(null, null, urlNew);
    // debug
    _warn(`url: ${urlNew}`);
  };

  const fnGetTime = () => {
    const $timLabel = $n(".bpx-player-ctrl-time-label");
    const $curTime = $n(".bpx-player-ctrl-time-current");
    if ($timLabel && $curTime) {
      const str = $curTime.innerHTML;
      const arr = str.split(":");
      if (arr.length === 3) {
        return parseInt(arr[0]) * 3600 + parseInt(arr[1]) * 60 + parseInt(arr[2]);
      } else {
        return parseInt(arr[0]) * 60 + parseInt(arr[1]);
      }
    }
  };

  document.addEventListener(
    "mouseover",
    function (e) {
      const $target = e.target;
      // bpx-player-container bpx-state-no-cursor

      // const $container = $n(".bpx-player-container");
      // if ($container && !$container.classList.contains("bpx-state-no-cursor")) {
      //   _warn("进度条", e.target);
      //   return;
      // }

      if ($target.classList.contains("bpx-player-control-wrap")) {
        gob.curTime = fnGetTime();
        if (gob.curTime > 0 && gob.curTime - gob.lstTime > 137) {
          fnUpTitle(gob.curTime);
          fnUpUrl(gob.curTime);
          gob.lstTime = gob.curTime;
        }
      }
    },
    false,
  );

})();
