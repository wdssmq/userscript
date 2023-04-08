import { fnAfter, $n, fnElChange, _warn } from "./_base";

const fnFixReply = () => {
  const $body = $n("body");
  // 判断封装
  const loadCheck = {
    t: null,
    check(text) {
      return text.indexOf("查看回复") > -1;
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
      //
      fnAfter($u_notify_replay, $n(".sys_notify .category_item"));
    },
  };

  // 监听页面改动
  fnElChange($body, () => {
    const $sys_notify = $n("div.u_notity_bd > ul");
    if (!$sys_notify) {
      return;
    }
    if (!loadCheck.check($sys_notify.textContent)) {
      loadCheck.addLink($sys_notify);
      // loadCheck.clearDelay()
      return;
    } else {
      // loadCheck.delay();
    }
  });
};

try {
  fnFixReply();
} catch (error) {
  _warn(error);
}

