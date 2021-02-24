// ==UserScript==
// @name        [zblog]开发者工具（应用中心）
// @namespace   wdssmq.com
// @description 含搜索订单，附带隐藏未付订单，应用审核回显；
// @author      沉冰浮水
// @version     2.0
// @link        https://greasyfork.org/zh-CN/scripts/25662
// @include     https://app.zblogcn.com/zb_system/admin/edit.php*id=*
// @include     https://app.zblogcn.com/zb_users/plugin/AppBuy/shop/main.php*
// @include     https://app.zblogcn.com/?id=*
// @grant       none
// ==/UserScript==
// jshint       esversion:6
(function () {
  if (!window.jQuery) {
    return false;
  }
  const $ = window.jQuery;
  let TheHtml,
    intVdg = 0,
    rmbFgu = 0;
  let nDate = null;
  let oDate;
  $(".SubMenu").append(
    '<input id="search" style="float:left;margin-right: 2px;margin-top: 2px" type="text" value="">' +
      '<a href="javascript:;" id="js-search"><span class="m-left">搜索</span></a>'
  );
  $("#js-search").click(function () {
    // alert($("#search").val());
    fnRun($("#search").val());
  });
  fnHide("");
  function diff(now, old) {
    return parseInt((now - old) / (1000 * 60 * 60 * 24));
  }
  function fnHide(t) {
    $("tr").each(function () {
      TheHtml = $(this).html();
      if (/待付款/.test(TheHtml)) $(this).remove();
      if (t === "all") $(this).remove();
    });
  }
  function fnRun(q) {
    intVdg = 0;
    rmbFgu = 0;
    var RegPat = new RegExp(q + ".+已付款", "");
    // var RegPat = new RegExp(q, "");
    fnHide("all");
    fnAjax(1, RegPat);
  }
  function fnAjax(page, pat) {
    $.ajax({
      url:
        "https://app.zblogcn.com/zb_users/plugin/AppBuy/shop/main.php?page=" + page,
      type: "get",
      success: function (data) {
        // if (/已付款/.test(data) && page < 3) {
        if (/已付款/.test(data)) {
          $(data)
            .find("#divMain2 table tr")
            .each(function () {
              TheHtml = $(this)
                .html()
                .replace(/[\n\s]+/g, " ");
              if (pat.test(TheHtml) === true) {
                var match = TheHtml.match(/<td>([^<]+)<\/td> <td>已付款<\/td>/);
                oDate = new Date(Date.parse(match[1]));
                if (nDate === null) nDate = oDate;
                intVdg++;
                var Match = TheHtml.match(/\(-?([\d\.]+)\)/);
                // console.log(Match,page);
                rmbFgu += parseFloat(Match[1]) * 100;
                $("table:not(#tbStatistic) tbody").append(
                  "<tr>" + TheHtml + "</tr>\n"
                );
              }
            });
          page++;
          fnAjax(page, pat);
        } else {
          var numDays = diff(nDate, oDate);
          var averDay = (rmbFgu / numDays / 100).toFixed(2);
          var averMon = (rmbFgu / (numDays / 30) / 100).toFixed(2);
          $("table:not(#tbStatistic) tbody").prepend(
            '<tr><td colspan ="3"></td><td>' +
              intVdg +
              "</td><td>" +
              rmbFgu / 100 +
              "</td><td>" +
              averDay +
              "/天 | " +
              averMon +
              "/30天</td><td>天数：" +
              numDays +
              "</td><td></td><td></td></tr>"
          );
        } // fnHide("");
      },
    });
  }
})();
//前台编辑链接
(() => {
  if (!window.jQuery) {
    return false;
  }
  const $ = window.jQuery;
  if ($(".app-content").text() === "") return false;
  const edtLink =
    "https://app.zblogcn.com/zb_system/admin/edit.php" +
    location.search +
    "&act=ArticleEdt";
  const domLink = $(
    '<a title="编辑" target="_blank" href="' + edtLink + '">编辑</a>'
  );
  domLink
    .css({
      color: "darkgray",
      "font-size": "14px",
      "padding-left": "0.5em",
    })
    .hover(
      function () {
        $(this).css({
          color: "#d60000",
        });
      },
      function () {
        $(this).css({
          color: "darkgray",
        });
      }
    );
  $(".app-header-detail h3").append(domLink);
})();

/////////////
// Ajax回显自动审核
(() => {
  if (!window.jQuery) {
    return false;
  }
  const $ = window.jQuery;
  let $p = $("#response3 dl p");
  if ($p.find("a").length == 1) {
    return;
  }
  function fnGet(cb) {
    $.ajax({
      url: location.href,
      type: "get",
      success: function (data) {
        let $el = $(data).find("#response3 dl a");
        if ($el.attr("href")) {
          cb($el.attr("href"));
        }
        console.log($el.attr("href"));
      },
    });
  }
  let i = 43;
  let t = setInterval(() => {
    $p.html(`自动审核中，请稍侯${i}`);
    i--;
    if (i % 13 == 0) {
      fnGet((href) => {
        $p.html(
          `自动审核完毕，<a target="_blank" href="${href}">请点击此处查看。</a>`
        );
        clearInterval(t);
      });
    }
    if (i == 0) {
      i = 47;
    }
  }, 1000);
})();
