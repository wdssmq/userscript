import {
  $n,
  _curUrl,
  _getDateStr,
  _warn,
  fnElChange,
  fnFindDom,
} from "./_base";
import { gob } from "./_gob";

gob.addLink = (link) => {
  const { linkLog } = gob;
  if (!linkLog.includes(link)) {
    linkLog.push(link);
  }
  _warn("addLink()\n", linkLog);
};

gob.checkLink = () => {
  const { linkLog } = gob;
  // 大于等于 4 时，刷新页面
  if (linkLog.length >= 4) {
    window.location.reload();
  }
};

// 绑定页面焦点事件
window.addEventListener("focus", () => {
  gob.checkLink();
});

// 记录已签到的贴吧

function fnLogSigned() {
  const curUrl = _curUrl();
  // 地址内不含有 /i/i/forum 且 不含有 /f?kw= 的不执行
  if (!curUrl.includes("/i/i/forum") && !curUrl.includes("/f?kw=")) {
    return;
  }

  let 中止监听 = false;

  // 贴吧列表处理
  const colorForumList = () => {
    const $table = $n(".forum_table");
    if (!$table) {
      return;
    }
    中止监听 = true;
    const $itemLink = fnFindDom($table, "a");
    // 遍历判断是否已签到
    [].forEach.call($itemLink, ($link) => {
      const text = $link.textContent;
      const title = $link.title;
      if (text === title) {
        const item = gob.签到列表[`${title}吧`];
        // 判断是否已签到
        if (item && item === _getDateStr()) {
          // $link.style.color = "#000";
          $link.parentNode.style.backgroundColor = "#eee";
        }
        // 监听点击事件
        $link.classList.add("name");
        // 点击事件，包括中键点击
        $link.addEventListener("mousedown", (_e) => {
          gob.addLink(title);
        });
      }
    });
  };

  // 判断是否与签到
  const isSigned = () => {
    const $signstar_wrapper = $n("#signstar_wrapper");
    // 如果含有类名 sign_box_bright_signed，说明已签到
    if ($signstar_wrapper.classList.contains("sign_box_bright_signed")) {
      // alert("已签到");
      return true;
    }
    return false;
  };

  // 记录签到到 ls
  const logSigned = () => {
    gob.load(true);
    const { 签到列表, _当前日期, 当前吧名 } = gob;
    签到列表[当前吧名] = _getDateStr();
    gob.签到列表 = 签到列表;
    gob.save();
  };

  const $body = $n("body");

  fnElChange($body, (_mr, mo) => {
    // 贴吧列表页
    colorForumList();
    if (中止监听) {
      mo.disconnect();
    }
    // 贴吧签到页
    const $sign_today_date = $n(".sign_today_date");
    if (!$sign_today_date) {
      return;
    }
    const sign_today_date = $sign_today_date.textContent;
    gob.当前日期 = sign_today_date.trim();
    gob.getCurForumName();
    // console.log(gob.data);
    if (isSigned()) {
      logSigned();
      mo.disconnect();
    }
  });
}

try {
  fnLogSigned();
}
catch (error) {
  _warn(error);
}
