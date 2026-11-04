// ==UserScript==
// @name         bilibili-chat
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  消除聊天群左侧的空黑区块
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.com/a/wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://live.bilibili.com/*
// @grant        none
// ==/UserScript==

/* eslint-disable */

(function () {
  'use strict';

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = "/* 当直播间未开播时，限制主体内容最大宽度并居中显示。 */\n.app-body:has(.rows-closedown) {\n  max-width: 1080px;\n  margin-inline: auto;\n}\n\n/* 左栏与主父容器等宽 */\n.live-room-app:has(.rows-closedown) .player-and-aside-area>.player-ctnr {\n  width: 100% !important;\n}\n\n/* 聊天区块定位及宽度调整 */\n.live-room-app:has(.rows-closedown) .player-and-aside-area>.aside-area {\n  left: var(--chat-left) !important;\n  top: var(--chat-top) !important;\n  width: 100% !important;\n}\n\n/* 隐藏占位画面但保留其尺寸，避免播放器与聊天区高度塌缩。 */\n.live-room-app:has(.rows-closedown) .fullscreen-container-paddingbox {\n  visibility: hidden !important;\n}\n\n";
  styleInject(css_248z);

  // 将播放器占位框的位置同步为未开播布局的定位基准。
  function syncChatPosition() {
    const layout = document.querySelector(".player-and-aside-area");
    const padding = layout?.querySelector(".fullscreen-container-paddingbox");
    if (!layout || !padding) {
      return false;
    }

    const layoutRect = layout.getBoundingClientRect();
    const paddingRect = padding.getBoundingClientRect();
    layout.style.setProperty("--chat-left", `${paddingRect.left - layoutRect.left}px`);
    layout.style.setProperty("--chat-top", `${paddingRect.top - layoutRect.top}px`);
    return true;
  }

  const resizeObserver = new ResizeObserver(syncChatPosition);

  // 等待直播区挂载后初始化，并在容器尺寸变化时重新同步位置。
  function observeChatPosition() {
    if (!syncChatPosition()) {
      return false;
    }

    resizeObserver.disconnect();
    resizeObserver.observe(document.querySelector(".player-and-aside-area"));
    resizeObserver.observe(document.querySelector(".fullscreen-container-paddingbox"));
    return true;
  }

  if (!observeChatPosition()) {
    const observer = new MutationObserver(() => {
      if (observeChatPosition()) {
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

})();
