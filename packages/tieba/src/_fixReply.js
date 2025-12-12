import { $n, _warn, fnAfter, fnElChange } from "./_base";

function fnFixReply() {
  const $body = $n("body");
  // 判断封装
  const loadCheck = {
    t: null,
    check(text) {
      return text.includes("查看回复");
    },
    delay() {
      loadCheck.clearDelay();
      loadCheck.t = setTimeout(() => {
        location.reload();
      }, 1000);
    },
    clearDelay() {
      clearTimeout(loadCheck.t);
    },
    addLink() {
      // 创建一个新的导航链接
      const $u_notify_replay = document.createElement("li");
      $u_notify_replay.className = "category_item category_item_empty";
      $u_notify_replay.innerHTML = `<a class="j_cleardata" href="/i/sys/jump?type=replyme" target="_blank" data-type="reply">
          查看回复
      </a>
    `;
      // 添加链接到页面
      fnAfter($u_notify_replay, $n(".sys_notify .category_item"));
    },
  };

  // 监听页面改动
  fnElChange($body, () => {
    const $sys_notify = $n("div.u_notity_bd");
    if (!$sys_notify || !$sys_notify.textContent.includes("查看私信")) {
      return;
    }
    if (!loadCheck.check($sys_notify.textContent)) {
      // _warn($sys_notify.textContent.replace(/\s+/g, " "));
      loadCheck.addLink($sys_notify);
      // loadCheck.clearDelay()
    }
    else {
      // loadCheck.delay();
    }
  });
}

try {
  fnFixReply();
}
catch (error) {
  _warn(error);
}
