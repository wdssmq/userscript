/* global GM_notification GM */

import { $n, _log, ckeObj, curDate, curUrl, fnElChange } from "./_base.js";

// 日期转字符串
function getDateStr(date) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("zh-CN", options);
}

// 判断日期间隔
function diffDateDays(date1, date2) {
  const diff = date1.getTime() - date2.getTime();
  return diff / (1000 * 60 * 60 * 24);
}

// B 币领取提醒
(() => {
  const ckeName = "bilibili-helper-bcoin-nxtDateStr";
  const curDateStr = getDateStr(curDate);
  const nxtDateStr = ckeObj.getItem(ckeName, curDateStr);
  const bcoinUrl = "https://account.bilibili.com/account/big/myPackage";

  _log(`当前日期: ${curDateStr}`);
  _log(`下次领取: ${nxtDateStr}`);

  // 通知事件封装
  const notify = (title, body) => {
    _log(`通知标题: ${title}`);
    GM_notification({
      title,
      text: body,
      timeout: 0,
      onclick: () => {
        // window.location.href = bcoinUrl;
        GM.openInTab(bcoinUrl, false);
      },
    });
  };

  // 判断是否已经领取过
  const fnCheckByDOM = () => {
    const $bcoin = $n(".security-right .coupon-wrapper");
    // _log("fnCheckByDOM", $bcoin);
    // $bcoin && _log("fnCheckByDOM", $bcoin.innerHTML);
    if ($bcoin && $bcoin.textContent.includes("本次已领")) {
      const match = $bcoin.textContent.match(/\d{4}\/\d+\/\d+/);
      if (match && match[0] !== nxtDateStr) {
        ckeObj.setItem(ckeName, match[0]);
        _log("已领取过，更新下次领取日期", match[0]);
        return true;
      }
    }
    else {
      fnElChange($n("body"), fnCheckByDOM);
    }
    return false;
  };

  // _log($n("body").innerHTML);
  // _log(nxtDateStr, curMonth);

  // 对比日期
  const iniDiff = diffDateDays(curDate, new Date(nxtDateStr));
  if (iniDiff > 0) {
    _log(curUrl, "\n", bcoinUrl);
    if (curUrl.includes(bcoinUrl)) {
      fnCheckByDOM();
    }
    else {
      notify("B 币领取提醒", "点击查看 B 币领取情况");
    }
  }
})();
