import { _log, $n, ckeObj, fnElChange } from "./_base";

// 番剧链接改为我的追番
(() => {
  let isDone = false;
  // 获取 uid
  const getUidByUrlOrCookie = (url) => {
    let uid = null;
    const match = url.match(/\d+/);
    if (match) {
      uid = match[0];
      ckeObj.setItem("bilibili-helper-uid", uid);
    } else {
      uid = ckeObj.getItem("bilibili-helper-uid");
    }
    return uid;
  };
  // 更新链接
  const fnCheckByDOM = () => {
    if (!isDone) {
      fnElChange($n("body"), fnCheckByDOM);
    }
    const $pick = $n("a[href$='/anime/']");
    // const $pick2 = $n("a[href^='//space']");
    const $pick2 = $n("a.header-entry-avatar");
    // _log($pick, $pick2);

    let usrUrl = $pick2 ? $pick2.href : "";
    const uid = getUidByUrlOrCookie(usrUrl);
    if (!$pick || !uid) {
      return;
    }
    const url = `https://space.bilibili.com/${uid}/bangumi`;
    $pick.href = url;
    _log("番剧链接改为我的追番", url);
    isDone = true;
  };
  fnCheckByDOM();
})();
