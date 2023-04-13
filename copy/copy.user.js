// ==UserScript==
// @name         「水水」复制标题网址
// @namespace    https://www.wdssmq.com/
// @version      2.1.3
// @author       沉冰浮水
// @description  复制当前页面标题及网址，支持复制为 HTML 及 Markdown。「QQ 群：189574683」
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.net/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @include      http://*
// @include      https://*
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  // -------------------------------------

  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // 指定元素内查找子元素
  function fnFindDom(el, selector) {
    el = typeof el === "string" ? $n(el) : el;
    const queryList = el.querySelectorAll(selector);
    if (queryList.length === 1) {
      return queryList[0];
    }
    return queryList.length > 1 ? queryList : null;
  }

  function fnReplace(params) {
    const { url, title } = params;
    // _log("fnReplace", params);
    const titleFilter = [
      // 贴吧
      [/^(.+吧-百度贴吧)--.+/, "$1"],
    ];
    const urlFilter = [
      // QQ
      ["?tdsourcetag=s_pctim_aiomsg", ""],
      // 哔哩哔哩
      [/\?spm_id_from=.+/, ""],
      [/\?vd_source=.+/, ""],
    ];
    let newTitle = title;
    let newUrl = url;
    titleFilter.forEach((item) => {
      newTitle = newTitle.replace(...item);
    });
    urlFilter.forEach((item) => {
      newUrl = newUrl.replace(...item);
    });
    if (location.host == "greasyfork.org") {
      newUrl = newUrl.replace(/(\/\d+)-.+/, "$1");
    }
    // _log("fnReplace", { url, title }, { newUrl, newTitle });
    return { url: newUrl, title: newTitle };
  }

  function fnGetInfo(md = false) {
    let { url, title } = fnReplace({
      url: document.location.href,
      title: document.title.trim(),
    });
    if (md) {
      // eslint-disable-next-line no-useless-escape
      title = title.replace(/([_\[\]])/g, "\\$1");
    }
    return [title, url];
  }

  GM_registerMenuCommand("复制", () => {
    const [title, url] = fnGetInfo();
    GM_setClipboard(title + "\n" + url);
  });

  GM_registerMenuCommand("复制 HTML", () => {
    const [title, url] = fnGetInfo();
    GM_setClipboard(
      `<p>${title}</p><p><a href="${url}" target="_blank" title="${title}">${url}</a></p>`,
    );
  });

  GM_registerMenuCommand("复制为 Markdown「text」", () => {
    const [title, url] = fnGetInfo(true);
    GM_setClipboard(`[${title}](${url} "${title}")`);
  });

  GM_registerMenuCommand("复制为 Markdown「link」", () => {
    const [title, url] = fnGetInfo(true);
    GM_setClipboard(`${title}：\n\n[${url}](${url} "${title}")`);
  });

  // 指定元素中的链接增加 target="_blank"
  const config = [
      [".markdown_body", ".reply_content"],
      ["#additional-info"],
      ["div.forum_table table"],
  ];

  const fnSetBlank = ($a) => {
      $a.setAttribute("target", "_blank");
  };

  config.forEach((e) => {
      const selector = e.join(",");
      const $$container = $na(selector);
      // // print $$container
      // _log($$container);
      // 遍历 $$container
      [].forEach.call($$container, ($el) => {
          const $$a = fnFindDom($el, "a");
          // _log($$a);
          if ($$a.length > 0) {
              [].map.call($$a, fnSetBlank);
          }
      });
  });

})();
