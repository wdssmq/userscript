import { _log, $ } from "./_base";

// Ajax 回显自动审核
(() => {
  if ($ === null) return;
  let $p = $("#response3 dl p");
  if ($p.length == 0 || $p.find("a").length == 1) {
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
          `自动审核完毕，<a target="_blank" href="${href}">请点击此处查看。</a>`,
        );
        clearInterval(t);
      });
    }
    if (i == 0) {
      i = 47;
    }
  }, 1000);
})();
