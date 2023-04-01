import { $, UM, _log } from "./_base.js";

class GM_editor {
  $def
  defEditor = null
  htmlContent = ""
  $md
  mdEditor = null
  mdContent = ""
  defOption = {
    init($md) { },
    autoSync: false,
    curType: "html"
  }
  option = {}
  constructor(option) {
    this.option = Object.assign({}, this.defOption, option);
    this.init();
    this.option.init(this.$md);
    this.getContent("html").covert2("md").syncContent("md");
  }
  init() {
    const _this = this;
    this.$def = $(".edui-container");
    this.$md = this.createMdEditor();
    // 获取 $def 的高度并设置给 $md
    this.$md.height(this.$def.height());
    this.$md.find("#message_md").height(this.$def.find(".edui-body-container").height());
    // 编辑器操作对象
    this.defEditor = UM.getEditor("message");
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
      }
    };
    if (this.option.autoSync) {
      this.defEditor.addListener("contentChange", () => {
        if (_this.option.curType === "md") {
          return;
        }
        this.getContent("html").covert2("md").syncContent("md")
      });
      this.mdEditor.addListener("contentChange", () => {
        if (_this.option.curType === "html") {
          return;
        }
        this.getContent("md").covert2("html").syncContent("html")
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
  // 切换编辑器
  switchEditor() {
    this.$def.toggle();
    this.$md.toggle();
    // 根据结果设置 curType
    this.option.curType = this.$def.css("display") === "none" ? "md" : "html";
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
  .mdui-text:focus-visible {
    outline: none;
  }
`)

const main = () => {
  const gm_editor = new GM_editor({
    init($md) {
      $(".edui-container").after($md);
    },
    autoSync: true
  });

  // .card-header 后追加切换按钮
  $(".card .card-header").append(`
  <button class="btn btn-primary" type="button" id="btnSwitchEditor">切换编辑器</button>
`);

  // 切换编辑器
  $("#btnSwitchEditor").click(() => {
    gm_editor.switchEditor();
  });
}

(() => {
  if ($("#message").length === 0) {
    return;
  }
  _log("editor.js");
  const $def = $(".edui-container");
  if ($def.length > 0) {
    main();
  }
})();
