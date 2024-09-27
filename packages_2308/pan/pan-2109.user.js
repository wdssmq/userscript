// ==UserScript==
// @name        「废弃」度盘接生成（QQ 群：189574683）
// @namespace   wdssmq
// @version     1.3.5
// @author      沉冰浮水
// @description 分享资源后生成带描述的分享文本或 html 代码。
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.com/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @url         https://greasyfork.org/zh-CN/scripts/6505
// @include     https://pan.baidu.com/disk/home*
// @include     https://send.firefox.com/
// @grant       none
// ==/UserScript==
// jshint       esversion:6
(function () {
  if (location.host !== "pan.baidu.com") {
    return false;
  }
  if (!window.jQuery) {
    return false;
  }
  const $ = window.jQuery;
  $(document).delegate(".content", "mouseover", function () {
    if (!$(".has-create .share-url").length) {
      return;
    }
    $("div.description").hide();
    $(".share-dialog .create-link .create-success").css({
      top: 0,
    });
    $(".share-dialog .create-link .link-info").css({
      margin: "30px 0 16px",
    });
    let url = $(".link-info .share-url").val();
    let pwd = $(".link-info .share-password").val();
    let title = $(".dialog-header h3 .select-text")
      .text()
      .replace(/分享文件\(夹\):|文件上传|上传完成/g, "");
    let html =
      "<a href=\"" +
      url +
      "\" title=\"" +
      title +
      "\" target=\"_blank\" rel=\"nofollow\">" +
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
        "<div><textarea id=\"new-input\" readonly=\"readonly\" spellingcheck=\"false\">" +
          value
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;") +
          "</textarea></div>",
      );
      $("#new-input")
        .css({
          width: "100%",
          height: "6em",
          padding: "5px",
          border: "1px solid #e9e9e9",
          borderRadius: "4px",
        })
        .mouseover(function () {
          $(this).select();
        });
    }
  });
})();
