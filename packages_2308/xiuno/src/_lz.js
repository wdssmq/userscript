/* globals LZString jsyaml*/

// _lz.js | 使用 lz-string 压缩字符串
import { $, UM } from "./_base.js";
(() => {
  // 定义按钮及提示信息
  const $btnBad = $(" <a class=\"btn btn-primary\">BAD</a>");
  const strTip = "<p>此贴内容或签名不符合论坛规范已作屏蔽处理，请查看置顶贴，以下为原始内容备份。</p>";

  // 绑定点击事件
  $btnBad.css({ color: "#fff" }).click(function () {
    let um = UM.getEditor("message");
    let str = um.getContent();
    if (str.indexOf("#~~") > -1) {
      return;
    }
    let strCode = LZString.compressToBase64(str);
    um.setContent(strTip + `<p>#~~${strCode}~~#</p>`);
    console.log(LZString.decompressFromBase64(strCode));
    // let strDeCode = LZString.decompressFromBase64(strCode);
    // um.setContent(strCode + strDeCode);
  });

  // 放置按钮
  if ($("input[name=update_reason]").length > 0) {
    $("#submit").after($btnBad);
  }

  // 解码
  $("div.message").each(function () {
    let $secP = $(this).find("p:nth-child(2)");
    if ($secP.length == 0) {
      console.log("skip");
      return;
    }
    let str = $secP.html();
    if (str.indexOf("#~~") == -1) {
      return;
    }
    console.log(str);
    str = str.replace(/#~~(.+)~~#/, function (a, b) {
      console.log(arguments);
      let strDeCode = LZString.decompressFromBase64(b);
      console.log(strDeCode);
      return strDeCode;
    });
    $secP.after(str).remove();
  });
})();

