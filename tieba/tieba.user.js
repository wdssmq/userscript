// ==UserScript==
// @name         「水水」自用贴吧辅助
// @namespace    https://www.wdssmq.com/
// @version      1.0.1
// @author       沉冰浮水
// @description  置百丈玄冰而崩裂，掷须臾池水而漂摇。
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
// @match        https://tieba.baidu.com
// @match        https://tieba.baidu.com/index.html
// @grant        none
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "tieba";

  const _warn = (...args) => console.warn(`[${gm_name}] |`, ...args);

  // -------------------------------------

  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }

  // -------------------------------------

  // 添加内容到指定元素后面
  function fnAfter(newEl, el) {
    el = typeof el === "string" ? $n(el) : el;
    el.parentNode.insertBefore(newEl, el.nextSibling);
  }

  // -------------------------------------

  // 元素变化监听
  const fnElChange = (el, fn = () => { }) => {
    const observer = new MutationObserver((mutationRecord, mutationObserver) => {
      // _log('mutationRecord = ', mutationRecord);
      // _log('mutationObserver === observer', mutationObserver === observer);
      fn(mutationRecord, mutationObserver);
      // mutationObserver.disconnect();
    });
    observer.observe(el, {
      // attributes: false,
      // attributeFilter: ["class"],
      childList: true,
      // characterData: false,
      subtree: true,
    });
  };

  const fnFixReply = () => {
    const $body = $n("body");
    // 判断封装
    const loadCheck = {
      t: null,
      check(text) {
        return text.indexOf("查看回复") > -1;
      },
      delay() {
        loadCheck.clearDelay();
        loadCheck.t = setTimeout(() => {
          location.reload();
        }, 1000);
      },
      clearDelay() {
        clearTimeout(loadCheck.t);
      },
      addLink() {
        // 创建一个新的导航链接
        const $u_notify_replay = document.createElement("li");
        $u_notify_replay.className = "category_item category_item_empty";
        $u_notify_replay.innerHTML = `<a class="j_cleardata" href="/i/sys/jump?type=replyme" target="_blank" data-type="reply">
          查看回复
      </a>
    `;
        //
        fnAfter($u_notify_replay, $n(".sys_notify .category_item"));
      },
    };

    // 监听页面改动
    fnElChange($body, () => {
      const $sys_notify = $n("div.u_notity_bd > ul");
      if (!$sys_notify) {
        return;
      }
      if (!loadCheck.check($sys_notify.textContent)) {
        loadCheck.addLink($sys_notify);
        // loadCheck.clearDelay()
        return;
      }
    });
  };

  try {
    fnFixReply();
  } catch (error) {
    _warn(error);
  }

  const fnMain = () => {
    // 导航设置
    const $sub_nav_list = $n(".sub_nav_list");
    if (!$sub_nav_list) {
      return;
    }
    // 宽度 100%
    $sub_nav_list.style.width = "100%";
    // 匹配「个性动态」元素
    const $nav_personal = $n("#nav-personal-wraper");
    _warn($nav_personal);
    // 创建一个新的导航链接
    const $nav_i = document.createElement("li");
    $nav_i.className = "nav-i-forum";
    $nav_i.innerHTML = `
    <a href="https://tieba.baidu.com/i/i/forum?&pn=2" class="nav-item-link" target="_blank">
      我关注的贴吧
    </a>
  `;
    $nav_i.style.float = "right";
    // 插入到导航栏
    fnAfter($nav_i, $nav_personal);


    /* // #right_wrap
    const $right_wrap = $n("#right_wrap");
    _warn($right_wrap)
    const $h3_i = document.createElement("h3");
    $h3_i.className = "right_title";
    $h3_i.innerHTML = `
      <a href="https://tieba.baidu.com/i/i/forum?&pn=2" class="right_title_link" target="_blank">
        我关注的贴吧
      </a>
    `;
    // 插入到侧栏
    fnAppendStart($h3_i, $right_wrap); */
  };

  try {
    fnMain();
  } catch (error) {
    _warn(error);
  }

})();
