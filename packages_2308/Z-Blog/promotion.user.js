// ==UserScript==
// @name        「Z-Blog」应用中心促销工具
// @namespace   https://www.wdssmq.com/
// @version     1.1
// @author      沉冰浮水
// @description 用于辅助设置促销选项
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.com/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @include     https://app.zblogcn.com/?id=*
// @include     https://app.zblogcn.com/zb_users/plugin/AppBuy/shop/promotion.php
// @include     https://app.zblogcn.com/zb_users/plugin/AppBuy/shop/promotion_edit.php*
// @require     https://greasyfork.org/scripts/418543-pushbullet/code/PushBullet.js?version=879737
// @require     https://cdn.bootcdn.net/ajax/libs/moment.js/2.29.1/moment.min.js
// @X-require     https://cdn.bootcdn.net/ajax/libs/moment.js/2.29.1/locale/zh-cn.min.js
// @run-at      document-end
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

/* jshint esversion:6 */
/* global zbp checkType moment */

// localStorage 封装
const lsObj = {
  setItem: function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: function (key, def = "") {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return def;
  },
};

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
      fnRegxCB,
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
    // eslint-disable-next-line no-useless-escape
    .replace(/[^\d\.]/g, "");
  if (curPrice <= 5.93) {
    return;
  }
  console.log(curPrice);

  $el
    .find("em")
    .after(
      `<a class="gm-set-pm" href="/zb_users/plugin/AppBuy/shop/promotion.php#${location.search}${location.hash}">设置促销</a>`,
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

  const gob = {
    curAppList: [],
    logAppList: null,
    load: function (logDef) {
      this.logAppList = lsObj.getItem("logAppList", logDef);
    },
    save: function () {
      lsObj.setItem("logAppList", this.logAppList);
    },
  };

  gob.load({ arrApps: [], arrAppNames: {}, PbSend: {} });

  console.log(gob.logAppList);

  // 承接前台跳转
  let app_id_hash = null;
  let post_id_hash = null;
  let disc_hash = null;
  if (location.hash !== "") {
    // "#?id=2027#7-7145891522"
    const match = location.hash.match(
      /#\?id=(?<app_id>\d+)#(?<disc>\d)-(?<post_id>\d+)/,
    );
    console.log(match);
    app_id_hash = match.groups["app_id"];
    post_id_hash = match.groups["post_id"];
    disc_hash = match.groups["disc"];
    //
    gob.logAppList.app_id_hash = app_id_hash;
    gob.logAppList.post_id_hash = post_id_hash;
    gob.logAppList.disc_hash = parseInt(disc_hash);
  }

  // 接入 PushBullet
  const objPB = window.PushBullet || {};
  objPB.APIKey = GM_getValue("pb_key", "");
  GM_registerMenuCommand("PushBullet 鉴权 Key", () => {
    const key = prompt("PushBullet 鉴权 Key:", objPB.APIKey);
    if (typeof key == "string") {
      GM_setValue("pb_key", key);
    }
  });
  objPB.skip = function () {
    console.log(arguments);
  };
  objPB.isGM = true;

  if (!objPB.APIKey) {
    $(".divHeader").append(" - <span class=\"star\">未设置 PushBullet</span>");
  }

  // 当前时间
  const curTime = new Date();

  // 获取时间戳
  // const timestamp = Date.parse(curTime) / 1000;
  const timestamp = parseInt(curTime.valueOf() / 1000);

  // 时间戳转换成天数
  const daystamp = parseInt(timestamp / 86400);

  console.log(curTime.toLocaleString(), daystamp);

  $("title").append(daystamp);

  // 工具函数
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

  // 移除草稿项
  $("tr.color3>td:nth-of-type(3)").each(function () {
    let html = $(this).text();
    if (html == "草稿") {
      $(this).parent().remove();
    }
  });

  // 判断应用是否选中
  function fnCheckAPP(appid, daystamp) {
    for (let i of [-1, 0, 1]) {
      const modRlt = (daystamp + appid + i) % 593;
      const bolRlt = [
        13, 29, 37, 53, 61, 73, 89, 109, 137, 149, 157, 173, 181, 193, 229, 241,
        257, 269, 277, 293, 313, 337, 349, 373, 389, 421, 433, 449, 509, 541,
        557, 569, 577,
      ].indexOf(modRlt);
      if (bolRlt > -1) {
        return true;
      }
    }
    return false;
  }

  // 在表格页遍历内容
  let rltLog = "";
  $("tr.color3>td:nth-of-type(8)").each(function () {
    // console.log("---");

    const html = $(this).html() || "1970-01-01 08:00:00";
    const appid = $(this).parent().find("td:first-child").text();
    const appname = $(this).parent().find("td:nth-child(2)").text();
    const pmType = $(this).parent().find("td:nth-child(6)").text();
    const expTime = new Date(html.replace(/-/g, "/"));
    const diffTime = parseInt((expTime - curTime) / (1000 * 60 * 60 * 24));
    const logData = {
      appname,
      // daystamp,
      appid: parseInt(appid),
      // expTime: expTime.toLocaleDateString(),
      // diffTime,
      // pmType,
    };

    // console.log("-", logData);

    gob.curAppList.push(logData);

    if (
      (diffTime < 0 && fnCheckAPP(appid, daystamp + diffTime)) ||
      diffTime < -73
    ) {
      gob.logAppList.arrApps.push(appid);
      gob.logAppList.arrAppNames[appid] = appname;
      $(this)
        .parent()
        .css({
          color: "red",
        })
        .insertAfter("table tbody tr:first-child");
    } else if (diffTime > 0) {
      // console.log("+", logData);

      // 开始时间
      const strStart = $(this).prev().html();
      const sDate = new Date(strStart.replace(/-/g, "/"));

      // 倒计时
      const cntDown = parseInt((sDate / 1000 - timestamp) / 60);

      // 理论上可以推送的QQ群的
      const obj = {
        type: 1,
        uin: 189574683,
        msg: "",
      };
      obj.msg = `https://app.zblogcn.com/?id=${appid}`;

      // msg 拼接
      if (cntDown > 0) {
        obj.msg += `\n「${appname}」「${cntDown}」分钟后开始促销；`;
      } else {
        obj.msg += `\n「${appname}」促销中；`;
      }
      rltLog += `${obj.msg}\n\n`;

      // 指定时间周期内只发送一次
      const lstSend = parseInt(daystamp / 4);

      if (
        !gob.logAppList.PbSend[appid] ||
        gob.logAppList.PbSend[appid] !== lstSend
      ) {
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
            },
          );

        // 标记发送；不能放在回调中 - -；
        gob.logAppList.PbSend[appid] = lstSend;
      }

      // gob.logAppList 中移除
      const tmp_set = new Set(gob.logAppList.arrApps);
      tmp_set.delete(appid);
      gob.logAppList.arrApps = Array.from(tmp_set);
      return;
    }
  }); // --遍历结束

  console.log(rltLog);

  // console.log(gob.curAppList);

  // console.log(JSON.stringify(gob.curAppList));

  // 写入 ls
  if (location.pathname.indexOf("promotion.php") > -1) {
    gob.save();
    return;
  }

  // 双 11 促销
  const curMMDD = parseInt(moment().format("MMDD"));
  let is1111 = curMMDD > 1025 && curMMDD < 1111 ? true : false;

  const appid = $("#appid").val();

  if (gob.logAppList.arrApps.indexOf(appid) === -1) {
    document.getElementById("active").value = 0;
  } else {
    document.getElementById("active").value = 1;
    $("textarea.description,#title").val(
      gob.logAppList.arrAppNames[appid].replace(/\[[^\]]+\]/g, "").trim(),
    );
  }

  // 原价
  let star = $("#amount .star").text();
  star = star.match(/\d+\.\d+/) || star.match(/\d+/);
  star = star[0];
  console.log("原价是：%s", star);

  if (is1111) {
    document.getElementById("active").value = 1;
    if (star < 6) {
      // 1.1
      document.getElementById("type").value = 6;
    } else if (star < 15) {
      // 对折
      document.getElementById("type").value = 4;
    } else if (star < 40) {
      // 11.11
      document.getElementById("type").value = 5;
    } else {
      // 对折
      document.getElementById("type").value = 4;
    }
    checkType();
    return;
  }

  // 剩余数量
  let count = parseInt(document.getElementById("count").value);

  // 促销价
  let disc = (count % 7) / 7;
  $("#amount .star").after(`<span>${disc.toFixed(2)}</span>`);
  let fee = star * disc;

  fee = fee > 3.7 ? fee - 3.7 : fee;

  // let o_fee = star;
  // if (gob.logAppList.app_id_hash === appid) {
  //   count += parseInt(gob.logAppList.disc_hash / 3);
  //   o_fee = (star - gob.logAppList.disc_hash) * (5 / 7);
  //   if (o_fee < 5.93) {
  //     o_fee = 5.93;
  //   }
  //   gob.logAppList.app_id_hash = null;
  //   // localStorage[lsName] = JSON.stringify(gob.logAppList);
  // }
  // fee = o_fee < fee ? o_fee : fee;

  document.getElementById("fee").value = fee.toFixed(2);
  document.getElementById("type").value = 3;
  document.getElementById("count").value = count == 0 ? 13 : count;
  unsafeWindow.checkType();

  let sDate = setTime(curTime, 59);
  $("#started").datepicker("setDate", sDate);
  let eDate = setHours(sDate, 37 + parseInt(count));
  $("#ended").datepicker("setDate", eDate);
  return;
})();
