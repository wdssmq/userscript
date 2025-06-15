// ==UserScript==
// @name         「Z-Blog」论坛辅助
// @namespace    https://www.wdssmq.com/
// @version      1.0.5
// @author       沉冰浮水
// @description  针对 Z-Blog 官方论坛的辅助脚本
// @license      MIT
// @link         https://greasyfork.org/zh-CN/scripts/419517
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.com/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://bbs.zblogcn.com/*
// @match        https://app.zblogcn.com/zb_system/admin/edit.php*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @require      https://cdn.bootcdn.net/ajax/libs/lz-string/1.4.4/lz-string.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/js-yaml/4.1.0/js-yaml.min.js
// @require      https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "zbp-xiuno";

  // 初始变量
  const $n = (selector, context = document) => context.querySelector(selector);
  const $ = window.jQuery || unsafeWindow.jQuery;
  const UM = window.UM || unsafeWindow.UM;
  const UE = window.UE || unsafeWindow.UE;
  const curHref = location.href.replace(location.hash, "");
  // localStorage 封装
  const lsObj = {
    setItem: function(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    getItem: function(key, def = "") {
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
      onload: function(responseDetail) {
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
      [strYear, strMonth, strDate].map(n => n.toString().padStart(2, "0")).join("-") +
      // " " +
      // [strHour, strMinute, strSecond].map((n) => n.toString().padStart(2, "0")).join(":") +
      ""
    ).trim();
  }

  (() => {
    const $body = $n("body");
    const defData = {
      status: 0, // 用于记录状态
      href: curHref,
    };

    // 更新 lsData 中的 status 状态
    const updateStatus = (status) => {
      const lsData = lsObj.getItem("xiuno_login", defData);
      lsData.status = status;
      lsObj.setItem("xiuno_login", lsData);
    };

    // 登录后跳转前登录前的页面
    const goUrl = () => {
      // 读取 localStorage
      const lsData = lsObj.getItem("xiuno_login", defData);
      // 根据记录的状态判断是否跳转
      if (lsData.status === 1) {
        // 更新状态
        updateStatus(2);
        // 跳转前的页面地址
        location.href = lsData.href;
      }
    };

    // 主入口函数，判断是否登录
    const checkLogin = () => {
      // 判断 body 内容是否为空
      if ($body.textContent.trim() !== "") {
        // 有内容，说明已登录，根据记录的地址跳转
        goUrl();
        return;
      }
      // 更新状态及 href 到 localStorage
      updateStatus(1);
      // 跳转登录页
      location.href = "/user-login.html";
    };

    // 延时 3 秒检查
    setTimeout(checkLogin, 3000);
  })();

  /* globals LZString jsyaml*/

  (() => {
    // 定义按钮及提示信息
    const $btnBad = $(" <a class=\"btn btn-primary\">BAD</a>");
    const strTip = "<p>此贴内容或签名不符合论坛规范已作屏蔽处理，请查看置顶贴，以下为原始内容备份。</p>";

    // 绑定点击事件
    $btnBad.css({ color: "#fff" }).click(function() {
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
    $("div.message").each(function() {
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
      str = str.replace(/#~~(.+)~~#/, function(a, b) {
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
    $("li.media.post").each(function() {
      const $me = $(this);
      const pid = $me.data("pid");
      const $date = $me.find("span.date");
      $date.after(
        `<a class="text-grey ml-2" title="获取当前楼层链接" href="${curHref}#${pid}">「楼层地址」</a>`,
      );
    });
  })();

  /* globals jsyaml*/

  (() => {
    // _log(curHref);
    if (curHref.indexOf("bbs.zblogcn.com") === -1) {
      return;
    }
    _log("devView");
    // CDN 地址替换
    function fnGetCDNUrl(url) {
      const arrMap = [
        ["https://github.com/", "https://cdn.jsdelivr.net/gh/"],
        ["/blob/", "@"],
      ];
      let cdnUrl = url;
      arrMap.forEach((line) => {
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

    // 默认配置项
    const defConfig = {
      useCDN: false,
      ymlList: [
        "2023H1",
        "2022H2",
        "2022H1",
        "2021H2",
      ],
      ver: "2023-04-24",
      isNew: true,
    };

    // 配置项读取和首次保存
    const curConfig = GM_getValue("_devConfig", defConfig);
    if (curConfig.isNew || curConfig.ver !== defConfig.ver) {
      curConfig.isNew = false;
      GM_setValue("_devConfig", defConfig);
    }

    // 初始化 ymlList
    function fnInitYML() {
      const useCDN = curConfig.useCDN;
      let ymlList = curConfig.ymlList;
      ymlList = ymlList.map((yml) => {
        let url = `https://raw.githubusercontent.com/wdssmq/ReviewLog/main/data/${yml}.yml`;
        if (useCDN) {
          url = fnGetCDNUrl(url);
        }
        return url;
      });
      return ymlList;
    }

    // 模板函数
    function fnStrtr(
      str,
      obj,
      callback = (str) => {
        return str;
      },
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
        lstCheck: null,
      },
      init: function() {
        this.data = lsObj.getItem("gobDev", this.data);
        _log("gobDev init", this.data);
        this.ymlList = fnInitYML();
      },
      checkUrl: function(url) {
        let rlt = null;
        this.data.lstLogs.forEach((log) => {
          if (log.url.indexOf(url) > -1) {
            _log("checkUrl", url, log.url);
            rlt = log;
          }
        });
        return rlt;
      },
      clear: function() {
        this.data.lstLogs = [];
        lsObj.setItem("gobDev", this.data);
      },
      save: function() {
        lsObj.setItem("gobDev", this.data);
      },
      update: function() {
        const curHour = fnTime2Hour();
        if (this.data.lstCheck === curHour && this.data.lstLogs.length > 0) {
          return;
        }
        this.data.lstLogs = [];
        this.data.lstCheck = curHour;
        this.ajax();
      },
      ajax: function() {
        const self = this;
        this.ymlList.forEach((yml) => {
          fnGetRequest(yml, (responseText, url) => {
            _log("ajax", url);
            const ymlObj = jsyaml.load(responseText, "utf8");
            const curLogs = self.data.lstLogs;
            self.data.lstLogs = curLogs.concat(ymlObj);
            self.save();
          });
        });
      },
    };

    gobDev.init();
    gobDev.update();

    // 缓存清理封装
    const _clearAct = (doClear = false) => {
      const curHash = _hash();
      if (curHash === "clearDone") {
        window.location.href = `${curHref}`;
        // window.location.reload();
      } else if (doClear || curHash === "clear") {
        gobDev.clear();
        window.location.href = `${curHref}#clearDone`;
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };
    // 默认调用一次用于清后的跳转
    _clearAct();

    // 缓存清理按钮
    const $btnClear = $("<span class=\"small\"><a href=\"javascript:;\" title=\"清理缓存\" class=\"badge badge-warning\">清理缓存</a></span>");
    $btnClear.on("click", function() {
      if (confirm("清理缓存？")) {
        _clearAct(1);
      }
    });

    // 根据 log 数据设置状态徽章
    const _setBadge = (log, $item = null, act = "after") => {
      // console.log("log", log);
      let badgeClass, $badge;
      const status = log?.status || "未记录";
      switch (status) {
        case "通过":
          badgeClass = "badge-success";
          break;
        case "进行中":
          badgeClass = "badge-info";
          break;
        case "拒绝":
          badgeClass = "badge-danger";
          break;
        default:
          badgeClass = "badge-warning";
          break;
      }
      $badge = $(`<span class="badge ${badgeClass}">${status}</span>`);

      if (act === "after") {
        $item.after($badge);
        // $item.after($btnClear);
      } else {
        $item.append($badge);
        $item.append(" ");
        $item.append($btnClear);
      }
    };

    // 标题列表
    const $titleList = $("li.media .subject a");
    $titleList.each(function() {
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

    _log("curLog", log);

    // 初始化
    $("div.message").each(function() {
      if ($(this).attr("isfirst") == 1) {
        $(this).prepend(
          "<blockquote class=\"blockquote\"><pre class=\"pre-yml\"></pre></blockquote>",
        );
        $(".pre-yml").text("标题格式错误");
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
  status: #status#
  rating: #rating#
  url: #url#
  git: #git#
  date:
    - #date#
  reviewers:
    - #reviewers#
`;
    // 构建 YML
    const styYML = fnStrtr(
      tplYML,
      {
        id: objMatch[1],
        type: objMatch[2],
        status: log ? log.status : "进行中",
        rating: log ? log.rating : "",
        url: curHref,
        git: log ? log.git : "",
        date: log ? log.date[0] : fnFormatTime(),
        reviewers: log ? log.reviewers.join("\n_4_- ") : "null",
      },
      (str) => {
        str = str.replace(/\n/g, "\\|");
        // str = str.replace(/\s{6}/g, "_2__2_");
        // str = str.replace(/\s{4}/g, "_2_");
        str = str.replace(/_4_/g, "_2__2_");
        str = str.replace(/_2_/g, "  ");
        str = str.replace(/\\\|/g, "\n");
        const objMatch = title.match(/(通过|拒绝)/);
        if (objMatch) {
          str = str.replace(/status: 进行中/, `status: ${objMatch[1]}`);
        }
        return str;
      },
    );
    // 插入 YML
    $(".pre-yml").text(`${styYML}`);
  })();

  // 引入元素插入
  (() => {
    if (typeof UM === "undefined") {
      return;
    }

    // 引用标签插入封装
    function fnBlockQuote() {
      const umObj = UM.getEditor("message");
      if (!umObj.isFocus()) {
        umObj.focus(true);
      }
      const addHTML = "<blockquote class=\"blockquote\"><p><br></p></blockquote><p><br></p>";
      // umObj.execCommand("insertHtml", addHTML);
      umObj.setContent(addHTML, true);
    }

    // 添加引用按钮
    $("head").append("<style>.edui-icon-blockquote:before{content:\"\\f10d\";}");
    (() => {
      const $btn = $.eduibutton({
        icon: "blockquote",
        click: function() {
          fnBlockQuote();
        },
        title: UM.getEditor("message").getLang("labelMap")["blockquote"] || "",
      });
      $(".edui-btn-name-insertcode").after($btn);
    })();

    // 自动排版函数封装
    function fnAutoFormat() {
      const umObj = UM.getEditor("message");
      let strHTML = umObj.getContent();
      strHTML = strHTML.replace(
        /<blockquote>/g,
        "<blockquote class=\"blockquote\">",
      );
      // 第二个参数为 true 表示追加；
      umObj.setContent(strHTML, false);
    }

    // 添加自动排版按钮
    $("head").append("<style>.edui-btn-auto-format:before{content:\"fix\";}");
    (() => {
      const $btn = $.eduibutton({
        icon: "auto-format",
        click: function() {
          fnAutoFormat();
        },
        title: "自动排版",
      });
      $(".edui-btn-name-insertcode").after($btn);
    })();
  })();

  /* global showdown */


  class GM_editor {
    $def;
    defEditor = null;
    htmlContent = "";
    $md;
    mdEditor = null;
    mdContent = "";
    defOption = {
      init($md) { },
      autoSync: false,
      curType: "html",
    };
    option = {};
    constructor(option) {
      this.option = Object.assign({}, this.defOption, option);
      this.init();
      this.option.init(this.$md);
      this.getContent("html").covert2("md").syncContent("md");
    }
    init() {
      const _this = this;
      this.$def = this.option.$defContainer || $(".edui-container");
      this.$md = this.createMdEditor();
      // 编辑器操作对象
      this.defEditor = this.option.defEditor || UM.getEditor("message");
      this.mdEditor = {
        // 内容变化时触发
        addListener(type, fn) {
          if (type === "contentChange") {
            // _log(_this.$md);
            _this.$md.find("#message_md").on("input", fn);
          }
        },
        // 获取内容
        getContent() {
          return _this.$md.find("#message_md").val();
        },
        // 写入内容
        setContent(content) {
          _this.$md.find("#message_md").text(content);
        },
      };
      if (this.option.autoSync) {
        this.defEditor.addListener("contentChange", () => {
          if (_this.option.curType === "md") {
            return;
          }
          this.getContent("html").covert2("md").syncContent("md");
        });
        this.mdEditor.addListener("contentChange", () => {
          if (_this.option.curType === "html") {
            return;
          }
          this.getContent("md").covert2("html").syncContent("html");
        });
      }
    }
    // 读取内容
    getContent(type = "html") {
      if (type === "html") {
        this.htmlContent = this.defEditor.getContent();
      } else if (type === "md") {
        this.mdContent = this.mdEditor.getContent();
      }
      return this;
    }
    // 封装转换函数
    covert2(to = "md") {
      const converter = new showdown.Converter();
      if (to === "md") {
        this.mdContent = converter.makeMarkdown(this.htmlContent);
      } else if (to === "html") {
        this.htmlContent = converter.makeHtml(this.mdContent);
      }
      return this;
    }
    // 封装同步函数
    syncContent(to = "md") {
      if (to === "md") {
        this.mdEditor.setContent(this.mdContent);
      } else if (to === "html") {
        this.defEditor.setContent(this.htmlContent, false);
      }
    }
    // 自动设置 #message_md 的高度
    autoSetHeight() {
      const $mdText = this.$md.find("#message_md");
      // 自动设置高度
      $mdText.height(0);
      $mdText.height($mdText[0].scrollHeight + 4);
      // 判断并绑定 input 事件
      if ($mdText.data("bindInput")) {
        return;
      }
      $mdText.data("bindInput", true);
      $mdText.on("input", () => {
        this.autoSetHeight();
      });
    }
    // 切换编辑器
    switchEditor() {
      this.$def.toggle();
      this.$md.toggle();
      // 根据结果设置 curType
      this.option.curType = this.$def.css("display") === "none" ? "md" : "html";
      // 切换后自动设置高度
      this.autoSetHeight();
    }
    // 创建 markdown 编辑器
    createMdEditor() {
      return $(`
      <div class="mdui-container" style="display: none;">
        <div class="mdui-body">
          <textarea id="message_md" name="message_md" placeholder="markdown" class="mdui-text"></textarea>
        </div>
      </div>
    `);
    }
  }

  GM_addStyle(`
  .is-pulled-right {
    float: right;
  }
  .mdui-container {
    border: 1px solid #d4d4d4;
    padding: 5px 10px;
  }
  .mdui-container:focus-within {
    border: 1px solid #4caf50;
  }
  .mdui-text {
    border: none;
    width: 100%;
    min-height: 300px;
    height: auto;
  }
  .mdui-text:focus,
  .mdui-text:focus-visible {
    outline: none;
    box-shadow: none;
  }
`);

  const mainForBBS = () => {
    const gm_editor = new GM_editor({
      init($md) {
        $(".edui-container").after($md);
      },
      autoSync: true,
    });

    const btnSwitchEditor = `
  <button class="btn btn-primary" type="button" id="btnSwitchEditor">切换编辑器</button>
  `;

    // 判断是否有 name 为 fid 的 select
    if ($("select[name='fid']").length === 0) {
      // quotepid 后追加一行 .form-group
      $("input[name='quotepid']").after("<div class=\"form-group\"><span></span></div>");
    }


    // name 为 quotepid 的 input 下一行追加切换按钮
    $("input[name='quotepid'] + .form-group").addClass("d-flex justify-content-between").append(btnSwitchEditor);

    // 切换编辑器
    $("#btnSwitchEditor").click(() => {
      gm_editor.switchEditor();
    });
  };

  const mainForAPP = () => {
    const gm_editor = new GM_editor({
      init($md) {
        $("#editor_content").after($md);
        // const $mdText = $md.find("#message_md");
        // $mdText.height($("#editor_content").height() - 10);
        $(".mdui-body").css({
          paddingTop: ".3em",
        });
      },
      $defContainer: $("#editor_content"),
      defEditor: UE.getEditor("editor_content"),
      autoSync: true,
    });

    // # cheader 元素内部追加切换按钮
    $("#cheader").append(`
  <span class="is-pulled-right">「<a href="javascript:;" class="btn btn-primary" id="btnSwitchEditor" title="切换编辑器">切换编辑器</a>」</span>
`);


    // 切换编辑器
    $("#btnSwitchEditor").click(() => {
      gm_editor.switchEditor();
    });
  };

  (() => {
    // 判断是否在应用中心编辑页
    if (curHref.indexOf("edit.php") > -1) {
      // _log(UE)
      const editor_api = window.editor_api || unsafeWindow.editor_api;
      editor_api.editor.content.obj.ready(mainForAPP);
    }
    // 判断是否在论坛发帖、回帖页
    if ($("textarea#message").length > 0 && $("li.newpost").length === 0) {
      mainForBBS();
    }
  })();

})();
