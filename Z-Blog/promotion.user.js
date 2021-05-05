// ==UserScript==
// @name        [Z-Blog] - 应用中心促销工具
// @namespace   https://www.wdssmq.com/
// @author      沉冰浮水
// @version     1.1
// @description 用于辅助设置促销选项
// @link   ----------------------------
// @link   https://github.com/wdssmq/userscript
// @link   https://afdian.net/@wdssmq
// @link   https://greasyfork.org/zh-CN/users/6865-wdssmq
// @link   ----------------------------
// @include     https://tieba.baidu.com/p/*
// @include     https://app.zblogcn.com/?id=*
// @include     https://app.zblogcn.com/zb_users/plugin/AppBuy/shop/promotion.php
// @include     https://app.zblogcn.com/zb_users/plugin/AppBuy/shop/promotion_edit.php*
// @require     https://greasyfork.org/scripts/418543-pushbullet/code/PushBullet.js?version=879737
// @run-at      document-end
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// ==/UserScript==
/*jshint esversion:6 */

// https://tieba.baidu.com/p/*
(function () {
  if (location.host !== "tieba.baidu.com") {
    return;
  }
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
  function fnReplace(html, post_id) {
    const fnRegxCB = function () {
      // console.log(arguments); // 输出全部参数，这个对象并不是数组
      // 转换成数组
      const arrArgs = Array.prototype.slice.call(arguments);
      // 命名分组被放在最后一项中，pop()方法会从原数组中删除最后一项并返回
      const data = arrArgs.pop();
      // 调试输出
      console.log(arrArgs, data);
      // 字符转数字
      post_id = parseInt(post_id);
      data.app_id = parseInt(data.app_id);
      // 取余+3，3<=hash<=9
      const hash = ((post_id + data.app_id) % 7) + 3;
      console.log(hash, post_id + data.app_id);
      return `<a href="${data.url}#${hash}-${post_id}" ${data.attrs}>${data.url}#${hash}-${post_id}</a>`;
    };
    return html.replace(
      /<a href="[^"]+" (?<attrs>[^>]+)>(?<url>https:\/\/app.zblogcn.com\/\?id=(?<app_id>\d+))[^<]*<\/a>/,
      fnRegxCB
    );
    // 不需要回调处理的话是这样↓
    // return html.replace(
    //   /<a href="[^"]+" (?<attrs>[^>]+)>(?<url>https:\/\/app.zblogcn.com\/\?id=(?<id>\d+))[^<]*<\/a>/,`<a href="$<url>#${post_id}" $<attrs>>$<url>#${post_id}</a>`
    // );
  }
  function fnCheckRun(post_id) {
    const postList = $na(".d_post_content");
    for (let x = 0; x < postList.length; x++) {
      // console.log(postList[x].innerHTML);
      postList[x].innerHTML = fnReplace(postList[x].innerHTML, post_id);
    }
  }

  // "/p/7145891522"
  const pathname = location.pathname;
  // 7145891522
  const post_id = pathname.replace("/p/", "");

  fnCheckRun(post_id);
})();

// https://app.zblogcn.com/?id=*
(function () {
  if (
    location.host !== "app.zblogcn.com" ||
    location.pathname !== "/" ||
    location.hash === "" ||
    location.search.indexOf("?id=") === -1
  ) {
    return;
  }
  // 获取jQuery
  const $ = window.jQuery || unsafeWindow.jQuery;
  const $el = $(".app-download");
  // 已经处于促销状态
  if ($el.find("s").length > 0) {
    return;
  }

  // 当前时间
  const curTime = new Date();
  // 获取时间戳
  // const timestamp = Date.parse(curTime) / 1000;
  const timestamp = parseInt(curTime.valueOf() / 1000);
  // 时间戳转换成天数
  const daystamp = parseInt(timestamp / 86400);
  console.log(curTime, daystamp);

  // 用于判断时间间隔的变量
  const ckeName = `GM_${location.search}`.replace(/\?|=/g, ""); // cookie名过滤
  const ckeValue = parseInt(daystamp / 4).toString();

  if (zbp.cookie.get(ckeName) == ckeValue) {
    return;
  }
  console.log(ckeName, zbp.cookie.get(ckeName));

  const curPrice = $el
    .find("em")
    .html()
    .replace(/[^\d\.]/g, "");
  if (curPrice <= 5.93) {
    return;
  }
  console.log(curPrice);

  $el
    .find("em")
    .after(
      `<a class="gm-set-pm" href="/zb_users/plugin/AppBuy/shop/promotion.php#${location.search}${location.hash}">设置促销</a>`
    );
  $(".gm-set-pm").click(function (e) {
    zbp.cookie.set(ckeName, ckeValue, 7);
  });
})();

