// ==UserScript==
// @name         qBittorrent 管理脚本（QQ群：189574683）
// @namespace    http://沉冰浮水.tk/
// @version      0.2
// @author       沉冰浮水
// @description  通过 WebUI 的 API 批量替换 Tracker
// ----------------------------
// @link   https://greasyfork.org/zh-CN/scripts/391688
// @link   https://afdian.net/@wdssmq
// @link   https://github.com/wdssmq/userscript
// @link   https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @match        http://127.0.0.1:8080/
// @require      https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @grant        GM_xmlhttpRequest
// jshint        esversion:6
// ==/UserScript==

(function() {
  "use strict";
  "esversion: 6";
  /* jshint multistr:true */

  console.log("请备份%USERPROFILE%\\AppData\\Local\\qBittorrent");
  const hostUrl = location.href;
  const $ = window.$;
  // return;

  // 构建编辑入口
  $("#desktopNavbar>ul").append(
    '<li><a class="js-modal"><b>→批量替换Tracker←</b></a></li>'
  );
  let strHtml =
    '<div style="padding:13px 23px;">\
    <h2>分类：<h2><input class="js-input" type="text" name="category" style="width: 97%;"><br>\
    <h2>旧Trakcer：<h2><input class="js-input" type="text" name="origUrl" style="width: 97%;"><br>\
    <h2>新Tracker：<h2><input class="js-input" type="text" name="newUrl" style="width: 97%;"><br>\
    <hr>\
    <button class="js-replace">替换</button>\
    </div>';
  // 点击事件
  $("a.js-modal").click(function() {
    new MochaUI.Window({
      id: "js-modal",
      title: "批量替换Tracker",
      loadMethod: "iframe",
      contentURL: "",
      scrollbars: true,
      resizable: false,
      maximizable: false,
      closable: true,
      paddingVertical: 0,
      paddingHorizontal: 0,
      width: 500,
      height: 250
    });
    $("#js-modal_content").append(strHtml);
  });
  $(document).on("click", ".js-replace", function() {
    // alert($(".js-input[name=category]").val());
    let obj = {
      category: $(".js-input[name=category]").val(),
      origUrl: $(".js-input[name=origUrl]").val(),
      newUrl: $(".js-input[name=newUrl]").val()
    };
    let err = 0;
    Object.keys(obj).map(function(key) {
      if (obj[key].trim() === "") {
        err = `${key}不能为空`;
      }
    });
    if (err) {
      alert(err);
      return;
    }
    fnHttpGet(api.info, { category: obj.category }, function(data) {
      fnEdtList(data, obj.origUrl, obj.newUrl);
    });
    return;
  });

  // $(".js-replace").click(function() {

  // });

  // API List
  const api = {
    info: hostUrl + "api/v2/torrents/info",
    editTracker: hostUrl + "api/v2/torrents/editTracker"
  };

  // let strTest = "udp://tracker.publicbt.com:80/announce";

  // fnHttpGet(api.info, { category: "test" }, function(data) {
  //   fnEdtList(data, strTest, "http://tracker.publicbt.com:80/announce");
  // });

  function fnEdtList(arrTorrents, origUrl, newUrl) {
    arrTorrents.map(function(item) {
      console.log(item.hash);
      fnEdtTracker(item.hash, origUrl, newUrl);
    });
    // 计数略麻烦
    // alert(`替换完成${arrTorrents.length}个`);
  }

  function fnEdtTracker(hash, origUrl, newUrl) {
    fnHttpGet(api.editTracker, { hash, origUrl, newUrl });
  }

  //基础函数
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  function fnHttpGet(
    url,
    objPar = {},
    callback = function(data) {
      console.log(data);
    }
  ) {
    let strPar =
      Object.keys(objPar).length === 0 ? "": "?" + Object.keys(objPar)
            .map(function(key) {
              return (
                encodeURIComponent(key) + "=" + encodeURIComponent(objPar[key])
              );
            })
            .join("&");
    //console.log(url);
    GM_xmlhttpRequest({
      method: "GET",
      //data: JSON.stringify(data),
      url: url + strPar,
      headers: {
        "User-agent": window.navigator.userAgent,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      onload: function(responseDetail) {
        if (responseDetail.status === 200) {
          callback(JSON.parse(responseDetail.responseText));
        } else {
          console.log(responseDetail.status, responseDetail);
        }
      }
    });
  }
})();
