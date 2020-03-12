// ==UserScript==
// @name        度盘、火狐send链接生成（QQ群：189574683）
// @namespace   wdssmq
// @version     1.3.5
// @description 分享资源后生成带描述的分享文本或html代码。
// @author      沉冰浮水
// @url         https://greasyfork.org/zh-CN/scripts/6505
// @include     https://pan.baidu.com/disk/home*
// @include     https://send.firefox.com/
// @grant       none
// ==/UserScript==
/*jshint esversion: 6 */
(function() {
  if (location.host !== "pan.baidu.com") {
    return false;
  }
  if (!window.jQuery) {
    return false;
  }
  const $ = window.jQuery;
  $(document).delegate(".content", "mouseover", function() {
    if (!$(".has-create .share-url").length) {
      return;
    }
    $("div.description").hide();
    $(".share-dialog .create-link .create-success").css({
      top: 0
    });
    $(".share-dialog .create-link .link-info").css({
      margin: "30px 0 16px"
    });
    let url = $(".link-info .share-url").val();
    let pwd = $(".link-info .share-password").val();
    let title = $(".dialog-header h3 .select-text")
      .text()
      .replace(/分享文件\(夹\):|文件上传|上传完成/g, "");
    let html =
      '<a href="' +
      url +
      '" title="' +
      title +
      '" target="_blank" rel="nofollow">' +
      url +
      "</a>";
    let value = "<p>度盘下载：" + html + " 提取密码：" + pwd + "</p>";
    if (
      $("#new-input").length === 0 &&
      $(".share-url-border").length > 0 &&
      url
    ) {
      console.log(url, pwd, title);
      //  $('.create-success').html(html);
      //  $('.create-success').html([title,url,pwd].join("|"));
      //  $('.url').after('<div><input id="new-input" class="share-url" type="text" value="' + value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') + '" readonly="readonly" spellingcheck="false"></div>');
      $(".url").after(
        '<div><textarea id="new-input" readonly="readonly" spellingcheck="false">' +
          value
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;") +
          "</textarea></div>"
      );
      $("#new-input")
        .css({
          width: "100%",
          height: "6em",
          padding: "5px",
          border: "1px solid #e9e9e9",
          borderRadius: "4px"
        })
        .mouseover(function() {
          $(this).select();
        });
    }
  });
})();
(() => {
  return;
  "use strict";
  if (location.host !== "send.firefox.com") {
    return false;
  }
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }
  function fnOptionSelect(el, val) {
    let $el = $n(el);
    let aOptions = $n(el).options;
    for (let i = 0; i < aOptions.length; i++) {
      if (aOptions[i].value == val) {
        aOptions[i].selected = true;
      } else {
        aOptions[i].selected = false;
      }
    }
  }
  $n("body").addEventListener(
    "mouseover",
    function(e) {
      let $el = e.target;
      if ($el.parentNode.id === "wip") {
        if ($el.parentNode.dataset.done && $el.parentNode.dataset.done == 1) {
          return;
        }        
        fnOptionSelect("#expire-after-dl-count-select", 50);
        fnOptionSelect("#expire-after-time-select", 604800);
        // $n("#expire-after-dl-count-select").value = 50;
        // $n("#expire-after-time-select").value = 604800;
        //             $n("#expire-after-dl-count-select").change();
        //             $n("#expire-after-time-select").change();
        $el.parentNode.dataset.done = 1;
      }
    },
    false
  );
  $n("body").addEventListener(
    "mouseover",
    function(e) {
      let $el = e.target;
      if ($el.id === "share-url" || $el.title === "复制链接") {
        if ($n("p").dataset.done && $n("p").dataset.done == 1) {
          return;
        }
        let url = $n("#share-url").value;
        $n("p").innerHTML += "\n";
        $n("p").innerHTML += url;
        $n("#share-url").value = $n("p").innerHTML;
        $n("p").dataset.done = 1;
      }
    },
    false
  );
})();
