import { $, lsObj } from "../_base.js";
import { TRASH_KEY, VIEW_KEY, VIEW_WINDOW_MS } from "./constants.js";
import { fnGetThreadId, fnLoadRecordMap } from "./thread.js";

// 判断当前是否为"论坛帖子"帖子列表页
function fnIsThreadListPage() {
  const $mySide = $("#my_aside");
  return $mySide && $mySide.find(".active").text().trim() === "论坛帖子";
}

// 绑定列表页刷新逻辑：切回页面时若有未看帖子则自动刷新，并将帖子链接改为新窗口打开
function fnBindThreadListRefresh() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && fnIsThreadListPage() && $(".js-unviewed").length) {
      window.location.reload();
    }
  });
  $(".threadlist .thread a").each(function() {
    const $link = $(this);
    $link.attr("target", "_blank");
  });
}

// 标记列表页帖子：给近期看过的帖子加"最近有看过"徽章，回收站帖子加"回收站"徽章，未看的加 js-unviewed 类
function fnMarkThreadList() {
  if (!fnIsThreadListPage()) {
    return;
  }

  const viewMap = fnLoadRecordMap(VIEW_KEY, {});
  const trashSet = new Set(Array.isArray(lsObj.getItem(TRASH_KEY, [])) ? lsObj.getItem(TRASH_KEY, []) : []);
  const now = Date.now();

  GM_addStyle(`
    .zbp-del-post-badge {
      display: inline-block;
      margin-left: .45rem;
      padding: .15rem .45rem;
      font-size: 12px;
      line-height: 1.4;
      color: #fff;
      border-radius: 999px;
      vertical-align: middle;
    }
    .zbp-del-post-viewed {
      background: #28a745;
      float: right;
    }
    .zbp-del-post-trash {
      background: #dc3545;
      float: right;
    }
  `);

  $(".list-item, .thread-item, .media, .table tbody tr, .list-group-item").each(function() {
    const $item = $(this);
    const $link = $item.find("a[href*='/thread-'], a[href*='thread-'], .title a, .thread-title a").first();
    if (!$link.length) {
      return;
    }

    const threadId = fnGetThreadId($link.attr("href") || "");
    if (!threadId) {
      return;
    }

    const $target = $item.find(".thread-title, .title, .subject, .media-heading, .card-title, a[href*='thread-']").first();
    if (!$target.length) {
      return;
    }

    const lastView = Number(viewMap[threadId]);
    const isViewedRecently = Number.isFinite(lastView) && (now - lastView) <= VIEW_WINDOW_MS;

    if (isViewedRecently && !$target.find(".zbp-del-post-viewed").length) {
      $target.append("<span class=\"zbp-del-post-badge zbp-del-post-viewed\">最近有看过</span>");
    }
    else {
      $target.addClass("js-unviewed");
    }

    if (trashSet.has(threadId) && !$target.find(".zbp-del-post-trash").length) {
      $target.append("<span class=\"zbp-del-post-badge zbp-del-post-trash\">回收站</span>");
    }
  });
}

export {
  fnBindThreadListRefresh,
  fnIsThreadListPage,
  fnMarkThreadList,
};
