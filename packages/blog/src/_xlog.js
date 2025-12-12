import { $n, _log, fnElChange } from "./_base";
import { gob } from "./_gob";

function fnXLog() {
  _log("[fnXLog()]");
  gob.$body = $n("body");

  gob.getPost = (_record, Observer) => {
    const $cmContent = $n(".cm-content");
    if (!$cmContent) {
      return;
    }
    gob.content = $cmContent.textContent;
    gob.yml2json();
    if (Object.keys(gob.doc).length > 0) {
      // _log("[gob.getPost()]\n", gob.content);
      // _log("[gob.getPost()]\n", gob.doc);
      gob.$title.value = gob.doc.title;
      gob.$slug.value = gob.doc.alias;
      // 触发 change 事件
      gob.$title.dispatchEvent(new Event("change"));
      gob.$slug.dispatchEvent(new Event("change"));
      gob.title = gob.doc.title;
      gob.slug = gob.doc.alias;
      Observer.disconnect();
    }
  };

  gob.genPreFix = () => {
    const tpl = `
本文原始链接如下：

> {title}
>
> [https://www.wdssmq.com/post/{slug}.html](https://www.wdssmq.com/post/{slug}.html "{title}")
`.trim();
    const prefix = tpl.replace(/\{title\}/g, gob.title)
      .replace(/\{slug\}/g, gob.doc.alias);

    _log(prefix);
    // 判断是否已经存在 dialog
    let $dialog = $n("dialog");
    if ($dialog) {
      $dialog.remove();
    }

    // 弹出一个居中的 dialog  > textarea 显示内容
    $dialog = document.createElement("dialog");
    $dialog.setAttribute("open", "open");
    // padding
    $dialog.style.padding = "1rem";

    const $textarea = document.createElement("textarea");
    $textarea.setAttribute("rows", "10");
    $textarea.setAttribute("cols", "80");
    // 背景
    $textarea.style.backgroundColor = "rgb(var(--tw-color-slate-100)/var(--tw-bg-opacity))";
    // padding
    $textarea.style.padding = "1.3rem 1rem";
    $textarea.value = prefix;

    // 关闭按钮
    const $closeBtn = document.createElement("button");
    $closeBtn.textContent = "关闭";
    // 添加 CSS
    $closeBtn.classList.add("button", "is-auto-width", "is-primary");
    // block
    $closeBtn.style.display = "block";
    $closeBtn.addEventListener("click", () => {
      $dialog.close();
    });

    $dialog.appendChild($textarea);
    $dialog.appendChild($closeBtn);
    document.body.appendChild($dialog);

    // $dialog.show();

    // 兼容性处理
    $dialog.style.top = "50%";
    $dialog.style.transform = "translateY(-50%)";
  };

  // 为指定元素绑定事件
  gob.onHelpBtnHover = () => {
    const $btn = $n("button[title=help");
    if ($btn) {
      // _log($btn);
      $btn.addEventListener("mouseover", () => {
        gob.genPreFix();
      });
    }
  };

  gob.checkLoaded = (_record, Observer) => {
    gob.$title = $n("input[name=title]");
    gob.$slug = $n("input[name=slug]");
    if (gob.$title && gob.$slug) {
      // gob.title = gob.$title.value;
      // gob.slug = gob.$slug.value;
      // _log("[gob.checkLoaded()]\n", gob.$title.value);
      // _log("[gob.checkLoaded()]\n", gob.$slug.value);
      gob.onHelpBtnHover();
      Observer.disconnect();
    }
  };

  gob.bind = () => {
    fnElChange(gob.$body, gob.checkLoaded);
    fnElChange(gob.$body, gob.getPost);
  };

  // gob.$title = $n("input[name=title]");
  // gob.$content = $n("#post_content");

  gob.bind();
}

export default fnXLog;
