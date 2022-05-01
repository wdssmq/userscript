import { curUrl, curDate, _log, $n } from './_base.js';

// cookie 封装
const ckeObj = {
  setItem: function (key, value) {
    const Days = 137;
    const exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = key + "=" + encodeURIComponent(value) + ";path=/;domain=.bilibili.com;expires=" + exp.toGMTString();
  },
  getItem: function (key, def = "") {
    const reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
    const arr = document.cookie.match(reg);
    if (arr) {
      return decodeURIComponent(arr[2]);
    }
    return def;
  }
};

// 日期转字符串
const getDateStr = (date) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString("zh-CN", options);
}

// 判断日期间隔
const diffDateDays = (date1, date2) => {
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

  // 元素变化监听
  const fnElChange = (el, fn = () => { }) => {
    const observer = new MutationObserver((mutationRecord, mutationObserver) => {
      // _log('body attributes changed!!!'); // body attributes changed!!!
      // _log('mutationRecord = ', mutationRecord); // [MutationRecord]
      // _log('mutationObserver === observer', mutationObserver === observer); // true
      fn(mutationRecord, mutationObserver);
      mutationObserver.disconnect(); // 取消监听，正常应该在回调函数中根据条件决定是否取消
    });
    observer.observe(el, {
      // attributes: false,
      // attributeFilter: ["class"],
      childList: true,
      // characterData: false,
      subtree: true,
    });
  }

  // 通知事件封装
  const notify = (title, body) => {
    _log(`通知标题: ${title}`);
    GM_notification({
      title: title,
      text: body,
      timeout: 0,
      onclick: () => {
        // window.location.href = bcoinUrl;
        GM.openInTab(bcoinUrl, false);
      }
    });
  }

  // 判断是否已经领取过
  const fnCheckByDOM = () => {
    const $bcoin = $n(".bcoin-wrapper");
    // _log("fnCheckByDOM", $bcoin);
    // $bcoin && _log("fnCheckByDOM", $bcoin.innerHTML);
    if ($bcoin && $bcoin.innerText.includes("本次已领")) {
      const match = $bcoin.innerText.match(/\d{4}\/\d+\/\d+/);
      if (match && match[0] !== nxtDateStr) {
        ckeObj.setItem(ckeName, match[0]);
        _log("已领取过，更新下次领取日期", match[0]);
        return true;
      }
    } else {
      fnElChange($n("#app"), fnCheckByDOM);
    }
    return false;
  }

  // _log($n("body").innerHTML);
  // _log(nxtDateStr, curMonth);

  // 对比日期
  const iniDiff = diffDateDays(curDate, new Date(nxtDateStr));
  if (iniDiff > 0) {
    _log(curUrl, "\n", bcoinUrl);
    if (curUrl.indexOf(bcoinUrl) > -1) {
      fnCheckByDOM();
    } else {
      notify("B 币领取提醒", "点击查看 B 币领取情况");
    }
  }
})();
