import { $, UM, _log } from "./_base.js";
// 引入元素插入
(() => {
  if (typeof UM === "undefined") {
    return;
  }

  // 引用标签插入封装
  function fnBlockQuote() {
    const umObj = UM.getEditor("message");
    if (!umObj.isFocus()) {
      umObj.focus(true);
    }
    const addHTML = "<blockquote class=\"blockquote\"><p><br></p></blockquote><p><br></p>";
    // umObj.execCommand("insertHtml", addHTML);
    umObj.setContent(addHTML, true);
  }

  // 添加引用按钮
  $("head").append("<style>.edui-icon-blockquote:before{content:\"\\f10d\";}");
  (() => {
    const $btn = $.eduibutton({
      icon: "blockquote",
      click: function() {
        fnBlockQuote();
      },
      title: UM.getEditor("message").getLang("labelMap")["blockquote"] || "",
    });
    $(".edui-btn-name-insertcode").after($btn);
  })();

  // 自动排版函数封装
  function fnAutoFormat() {
    const umObj = UM.getEditor("message");
    let strHTML = umObj.getContent();
    strHTML = strHTML.replace(
      /<blockquote>/g,
      "<blockquote class=\"blockquote\">",
    );
    // 第二个参数为 true 表示追加；
    umObj.setContent(strHTML, false);
  }

  // 添加自动排版按钮
  $("head").append("<style>.edui-btn-auto-format:before{content:\"fix\";}");
  (() => {
    const $btn = $.eduibutton({
      icon: "auto-format",
      click: function() {
        fnAutoFormat();
      },
      title: "自动排版",
    });
    $(".edui-btn-name-insertcode").after($btn);
  })();
})();
