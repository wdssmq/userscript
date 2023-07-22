import { _log, $, curUrl } from "./_base";
import _mdToc from "./_mdToc";

$(function () {
  _mdToc();
  // 添加编辑按钮
  $(".js-edt")
    .each(function () {
      const id = $(this).data("id");
      const type = $(this).data("type");
      const act = type ? "PageEdt" : "ArticleEdt";
      $(this).html(
        `[<a title="编辑" rel="external" href="${window.bloghost}zb_system/cmd.php?act=${act}&id=${id}">编辑</a>]`,
      );
    })
    .removeClass("is-hidden hidden");

  // 清理评论失效网址
  $(".cmt-tips").each(function () {
    const $this = $(this);
    const authName = $this.data("name");
    $this.append(
      ` <a class="cmt-edit" title="查找编辑" rel="external" href="${window.bloghost}zb_users/plugin/cmt2rss/main.php?act=update&read_getWord=${authName}" target="_blank">查找编辑</a>`,
    );
  });
  $(".cmt-edit").css({ color: "#175199" });

  // 设置文章为回收
  if (curUrl.indexOf("zblogcn.com") > -1) {
    return;
  }
  $("#edtTitle").after(
    "<a class=\"js-empty\" href=\"javascript:;\" title=\"设置为回收\"> 「设置为回收」</a>",
  );
  let editor_api = window.editor_api;
  $(".js-empty").click(function () {
    $("#edtTitle").val("回收");
    $("#edtTag").val("回收");
    $("#edtDateTime").datetimepicker("setDate", (new Date()));
    $("#cmbPostStatus").val("1");
    let strMore = "";
    if (typeof window.EDITORMD == "object") {
      strMore = "\n\n<!--more-->";
    } else {
      strMore = "<hr class=\"more\" />";
    }
    let oBody = "回收" + strMore;
    editor_api.editor.content.put(oBody);
    editor_api.editor.intro.put("");
  });
});
