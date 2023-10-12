import { _log, $n, $na, fnAfter, fnElChange } from "./_base";

// 关注列表增强
(() => {
  const gob = {
    done: false,
    _rssUrl: (uid) => {
      let RSSHub = localStorage.RSSHub ? localStorage.RSSHub : "https://rsshub.app/bilibili/user/video/:uid/";
      localStorage.RSSHub = RSSHub;
      return RSSHub.replace(":uid", uid);
    },
  };
  // 获取关注列表
  const fnGetFollowList = () => {
    let $list = $na("li.list-item");
    return $list;
  };

  // 针对每个关注列表项
  const fnUpView = ($up) => {
    const url = $up.querySelector("a.cover").href;
    const name = $up.querySelector("span.fans-name").innerText;

    const { uid, uname } = ((url, name) => {
      const uid = url.match(/\/(\d+)\/$/)[1];
      let uname = name.replace(/\b/g, "_").replace(/_+/g, "_");
      uname = uname.replace(/^_|_$/g, "");
      // _log(`${uid} ${uname}`);
      return { uid, uname };
    })(url, name);

    const $desc = $up.querySelector("p.auth-description") || $up.querySelector("p.desc");
    if ($desc && $desc.dataset.fnUpView === "done") {
      return;
    }
    $desc.dataset.fnUpView = "done";
    // _log($desc);

    // 创建新 p 元素
    const $p = document.createElement("p");
    const RSSUrl = gob._rssUrl(uid);
    $p.className = "desc";
    $p.innerHTML = `
    <hr>
    <a href="${RSSUrl}" target="_blank">「RSS」</a> |
    ${uid} ${uname}
    `;

    fnAfter($p, $desc);
  };

  // 页面元素更新监听
  const fnCheckByDOM = () => {
    const $ul = $n("ul.relation-list");
    const $list = fnGetFollowList();
    if ($list.length > 0 && !$ul.dataset.fnCheckByDOM !== "done") {
      $ul.dataset.fnCheckByDOM = "done";
      _log("$list.length = ", $list.length);
      // nodeList to array
      const $listArr = Array.from($list);
      $listArr.forEach(($li) => {
        fnUpView($li);
      });
    }
    fnElChange($n("body"), fnCheckByDOM);
  };
  fnCheckByDOM();

})();
