// ==UserScript==
// @name         「水水」时间轴助手
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  Z-BlogPHP mz_TimeLine 插件辅助脚本
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
// @match        https://www.wdssmq.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "zbp-TimeLine";

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}] |`, ...args);

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

  // note 条目格式定义
  const noteScheme$1 = {
    item: {
      "Title": "node:.post-title a",
      "Desc": "node:.post-intro",
      "Image": null,
      "Source": "[url=https://www.wdssmq.com]沉冰浮水的博客[/url]",
      "Tags": "node:.post-intro .a-tag",
      "Type": "文章",
      "Url": "node:.post-title a",
    },
    parent: ".post",
    remove: "span.a-tag",
    btnWrap: ".post-meta.meta-2",
    ver: "1.0.4",
  };

  // 初始化配置
  const config = GM_getValue("config", {});
  if (JSON.stringify(config) === "{}" || config.noteScheme.ver !== noteScheme$1.ver) {
    GM_setValue("config", {
      noteScheme: noteScheme$1,
    });
  }

  // alert("getNoteByZBP");

  // 格式化 JSON
  function formatJSON(obj) {
    let strJSON = JSON.stringify(obj);
    Object.keys(obj).forEach((key) => {
      const reg = new RegExp(`("${key}":)`);
      strJSON = strJSON.replace(reg, "\n$1 ");
    });
    // 花括号换行
    strJSON = strJSON.replace(/({)\n*/g, "$1\n");
    strJSON = strJSON.replace(/\n*(})/g, "\n$1");
    return strJSON;
  }

  // Tags 特殊处理
  function formatTags(obj) {
    if (obj.Tags) {
      obj.Desc = obj.Desc.replace(obj.Tags.join(" "), "").trim();
      obj.Tags = obj.Tags.join(", ");
    }
    return obj;
  }

  // 对象转 yaml
  function obj2yaml(obj) {
    let strYaml = "";
    obj = formatTags(obj);
    Object.keys(obj).forEach((key) => {
      strYaml += `${key}: ${obj[key]}\n`;
    });
    return strYaml;
  }

  function btnToggle($btn, text) {
    const tmp = $btn.text;
    $btn.text = text;
    setTimeout(() => {
      $btn.text = tmp;
    }, 3000);
  }

  // 添加复制按钮及事件的封装
  function addCopyBtn($btnWrap, note, btnCon = "复制", copyType = "json") {
    const $btn = document.createElement("a");
    $btn.href = "javascript:;";
    $btn.classList.add("is-pulled-right");
    $btn.textContent = btnCon;
    $btn.title = btnCon;
    $btnWrap.appendChild($btn);
    // 由 copyType 决定复制的内容
    let copyText = "";
    if ("json" === copyType) {
      copyText = formatJSON(note);
    } else if ("yaml" === copyType) {
      copyText = obj2yaml(note);
    }
    // 复制按钮事件
    $btn.addEventListener("click", () => {
      _log("copyText", copyText);
      GM_setClipboard(copyText);
      btnToggle($btn, "复制成功");
    });
  }

  const noteScheme = config.noteScheme;
  const $items = $na(noteScheme.parent);
  Array.from($items).forEach(($item) => {
    // 移除不需要的元素
    const $remove = fnFindDom($item, noteScheme.remove);
    if ($remove) {
      $remove.remove();
    }
    const note = {};
    Object.keys(noteScheme.item).forEach((key) => {
      const selector = noteScheme.item[key];
      if (!selector) {
        return;
      }
      if (typeof selector === "string" && selector.indexOf("node:") === 0) {
        const $node = fnFindDom($item, selector.slice(5));
        // _log("selector", selector);
        // _log("$node", $node);
        // 判断是否是 nodeList
        if ($node && $node.length) {
          _log("$node", $node);
          const arr = [];
          Array.from($node).forEach(($n) => {
            arr.push($n.textContent.trim());
          });
          note[key] = arr;
        } else if ($node) {
          if ("Url" === key) {
            note[key] = $node.href;
          } else {
            note[key] = $node.textContent.trim().replace(/\s+/g, " ");
          }
        }
      } else {
        note[key] = selector;
      }
    });
    // 添加复制按钮
    const $btnWrap = fnFindDom($item, noteScheme.btnWrap);
    // _log("$btnWrap", $btnWrap);
    if ($btnWrap) {
      addCopyBtn($btnWrap, note, "复制 JSON", "json");
      // insertAdjacentHTML 添加一个 span
      $btnWrap.insertAdjacentHTML("beforeend", "<span class=\"is-pulled-right\">&nbsp;&nbsp;</span>");
      addCopyBtn($btnWrap, note, "复制 YAML", "yaml");
    }
  });

  // _log("notes", notes);

  // // 从 link:href 中获取主题名
  // function _themeName() {
  //   let themeName = "";
  //   const $links = $na("link");
  //   Array.from($links).forEach(($link) => {
  //     const href = $link.getAttribute("href");
  //     if (href.includes("zb_users/theme/")) {
  //       const match = href.match(/theme\/(.*)\/css/);
  //       if (match) {
  //         themeName = match[1];
  //         _log("themeName", themeName);
  //       }
  //     }
  //   });
  //   return themeName;
  // }

  // const themeName = _themeName();

})();
