import { _log, $n, fnElChange } from './_base';

// 番剧链接改为我的追番
(() => {
  let isDone = false;
  const fnCheckByDOM = () => {
    if (!isDone) {
      fnElChange($n("#app"), fnCheckByDOM);
    }
    const $pick = $n("a[href$='/anime/']");
    const $pick2 = $n("a[href^='//space']");
    // console.log($pick, $pick2);
    if (null === $pick || null === $pick2) {
      return;
    }
    const uid = $pick2.href.match(/\d+/)[0];
    const url = `https://space.bilibili.com/${uid}/bangumi`;
    $pick.href = url;
    _log("番剧链接改为我的追番", url);
    isDone = true;
  }
  fnCheckByDOM();
})();
