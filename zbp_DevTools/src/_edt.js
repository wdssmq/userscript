import { _log, $ } from './_base';
// 前台编辑链接
(() => {
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
