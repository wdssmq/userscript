// ==UserScript==
// @name         「Z-Blog」前台编辑文章入口
// @namespace    https://www.wdssmq.com/
// @version      1.0.3
// @author       沉冰浮水
// @description  配合主题以显示前台编辑入口
// @license      MIT
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
// @match       *://*/post/*.html*
// @match       *://*/*.html
// @match       *://*/zb_system/admin/edit.php*
// @match       *://*/zb_users/plugin/mz_admin2/edtView.php*
// @match       *://*/zb_system/admin/index.php?act=ArticleMng*
// @grant        none
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "zbp_edit";

  // 初始常量或函数
  const curUrl = window.location.href;
  // ---------------------------------------------------
  const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);
  // ---------------------------------------------------
  const $ = window.$ || unsafeWindow.$;

  function _cmtPlus(cb = () => { }) {
    if ($(".js-edt").length === 0) {
      return;
    }

    const toTimestamp = (input) => {
      const text = String(input).trim();

      // 兼容 "YYYY-MM-DD HH:mm:ss" 这类格式。
      const ts = Date.parse(text.replace(/-/g, "/"));
      if (!Number.isNaN(ts)) {
        return ts / 1000;
      }

      return Number.NaN;
    };

    // 获取 .post-time
    const $postTime = $(".post-time");
    // 评论时间
    const $$cmtTime = $(".cmt-time time");
    if ($postTime.length === 0 || $$cmtTime.length === 0) {
      return;
    }
    // 获取当前文章的发布时间，属性为 data-time
    const postTime = toTimestamp($postTime.data("time"));
    if (Number.isNaN(postTime)) {
      _log("[cmtPlus] 无法解析文章发布时间", $postTime.data("time"));
      return;
    }

    // 一个 flag 变量，记录是否有评论的时间早于文章发布时间
    let hasEarlyCmt = false;

    // 遍历每个评论时间，比较与文章发布时间
    $$cmtTime.each(function() {
      const rawTime = $(this).attr("datetime");
      const cmtTime = toTimestamp(rawTime);
      if (Number.isNaN(cmtTime)) {
        _log("[cmtPlus] 无法解析评论时间", rawTime);
        return;
      }
      // console.log(cmtTime <= postTime);
      if (cmtTime < postTime) {
        hasEarlyCmt = true;
        return false; // 退出 each 循环
      }
    });

    // 如果有评论时间早于文章发布时间
    if (hasEarlyCmt && typeof cb === "function") {
      // console.log(hasEarlyCmt);
      cb();
    }
  }

  function _mdToc () {
    const postTitle = $(".post-title");
    const $$referenceLink = $(".reference-link");
    // console.log("$$referenceLink = ", $$referenceLink);

    const _setAnchorLink = (el, $refLink) => {
      const anchorId = el.attr("id");
      const title = $refLink.attr("name");
      // 锚点链接目标
      const arrHash = [
        `#${anchorId}`,
        `#${title}`,
      ];

      const $a = $("<a>")
        .attr("href", "#")
        .attr("title", title)
        .html("#")
        .addClass("header-anchor")
        .data("hash", arrHash[0])
        .css({
          borderBottom: "none",
          marginRight: "3px",
          marginLeft: "-11px",
          visibility: "hidden",
        })
        .click(() => {
          // 根据 data-hash 属性，切换锚点链接目标
          const hash = $a.data("hash");
          const newHash = arrHash.filter(item => item !== hash)[0];
          $a.attr("href", newHash);
          $a.data("hash", newHash);
          document.title = `${title} - ${postTitle.text()}`;
        });
      const $span = el.find(".header-link");

      $span.replaceWith($a);

      // // 移除 el 直接的文本节点，但是保留 el 的子节点
      // el.contents().filter(function () {
      //   return this.nodeType === 3;
      // }).remove();
    };

    // 遍历
    $$referenceLink.each(function (_el) {
      const $anchor = $(this).parent();
      const _this = $(this);
      _setAnchorLink($anchor, _this);
      // 绑定鼠标 hover 事件
      $anchor.hover(() => {
        $anchor.find(".header-anchor").css({
          visibility: "visible",
          marginLeft: "-5px",
        });
      }, () => {
        $anchor.find(".header-anchor").css({
          visibility: "hidden",
          marginLeft: "-11px",
        });
      });
    });
  }

  const _postMng = {
    // 属性变量
    $thDate: null,
    // 初始化函数
    init() {
      this.setThDate();
    },
    // 设置表头函数，找到 data-field="date" 的 th 元素并保存到 $thDate 属性中
    setThDate() {
      if (this.$thDate) {
        return;
      }
      const $thDate = $("th");
      for (let i = 0; i < $thDate.length; i++) {
        const $th = $($thDate[i]);
        if ($th.data("field") === "date") {
          this.$thDate = $th;
          break;
        }
      }
    },
    // makeOrderBtn
    makeOrderBtn() {
      // 从网址中获取当前的排序方式
      const curOrder = new URLSearchParams(window.location.search).get("order");
      // 根据当前排序方式设置按钮的链接和文本
      const field = "updatetime";
      let order = "asc";
      if (curOrder === `${field}_asc`) {
        order = "desc";
      }
      else {
        order = "asc";
      }

      return {
        link: `${window.bloghost}zb_system/admin/index.php?act=ArticleMng&order=${field}_${order}`,
        text: `${order === "asc" ? "升序" : "降序"}`,
        icon: order === "asc" ? "icon-arrow-down-short" : "icon-arrow-up-short",
      };
    },
    // 封装一个函数，用于向 $thDate 添加按钮，参数为链接、class 和文本
    addBtn() {
      if (!this.$thDate) {
        _log("[postMng] 无法添加按钮，因为 $thDate 未找到");
        return;
      }
      const { text, link, icon } = this.makeOrderBtn();
      const $btn = $(`<a href="${link}" class="order_button" title="${text}">修改日期<i class="${icon}"></i></a>`);
      this.$thDate.prepend($btn);
      this.$thDate.addClass("flex gap-1 justify-center");
    },

    run() {
      this.addBtn();
    },
  };

  _postMng.init();

  $(() => {
    _mdToc();
    _postMng.run();
    // 添加编辑按钮
    $(".js-edt")
      .each(function() {
        const id = $(this).data("id");
        const type = $(this).data("type");
        const act = type ? "PageEdt" : "ArticleEdt";
        $(this).html(
          `[<a title="编辑" rel="external" href="${window.bloghost}zb_system/cmd.php?act=${act}&id=${id}">编辑</a>]`,
        );
      })
      .removeClass("is-hidden hidden");

    // 评论扩展
    _cmtPlus(
      () => {
        $(".js-edt")
          .each(function() {
            const id = $(this).data("id");
            const html = $(this).html();
            $(this).html(`[<a class="cmt-search" title="搜索评论" rel="external" href="${window.bloghost}zb_system/admin/index.php?act=CommentMng&postID=${id}" target="_blank">搜索评论</a>] ${html}`);
          });
      },
    );

    // 清理评论失效网址
    $(".cmt-tips").each(function() {
      const $this = $(this);
      const authName = $this.data("name");
      $this.append(
        ` <a class="cmt-edit" title="查找编辑" rel="external" href="${window.bloghost}zb_users/plugin/cmt2rss/main.php?act=update&read_getWord=${authName}" target="_blank">查找编辑</a>`,
      );
    });
    $(".cmt-edit").css({ color: "#175199" });

    // 设置文章为回收
    if (curUrl.includes("zblogcn.com")) {
      return;
    }
    $("#edtTitle").after(
      "<a class=\"js-empty\" href=\"javascript:;\" title=\"设置为回收\"> 「设置为回收」</a>",
    );
    const editor_api = window.editor_api;
    $(".js-empty").click(() => {
      $("#edtTitle").val("回收");
      $("#edtTag").val("回收");
      $("#edtDateTime").datetimepicker("setDate", (new Date()));
      $("#cmbPostStatus").val("1");
      let strMore = "";
      if (typeof window.EDITORMD == "object") {
        strMore = "\n\n<!--more-->";
      }
      else {
        strMore = "<hr class=\"more\" />";
      }
      const oBody = `回收${strMore}`;
      editor_api.editor.content.put(oBody);
      editor_api.editor.intro.put("");
    });
  });

})();
