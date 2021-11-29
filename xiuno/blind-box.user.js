// ==UserScript==
// @name         「xiuno」盲盒抽奖（QQ 群：189574683）
// @namespace    https://www.wdssmq.com/
// @version      0.1
// @description  Z-BlogPHP 盲盒抽奖
// @author       沉冰浮水
// @link     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @link     ----------------------------
// @match    https://bbs.zblogcn.com/thread-*.html
// @grant    none
// ==/UserScript==

/* jshint esversion:6 */
(async function () {
  "use strict";
  const $ = window.jQuery;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  await sleep(1300);

  // 数据信息
  const arrList = (() => {
    let json = $("code.language-javascript").text();
    json = json.replace(/\n\s+/g, "");
    return JSON.parse(json);
  })();

  console.log(arrList);

  const arrRlt = [];
  const max = 8;
  const setUsers = new Set();

  // 工具函数
  function fnCheckItemInArr(item, arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].appid === item.appid) {
        return true;
      }
    }
    return false;
  }

  function fnMatch2Number(match) {
    if (match.length > max) {
      match = location.pathname.match(/\d+/g);
    }
    return match.join("");
  }

  // 遍历回帖
  $("li.media").each(function () {
    // 数量判断
    if (arrRlt.length >= max) {
      return false;
    }
    // 用户名，正文
    const $username = $(this).find("span.username");
    const $message = $(this).find("div.message");
    // 签名移除
    $message.find(".user-signature").remove();
    $message.find(".blind-box").remove();
    // 内容
    let content = $message.text() || "";
    // 提取数字，不存在则返回
    const match = content.match(/\d+/g);
    if (match == null) {
      return;
    }

    // 用户名
    const username = $username.text();
    // 当前回帖的 pid
    const intPid = parseInt($(this).data("pid"));
    const number = fnMatch2Number(match) + intPid;
    // 取余
    const mod = number % arrList.length;
    const pick = arrList[mod];
    // 组织数据
    let strRlt = `<blockquote class="blockquote blind-box"><p><b>-num- - ${
      pick.appname
    } | ${pick.appid} | ${fnMatch2Number(
      match
    )} + ${intPid} = ${number}</b></p></blockquote>`;

    // 判断是否已经存在
    if (fnCheckItemInArr(pick, arrRlt) || setUsers.has(username)) {
      strRlt = `<blockquote class="blockquote blind-box"><b>重复</b></blockquote>`;
    } else {
      // 添加
      arrRlt.push(pick);
      // 每个用户有一次有效
      setUsers.add(username);
      // 序号
      strRlt = strRlt.replace(/\-num\-/g, arrRlt.length);
    }

    // 显示
    $message.append(strRlt);
  });
  console.log("抽中应用");
  console.log(arrRlt);
})();
