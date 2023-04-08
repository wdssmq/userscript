/* global showdown */

import { $, UM, UE, _log, curHref } from "./_base.js";

class GM_editor {
  $def;
  defEditor = null;
  htmlContent = "";
  $md;
  mdEditor = null;
  mdContent = "";
  defOption = {
    init($md) { },
    autoSync: false,
    curType: "html",
  };
  option = {};
  constructor(option) {
    this.option = Object.assign({}, this.defOption, option);
    this.init();
    this.option.init(this.$md);
    this.getContent("html").covert2("md").syncContent("md");
  }
  init() {
    const _this = this;
    this.$def = this.option.$defContainer || $(".edui-container");
    this.$md = this.createMdEditor();
    // 编辑器操作对象
    this.defEditor = this.option.defEditor || UM.getEditor("message");
    this.mdEditor = {
      // 内容变化时触发
      addListener(type, fn) {
        if (type === "contentChange") {
          // _log(_this.$md);
          _this.$md.find("#message_md").on("input", fn);
        }
      },
      // 获取内容
      getContent() {
        return _this.$md.find("#message_md").val();
      },
      // 写入内容
      setContent(content) {
        _this.$md.find("#message_md").text(content);
      },
    };
    if (this.option.autoSync) {
      this.defEditor.addListener("contentChange", () => {
        if (_this.option.curType === "md") {
          return;
        }
        this.getContent("html").covert2("md").syncContent("md");
      });
      this.mdEditor.addListener("contentChange", () => {
        if (_this.option.curType === "html") {
          return;
        }
        this.getContent("md").covert2("html").syncContent("html");
      });
    }
  }
  // 读取内容
  getContent(type = "html") {
    if (type === "html") {
      this.htmlContent = this.defEditor.getContent();
    } else if (type === "md") {
      this.mdContent = this.mdEditor.getContent();
    }
    return this;
  }
  // 封装转换函数
  covert2(to = "md") {
    const converter = new showdown.Converter();
    if (to === "md") {
      this.mdContent = converter.makeMarkdown(this.htmlContent);
    } else if (to === "html") {
      this.htmlContent = converter.makeHtml(this.mdContent);
    }
    return this;
  }
  // 封装同步函数
  syncContent(to = "md") {
    if (to === "md") {
      this.mdEditor.setContent(this.mdContent);
    } else if (to === "html") {
      this.defEditor.setContent(this.htmlContent, false);
    }
  }
  // 自动设置 #message_md 的高度
  autoSetHeight() {
    const $mdText = this.$md.find("#message_md");
    // 自动设置高度
    $mdText.height(0);
    $mdText.height($mdText[0].scrollHeight + 4);
    // 判断并绑定 input 事件
    if ($mdText.data("bindInput")) {
      return;
    }
    $mdText.data("bindInput", true);
    $mdText.on("input", () => {
      this.autoSetHeight();
    });
  }
  // 切换编辑器
  switchEditor() {
    this.$def.toggle();
    this.$md.toggle();
    // 根据结果设置 curType
    this.option.curType = this.$def.css("display") === "none" ? "md" : "html";
    // 切换后自动设置高度
    this.autoSetHeight();
  }
  // 创建 markdown 编辑器
  createMdEditor() {
    return $(`
      <div class="mdui-container" style="display: none;">
        <div class="mdui-body">
          <textarea id="message_md" name="message_md" placeholder="markdown" class="mdui-text"></textarea>
        </div>
      </div>
    `);
  }
}

GM_addStyle(`
  .is-pulled-right {
    float: right;
  }
  .mdui-container {
    border: 1px solid #d4d4d4;
    padding: 5px 10px;
  }
  .mdui-container:focus-within {
    border: 1px solid #4caf50;
  }
  .mdui-text {
    border: none;
    width: 100%;
    min-height: 300px;
    height: auto;
  }
  .mdui-text:focus,
  .mdui-text:focus-visible {
    outline: none;
    box-shadow: none;
  }
`);

const mainForBBS = () => {
  const gm_editor = new GM_editor({
    init($md) {
      $(".edui-container").after($md);
    },
    autoSync: true,
  });

  const btnSwitchEditor = `
  <button class="btn btn-primary" type="button" id="btnSwitchEditor">切换编辑器</button>
  `;

  // 判断是否有 name 为 fid 的 select
  if ($("select[name='fid']").length === 0) {
    // quotepid 后追加一行 .form-group
    $("input[name='quotepid']").after("<div class=\"form-group\"><span></span></div>");
  }


  // name 为 quotepid 的 input 下一行追加切换按钮
  $("input[name='quotepid'] + .form-group").addClass("d-flex justify-content-between").append(btnSwitchEditor);

  // 切换编辑器
  $("#btnSwitchEditor").click(() => {
    gm_editor.switchEditor();
  });
};

const mainForAPP = () => {
  const gm_editor = new GM_editor({
    init($md) {
      $("#editor_content").after($md);
      // const $mdText = $md.find("#message_md");
      // $mdText.height($("#editor_content").height() - 10);
      $(".mdui-body").css({
        paddingTop: ".3em",
      });
    },
    $defContainer: $("#editor_content"),
    defEditor: UE.getEditor("editor_content"),
    autoSync: true,
  });

  // # cheader 元素内部追加切换按钮
  $("#cheader").append(`
  <span class="is-pulled-right">「<a href="javascript:;" class="btn btn-primary" id="btnSwitchEditor" title="切换编辑器">切换编辑器</a>」</span>
`);


  // 切换编辑器
  $("#btnSwitchEditor").click(() => {
    gm_editor.switchEditor();
  });
};

(() => {
  if (curHref.indexOf("edit.php") > -1) {
    // _log(UE)
    const editor_api = window.editor_api || unsafeWindow.editor_api;
    editor_api.editor.content.obj.ready(mainForAPP);
  }
  if ($("textarea#message").length === 0) {
    return;
  }
  mainForBBS();
})();
