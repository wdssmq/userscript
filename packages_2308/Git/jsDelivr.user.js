// ==UserScript==
// @name         「GitHub」获取文件的 jsDelivr 地址
// @namespace    https://www.wdssmmq.com/
// @version      0.1
// @author       沉冰浮水
// @description  获取项目文件的 CDN 地址
// @need         https://github.com/EnixCoda/Gitako
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @match        https://github.com/*/*
// @icon         https://github.com/favicon.ico
// @grant        none
// ==/UserScript==

/** jshint esversion:6 **/
(function () {
  "use strict";
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
  // 移除指定元素
  function fnRemove(e) {
    const $e = typeof e === "string" ? $n(e) : e;
    $e.parentNode.removeChild($e);
  }
  // 添加子节点到指定元素
  function fnAppendChild($ne, e) {
    const $e = typeof e === "string" ? $n(e) : e;
    $e.appendChild($ne);
  }
  // 添加元素指定元素前
  function fnAppendBefore($ne, e) {
    const $e = typeof e === "string" ? $n(e) : e;
    $e.parentNode.insertBefore($ne, $e);
  }
  // 添加元素指定元素后
  function fnAppendAfter($ne, e) {
    const $e = typeof e === "string" ? $n(e) : e;
    $e.parentNode.insertBefore($ne, $e.nextSibling);
  }
  function fnGetCDNUrl(url) {
    const arrMap = [
      ["https://github.com/", "https://fastly.jsdelivr.net/gh/"],
      ["/blob/", "@"],
    ];
    let cdnUrl = url;
    arrMap.forEach((line) => {
      cdnUrl = cdnUrl.replace(line[0], line[1]);
    });
    return cdnUrl;
  }
  //
  document.addEventListener("mouseover", function (e) {
    const className = e.target.className;
    // console.log(className);
    if (className != "node-item" && className != "node-item focused") {
      return;
    }
    // 移除已有链接
    if ($n(".files")) {
      const $list = $n(".files").querySelectorAll(".node-item-cdn");
      if ($list.length > 0) {
        $list.forEach((el) => {
          fnRemove(el);
        });
      }
    }
    // 事件元素
    const $cur_a = e.target;
    // 跳过目录
    if ($cur_a.querySelectorAll(".ChevronRight").length > 0) {
      return;
    }
    // 当前链接
    const curURL = $cur_a.href;
    // 构造 CDN 链接元素
    const $cdn_a = document.createElement("a");
    const cdnUrl = fnGetCDNUrl(curURL);
    $cdn_a.className = "node-item node-item-cdn";
    $cdn_a.title = `${$cur_a.innerText}`;
    $cdn_a.href = cdnUrl;
    $cdn_a.setAttribute("target", "_blank");
    $cdn_a.innerHTML = "「cdn」";
    // 应用元素到页面中
    fnAppendAfter($cdn_a, $cur_a);

    // // 获取现有样式
    // const curStyle = window.getComputedStyle($cur_a);
    // const curStyleLeft = curStyle.getPropertyValue("padding-left");

    // 设置样式
    $cdn_a.setAttribute("style", $cur_a.getAttribute("style"));
    $cdn_a.style.left = null;
    $cdn_a.style.right = "0px";
    $cdn_a.style.width = "auto";

    // https://github.com/wdssmq/wdssmq/blob/main/doc/qr-ali.png
    // https://cdn.jsdelivr.net/gh/wdssmq/wdssmq@main/doc/qr-ali.png
  }, false);
})();
