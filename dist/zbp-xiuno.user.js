// ==UserScript==
// @name         「Z-Blog」论坛辅助
// @namespace    https://www.wdssmq.com/
// @version      1.0.6
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
// @require      https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js
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
  const _curHref = () => location.href.replace(location.hash, "");
  // localStorage 封装
  const lsObj = {
    setItem(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    getItem(key, def = "") {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return def;
    },
  };
  // 预置函数
  const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);

  (() => {
    const $body = $n("body");
    const defData = {
      status: null, // 用于记录状态
      href: "",
    };

    // 更新 lsData 中的 status 状态
    const updateStatus = (status) => {
      const lsData = lsObj.getItem("xiuno_login", defData);
      lsData.status = status;
      lsData.href = status === "未登录" ? curHref : "";
      lsObj.setItem("xiuno_login", lsData);
    };

    // 登录后跳转前登录前的页面
    const goUrl = () => {
      // 读取 localStorage
      const lsData = lsObj.getItem("xiuno_login", defData);
      // 根据记录的状态判断是否跳转
      if (lsData.status === "未登录" && lsData.href) {
        // 读取要跳转的地址
        const href = lsData.href;
        // 更新状态
        updateStatus("已登录");
        // 跳转前的页面地址
        location.href = href;
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
      updateStatus("未登录");
      // 跳转登录页
      location.href = "/user-login.html";
    };

    _log("检查登录状态");
    // 延时 3 秒检查
    setTimeout(checkLogin, 3000);
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
        click() {
          fnBlockQuote();
        },
        title: UM.getEditor("message").getLang("labelMap").blockquote || "",
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
        click() {
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
      init(_$md) { },
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
      }
      else if (type === "md") {
        this.mdContent = this.mdEditor.getContent();
      }
      return this;
    }

    // 封装转换函数
    covert2(to = "md") {
      const converter = new showdown.Converter();
      if (to === "md") {
        this.mdContent = converter.makeMarkdown(this.htmlContent);
      }
      else if (to === "html") {
        this.htmlContent = converter.makeHtml(this.mdContent);
      }
      return this;
    }

    // 封装同步函数
    syncContent(to = "md") {
      if (to === "md") {
        this.mdEditor.setContent(this.mdContent);
      }
      else if (to === "html") {
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

  function mainForBBS() {
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
  }

  function mainForAPP() {
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
  }

  (() => {
    // 判断是否在应用中心编辑页
    if (curHref.includes("edit.php")) {
      // _log(UE)
      const editor_api = window.editor_api || unsafeWindow.editor_api;
      editor_api.editor.content.obj.ready(mainForAPP);
    }
    // 判断是否在论坛发帖、回帖页
    if ($("textarea#message").length > 0 && $("li.newpost").length === 0) {
      mainForBBS();
    }
  })();

  /* globals LZString */


  (() => {
    // 定义按钮及提示信息
    const $btnBad = $(" <a class=\"btn btn-primary\">BAD</a>");
    const strTip = "<p>此贴内容或签名不符合论坛规范已作屏蔽处理，请查看置顶贴，以下为原始内容备份。</p>";

    // 绑定点击事件
    $btnBad.css({ color: "#fff" }).click(() => {
      const um = UM.getEditor("message");
      const str = um.getContent();
      if (str.includes("#~~")) {
        return;
      }
      const strCode = LZString.compressToBase64(str);
      um.setContent(`${strTip}<p>#~~${strCode}~~#</p>`);
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
      const $secP = $(this).find("p:nth-child(2)");
      if ($secP.length === 0) {
        console.log("skip");
        return;
      }
      let str = $secP.html();
      if (!str.includes("#~~")) {
        return;
      }
      console.log(str);
      str = str.replace(/#~~(.+)~~#/, (_a, b) => {
        // console.log(arguments);
        const strDeCode = LZString.decompressFromBase64(b);
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

  const TRASH_KEY = "zbp-xiuno-trash-posts";
  const VIEW_KEY = "zbp-xiuno-thread-last-view";
  const DELETE_RETURN_KEY = "zbp-xiuno-delete-return-url";
  const VIEW_WINDOW_MS = 240 * 60 * 1000;
  const DELETE_RETURN_MS = 7 * 1000;

  function fnGetThreadId(strURL = _curHref()) {
    const match = strURL.match(/(?:\/|-)thread-(\d+)(?:\.html)?/i)
      || strURL.match(/thread-(\d+)/i);
    return match ? match[1] : "";
  }

  function fnUserText($sel) {
    return $sel.first().text().replace(/\s+/g, " ").trim();
  }

  function fnLoadRecordMap(key, def = {}) {
    const val = lsObj.getItem(key, def);
    return val && typeof val === "object" ? val : def;
  }

  function fnIsCurrentUserThread() {
    const threadId = fnGetThreadId();
    if (!threadId) {
      return false;
    }

    const authorName = fnUserText($(".media-body .username a, .card-thread .media .username a, .username a"));
    const currentName = fnUserText($(".nav-item.username a.nav-link, header .nav-item.username a.nav-link"));

    return Boolean(authorName && currentName && authorName === currentName);
  }

  function fnRecordThreadView() {
    if (!_curHref().includes("/thread-") || !fnIsCurrentUserThread()) {
      return;
    }

    const threadId = fnGetThreadId();
    const viewMap = fnLoadRecordMap(VIEW_KEY, {});
    viewMap[threadId] = Date.now();
    lsObj.setItem(VIEW_KEY, viewMap);

    const isTrash = $(".breadcrumb, .breadcrumb-item, .breadcrumb a").filter((_, el) => {
      return $(el).text().includes("回收站");
    }).length > 0;

    if (isTrash) {
      const arr = Array.isArray(lsObj.getItem(TRASH_KEY, [])) ? lsObj.getItem(TRASH_KEY, []) : [];
      if (!arr.includes(threadId)) {
        arr.push(threadId);
        lsObj.setItem(TRASH_KEY, arr);
      }
      $(".media-body h4").append("<span class=\"zbp-del-post-trash-badge\">「回收站」</span>");
    }
  }

  function fnIsThreadListPage() {
    const $mySide = $("#my_aside");
    return $mySide && $mySide.find(".active").text().trim() === "论坛帖子";
  }

  function fnBindThreadListRefresh() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && fnIsThreadListPage() && $(".js-unviewed").length) {
        window.location.reload();
      }
    });
    $(".threadlist .thread a").each(function() {
      const $link = $(this);
      $link.attr("target", "_blank");
    });
  }

  function fnMarkThreadList() {
    if (!fnIsThreadListPage()) {
      return;
    }

    const viewMap = fnLoadRecordMap(VIEW_KEY, {});
    const trashSet = new Set(Array.isArray(lsObj.getItem(TRASH_KEY, [])) ? lsObj.getItem(TRASH_KEY, []) : []);
    const now = Date.now();

    GM_addStyle(`
    .zbp-del-post-badge {
      display: inline-block;
      margin-left: .45rem;
      padding: .15rem .45rem;
      font-size: 12px;
      line-height: 1.4;
      color: #fff;
      border-radius: 999px;
      vertical-align: middle;
    }
    .zbp-del-post-viewed {
      background: #28a745;
      float: right;
    }
    .zbp-del-post-trash {
      background: #dc3545;
      float: right;
    }
  `);

    $(".list-item, .thread-item, .media, .table tbody tr, .list-group-item").each(function() {
      const $item = $(this);
      const $link = $item.find("a[href*='/thread-'], a[href*='thread-'], .title a, .thread-title a").first();
      if (!$link.length) {
        return;
      }

      const threadId = fnGetThreadId($link.attr("href") || "");
      if (!threadId) {
        return;
      }

      const $target = $item.find(".thread-title, .title, .subject, .media-heading, .card-title, a[href*='thread-']").first();
      if (!$target.length) {
        return;
      }

      const lastView = Number(viewMap[threadId]);
      const isViewedRecently = Number.isFinite(lastView) && (now - lastView) <= VIEW_WINDOW_MS;

      if (isViewedRecently && !$target.find(".zbp-del-post-viewed").length) {
        $target.append("<span class=\"zbp-del-post-badge zbp-del-post-viewed\">最近有看过</span>");
      }
      else {
        $target.addClass("js-unviewed");
      }

      if (trashSet.has(threadId) && !$target.find(".zbp-del-post-trash").length) {
        $target.append("<span class=\"zbp-del-post-badge zbp-del-post-trash\">回收站</span>");
      }
    });
  }

  function fnGetDeleteReturnInfo() {
    const info = lsObj.getItem(DELETE_RETURN_KEY, null);
    if (!info || typeof info !== "object") {
      return null;
    }
    return info;
  }

  function fnCheckDeleteReturn() {
    if (fnIsThreadListPage()) {
      return;
    }
    const info = fnGetDeleteReturnInfo();
    console.log(info);
    if (!info || !info.url || !Number.isFinite(info.time)) {
      return;
    }
    console.log(Date.now() - info.time);
    if (Date.now() - info.time > DELETE_RETURN_MS) {
      lsObj.setItem(DELETE_RETURN_KEY, null);
      return;
    }
    if (_curHref() !== info.url) {
      window.setTimeout(() => {
        lsObj.setItem(DELETE_RETURN_KEY, null);
        window.location.href = info.url;
      }, 3000);
    }
  }

  function fnBindDeleteReturn() {
    document.addEventListener("click", (event) => {
      const deleteLink = event.target.closest("a.post_delete");
      if (!deleteLink) {
        return;
      }
      const curUrl = _curHref();
      const threadId = fnGetThreadId();
      if (threadId && fnIsCurrentUserThread()) {
        const viewMap = fnLoadRecordMap(VIEW_KEY, {});
        viewMap[threadId] = Date.now();
        lsObj.setItem(VIEW_KEY, viewMap);
      }
      lsObj.setItem(DELETE_RETURN_KEY, {
        url: curUrl,
        time: Date.now(),
      });
    }, true);
  }

  (() => {
    fnCheckDeleteReturn();
    fnBindDeleteReturn();
    fnBindThreadListRefresh();
    fnRecordThreadView();
    fnMarkThreadList();
  })();

})();
