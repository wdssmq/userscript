
// ==UserScript==
// @name         「xiuno」管理工具（QQ 群：189574683）
// @namespace    沉冰浮水
// @version      1.0
// @description  对不合规的内容加密处理
// @author       沉冰浮水
// @link         https://greasyfork.org/zh-CN/scripts/419517
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @match        https://bbs.zblogcn.com/*
// @require      https://cdn.bootcdn.net/ajax/libs/lz-string/1.4.4/lz-string.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/js-yaml/4.1.0/js-yaml.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
/* jshint esversion:6 */

(function () {
  'use strict';

  const gm_name = "xiuno";

  // 初始变量
  const $ = window.jQuery || unsafeWindow.jQuery;
  const UM = window.UM || unsafeWindow.UM;
  const curHref = location.href.replace(location.hash, "");
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
  // 预置函数
  const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);
  const _hash = () => location.hash.replace("#", "");
  // Get 封装
  function fnGetRequest(strURL, strData, fnCallback) {
    if (typeof strData === "function") {
      fnCallback = strData;
      strData = "";
    }
    GM_xmlhttpRequest({
      method: "GET",
      data: strData,
      url: strURL,
      onload: function (responseDetail) {
        if (responseDetail.status === 200) {
          fnCallback(responseDetail.responseText, strURL);
        } else {
          console.log(responseDetail);
          alert("请求失败，请检查网络！");
        }
      },
    });
  }
  // formtTime 封装
  function fnFormatTime() {
    const objTime = new Date();
    const strYear = objTime.getFullYear();
    const strMonth = objTime.getMonth() + 1;
    const strDate = objTime.getDate();
    objTime.getHours();
    objTime.getMinutes();
    objTime.getSeconds();
    return (
      [strYear, strMonth, strDate].map((n) => n.toString().padStart(2, "0")).join("-") +
      // " " +
      // [strHour, strMinute, strSecond].map((n) => n.toString().padStart(2, "0")).join(":") +
      ""
    ).trim();
  }

  // _lz.js | 使用 lz-string 压缩字符串
  (() => {
    // 定义按钮及提示信息
    const $btnBad = $(` <a class="btn btn-primary">BAD</a>`);
    const strTip = `<p>此贴内容或签名不符合论坛规范已作屏蔽处理，请查看置顶贴，以下为原始内容备份。</p>`;

    // 绑定点击事件
    $btnBad.css({ color: "#fff" }).click(function () {
      let um = UM.getEditor("message");
      let str = um.getContent();
      if (str.indexOf("#~~") > -1) {
        return;
      }
      let strCode = LZString.compressToBase64(str);
      um.setContent(strTip + `<p>#~~${strCode}~~#</p>`);
      console.log(LZString.decompressFromBase64(strCode));
      // let strDeCode = LZString.decompressFromBase64(strCode);
      // um.setContent(strCode + strDeCode);
    });

    // 放置按钮
    if ($("input[name=update_reason]").length > 0) {
      $("#submit").after($btnBad);
    }

    // 解码
    $("div.message").each(function () {
      let $secP = $(this).find("p:nth-child(2)");
      if ($secP.length == 0) {
        console.log("skip");
        return;
      }
      let str = $secP.html();
      if (str.indexOf("#~~") == -1) {
        return;
      }
      console.log(str);
      str = str.replace(/#~~(.+)~~#/, function (a, b) {
        console.log(arguments);
        let strDeCode = LZString.decompressFromBase64(b);
        console.log(strDeCode);
        return strDeCode;
      });
      $secP.after(str).remove();
    });
  })();

  // _pid.js | 楼层地址
  (() => {
    $("li.media.post").each(function () {
      const $me = $(this);
      const pid = $me.data("pid");
      const $date = $me.find("span.date");
      $date.after(
        `<a class="text-grey ml-2" title="获取当前楼层链接" href="${curHref}#${pid}">「楼层地址」</a>`
      );
    });
  })();

  // _devView.js | 开发者申请查看
  (() => {
    // CDN 地址替换
    function fnGetCDNUrl(url) {
      const arrMap = [
        ["https://github.com/", "https://cdn.jsdelivr.net/gh/"],
        ["/blob/", "@"]
      ];
      let cdnUrl = url;
      arrMap.forEach(line => {
        cdnUrl = cdnUrl.replace(line[0], line[1]);
      });
      return cdnUrl;
    }

    // time 2 hour
    function fnTime2Hour(time = null) {
      if (!time) {
        time = new Date();
      }
      // 时间戳
      const timeStamp = time.getTime();
      return Math.floor(timeStamp / 1000 / 60 / 60);
    }

    // YML 地址列表
    const useCDN = GM_getValue("useCDN", false);
    let ymlList = GM_getValue("useCDN", ["2021H2", "2022H1"]);
    ymlList = ymlList.map(yml => {
      let url = `https://raw.githubusercontent.com/wdssmq/ReviewLog/main/data/${yml}.yml`;
      if (useCDN) {
        url = fnGetCDNUrl(url);
      }
      return url;
    });

    // 模板函数
    function fnStrtr(
      str,
      obj,
      callback = (str) => {
        return str;
      }
    ) {
      let rltStr = str;
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          const reg = new RegExp(`#${key}#`, "g");
          rltStr = rltStr.replace(reg, value);
        }
      }
      return callback(rltStr);
    }

    // 数据读取封装
    const gobDev = {
      data: {
        lstLogs: [],
        lstCheck: null
      },
      init: function (ymlList) {
        this.data = lsObj.getItem("gobDev", this.data);
        _log("gobDev init", this.data);
        if (_hash() === "clear") {
          _log("gobDev clear");
          this.data.lstCheck = null;
        }
        this.ymlList = ymlList;
      },
      checkUrl: function (url) {
        let rlt = null;
        this.data.lstLogs.forEach(log => {
          if (log.url.indexOf(url) > -1) {
            _log("checkUrl", url, log.url);
            rlt = log;
          }
        });
        return rlt;
      },
      save: function () {
        lsObj.setItem("gobDev", this.data);
      },
      update: function () {
        const curHour = fnTime2Hour();
        if (this.data.lstCheck === curHour && this.data.lstLogs.length > 0) {
          return;
        }
        this.data.lstLogs = [];
        this.data.lstCheck = curHour;
        this.ajax();
      },
      ajax: function () {
        const self = this;
        this.ymlList.forEach(yml => {
          fnGetRequest(yml, (responseText, url) => {
            const ymlObj = jsyaml.load(responseText, "utf8");
            const curLogs = self.data.lstLogs;
            self.data.lstLogs = curLogs.concat(ymlObj);
            self.save();
          });
        });
      }
    };
    gobDev.init(ymlList);
    gobDev.update();

    // 根据 log 数据设置状态徽章
    const _setBadge = function (log, $item = null, act = "after") {
      // console.log("log", log);
      let $badge = null;
      if (log && log.status === "通过") {
        $badge = $(`<span class="badge badge-success">${log.status}</span>`);
      } else if (log) {
        $badge = $(`<span class="badge badge-primary">${log.status}</span>`);
      } else {
        $badge = $(`<span class="badge badge-warning">未记录</span>`);
      }
      if (act === "after") {
        $item.after($badge);
      } else {
        $item.append($badge);
      }
    };

    // 标题列表
    const $titleList = $("li.media .subject a");
    $titleList.each(function () {
      const $this = $(this);
      const href = $this.attr("href");
      const title = $this.text();
      if (title.indexOf("申请开发者") === -1) {
        return;
      }
      const log = gobDev.checkUrl(href);
      _setBadge(log, $this);
    });

    // 博文内页
    const $h4 = $(".media-body h4");
    let title = $h4.text().trim();
    if (title.indexOf("申请开发者") === -1) {
      return;
    }
    const log = gobDev.checkUrl(curHref);
    _setBadge(log, $h4, "append");

    // 初始化
    $("div.message").each(function () {
      if ($(this).attr("isfirst") == 1) {
        $(this).prepend(
          `<blockquote class="blockquote"><pre class="pre-yml"></pre></blockquote>`
        );
        $(".pre-yml").text(`标题格式错误`);
      }
    });

    // 标题内容解析
    title = title.replace(/\[|【/g, "「").replace(/\]|】/g, "」");
    const objMatch = title.match(/「([^」]+)」「(theme|plugin)」/);
    _log("objMatch", objMatch);
    if (!objMatch) {
      return;
    }

    // YML 模板
    const tplYML = `
- id: #id#
  type: #type#
  status: 进行中
  rating:
  url: #url#
  date:
    - #date#
  reviewers:
    - null
`;
    // 构建 YML
    const styYML = fnStrtr(
      tplYML,
      {
        id: objMatch[1],
        type: objMatch[2],
        url: curHref,
        date: fnFormatTime(),
      },
      (str) => {
        str = str.replace(/\n/g, "\\|");
        // str = str.replace(/\s{6}/g, "_2__2_");
        // str = str.replace(/\s{4}/g, "_2_");
        // str = str.replace(/_2_/g, "  ");
        str = str.replace(/\\\|/g, "\n");
        const objMatch = title.match(/(通过|拒绝)/);
        if (objMatch) {
          str = str.replace(/status: 进行中/, `status: ${objMatch[1]}`);
        }
        return str;
      }
    );
    // 插入 YML
    $(".pre-yml").text(`${styYML}`);
  })();

})();