// promotion.php
(function () {
  if (location.pathname.indexOf("AppBuy/shop") === -1) {
    return;
  }
  // 获取jQuery
  const $ = window.jQuery || unsafeWindow.jQuery;

  const lsName = "gm_pm_data";
  const lsData = localStorage[lsName]
    ? JSON.parse(localStorage[lsName])
    : { arrApps: [], arrAppNames: {}, PbSend: {} };

  console.log(lsData);

  // 承接前台跳转
  let app_id_hash = null;
  let post_id_hash = null;
  let disc_hash = null;
  if (location.hash !== "") {
    // "#?id=2027#7-7145891522"
    const match = location.hash.match(
      /#\?id=(?<app_id>\d+)#(?<disc>\d)-(?<post_id>\d+)/
    );
    console.log(match);
    app_id_hash = match.groups["app_id"];
    post_id_hash = match.groups["post_id"];
    disc_hash = match.groups["disc"];
    //
    lsData.app_id_hash = app_id_hash;
    lsData.post_id_hash = post_id_hash;
    lsData.disc_hash = parseInt(disc_hash);
  }

  // 接入PushBullet
  const objPB = window.PushBullet || {};
  objPB.APIKey = GM_getValue("pb_key", "");
  GM_registerMenuCommand("PushBullet鉴权Key", () => {
    const key = prompt("PushBullet鉴权Key:", objPB.APIKey);
    if (typeof key == "string") {
      GM_setValue("pb_key", key);
    }
  });
  objPB.skip = function () {
    console.log(arguments);
  };
  objPB.isGM = true;

  if (!objPB.APIKey) {
    $(".divHeader").append(' - <span class="star">未设置PushBullet</span>');
  }

  // 当前时间
  const curTime = new Date();
  // 获取时间戳
  // const timestamp = Date.parse(curTime) / 1000;
  const timestamp = parseInt(curTime.valueOf() / 1000);
  // 时间戳转换成天数
  const daystamp = parseInt(timestamp / 86400);
  console.log(curTime, daystamp);

  $("title").append(daystamp);

  // 工具函数
  function diff(n = 0, pubdate = null) {
    const intDiff = parseInt((curTime - pubdate) / (1000 * 60 * 60 * 24));
    // console.log(intDiff);
    if (intDiff >= n) {
      return true;
    } else {
      return false;
    }
  }
  function setDate(t, d) {
    t.setDate(t.getDate() + d);
    return t;
  }
  function setHours(t, h) {
    t.setHours(t.getHours() + h);
    return t;
  }
  function setTime(t, s) {
    t.setTime(t.getTime() + s * 1000);
    return t;
  }
  $("tr.color3>td:nth-of-type(3)").each(function () {
    let html = $(this).text();
    if (html == "草稿") {
      $(this).parent().remove();
    }
  });

  // 在表格页遍历内容
  let rltLog = "";
  $("tr.color3>td:nth-of-type(8)").each(function () {
    const html = $(this).html() || "1970-01-01 08:00:00";
    const appid = $(this).parent().find("td:first-child").text();
    const appname = $(this).parent().find("td:nth-child(2)").text();
    const pm_type = $(this).parent().find("td:nth-child(6)").text();
    const pubdate = new Date(html.replace(/-/g, "/"));
    const modRlt = (daystamp + appid) % 593;
    if (diff(appid % 7, pubdate) || appid == app_id_hash) {
      const bolRlt = [13, 29, 37, 53, 61, 73, 89, 109, 137, 149, 157, 173, 181, 193, 229, 241, 257, 269, 277, 293, 313, 337, 349, 373, 389, 421, 433, 449, 509, 541, 557, 569, 577].indexOf(modRlt);
      if (bolRlt > -1) {
        lsData.arrApps.push(appid);
        lsData.arrAppNames[appid] = appname;
        $(this)
          .parent()
          .css({
            color: "red",
          })
          .insertAfter("table tbody tr:first-child");
      }
      console.log("-", appname, parseInt(appid), pm_type, modRlt);
    } else if (!diff(0, pubdate)) {
      console.log("+", appname, parseInt(appid), pm_type, modRlt);
      const strStart = $(this).prev().html();
      const sDate = new Date(strStart.replace(/-/g, "/"));
      const cntDown = parseInt((sDate / 1000 - timestamp) / 60);
      // 理论上可以推送的QQ群的
      const obj = {
        type: 1,
        uin: 189574683,
      };
      obj.msg = `https://app.zblogcn.com/?id=${appid}`;
      if (cntDown > 0) {
        obj.msg += `\n「${appname}」「${cntDown}」分钟后开始促销；`;
      } else {
        obj.msg += `\n「${appname}」促销中；`;
      }
      rltLog += `${obj.msg}\n\n`;
      const lstSend = parseInt(daystamp / 4);
      // lsData.arrApps.indexOf(appid) > -1
      if (!lsData.PbSend[appid] || lsData.PbSend[appid] !== lstSend) {
        objPB.APIKey &&
          objPB.push(
            "link",
            null,
            null,
            {
              title: `${appname}促销提醒 - 【${daystamp}】`,
              url: `https://app.zblogcn.com/?id=${appid}&t=${daystamp}`,
              body: `#PubWord ${appname}促销提醒 - 【${daystamp}】`,
            },
            function (err, res) {
              if (err) {
                throw err;
              } else {
                if (res.status > 200) {
                  alert("Token 过期");
                }
                console.log(res.status);
                console.log(res.response);
              }
            }
          );
        // 不能放在回调中- -
        lsData.PbSend[appid] = lstSend;
      }
      // lsData 中移除
      const tmp_set = new Set(lsData.arrApps);
      tmp_set.delete(appid);
      lsData.arrApps = Array.from(tmp_set);
      return;
    }
  }); // --遍历结束
  console.log(rltLog);
  // 写入ls
  if (location.pathname.indexOf("promotion.php") > -1) {
    localStorage[lsName] = JSON.stringify(lsData);
    return;
  }

  const appid = $("#appid").val();

  if (lsData.arrApps.indexOf(appid) === -1) {
    document.getElementById("active").value = 0;
  } else {
    document.getElementById("active").value = 1;
    $("textarea.description,#title").val(
      lsData.arrAppNames[appid].replace(/\[[^\]]+\]/g, "").trim()
    );
  }
  // 原价
  let star = $("#amount .star").text();
  star = star.match(/\d+\.\d+/) || star.match(/\d+/);
  star = star[0];
  console.log("原价是：%s", star);
  // 剩余数量
  let count = parseInt(document.getElementById("count").value);
  // 促销价
  let disc = (count % 7) / 7;
  if (star <= 13.7 && count % 7 > 0) {
    disc = ((count % 7) - 1) / 7;
  }
  $("#amount .star").after(`<span>${disc.toFixed(2)}</span>`);
  let fee = star * disc;

  let o_fee = star;
  if (lsData.app_id_hash === appid) {
    count += parseInt(lsData.disc_hash / 3);
    o_fee = (star - lsData.disc_hash) * (5 / 7);
    if (o_fee < 5.93) {
      o_fee = 5.93;
    }
    lsData.app_id_hash = null;
    // localStorage[lsName] = JSON.stringify(lsData);
  }
  fee = o_fee < fee ? o_fee : fee;

  document.getElementById("fee").value = fee;
  // if (document.getElementById("fee").value < 14) {
  //document.getElementById("fee").value = 5.93;
  // }
  document.getElementById("type").value = 3;
  document.getElementById("count").value = count == 0 ? 13 : count;
  unsafeWindow.checkType();

  let sDate = setTime(curTime, 59);
  $("#started").datepicker("setDate", sDate);
  let eDate = setHours(sDate, 37 + parseInt(count));
  $("#ended").datepicker("setDate", eDate);
  return;
})();
