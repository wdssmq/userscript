import { $, _curHref, lsObj } from "../_base.js";
import { HIDE_OTHERS_KEY, TRASH_KEY, VIEW_KEY, VIEW_WINDOW_MS } from "./constants.js";
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

// 回收站列表页：在面包屑"回收站"后加隐藏开关（状态存 ls），并按开关状态隐藏/显示他人帖子；识别失败时不处理
function fnHideOthersThreadsInTrash() {
  const isTrash = $(".breadcrumb-item.active a").first().text().trim() === "回收站"
    || _curHref().includes("forum-144");
  if (!isTrash) {
    return;
  }

  const currentName = $(".nav-item.username a.nav-link").first().text().replace(/\s+/g, " ").trim();
  if (!currentName) {
    return;
  }

  // 按当前开关状态应用隐藏策略并更新开关文案
  function fnApply($toggle) {
    const enabled = lsObj.getItem(HIDE_OTHERS_KEY, true);
    $toggle.find("a").text(`隐藏他人帖：${enabled ? "开" : "关"}`);
    $(".threadlist li.media.thread").each(function() {
      const $item = $(this);
      const authorName = $item.find(".media-body .username").first().text().replace(/\s+/g, " ").trim();
      if (enabled && authorName && authorName !== currentName) {
        $item.hide();
      }
      else {
        $item.show();
      }
    });
  }

  // 在"回收站"面包屑后插入开关
  const $toggle = $("<li class=\"breadcrumb-item\"><a href=\"javascript:;\"></a></li>");
  const $crumb = $(".breadcrumb-item.active").filter(function() {
    return $(this).text().trim() === "回收站";
  }).first();
  if ($crumb.length) {
    $crumb.after($toggle);
  }
  else {
    $(".breadcrumb").first().append($toggle);
  }

  $toggle.find("a").on("click", () => {
    lsObj.setItem(HIDE_OTHERS_KEY, !lsObj.getItem(HIDE_OTHERS_KEY, true));
    fnApply($toggle);
  });

  fnApply($toggle);
}

// 绑定列表页左右方向键换页：← 上一页、→ 下一页；输入框聚焦时不触发
function fnBindListArrowPage() {
  const $pager = $(".pagination").first();
  if (!$pager.length) {
    return;
  }

  const fnFindPageLink = (strText) => {
    return $pager.find(".page-item a").filter(function() {
      return $(this).text().trim() === strText;
    }).first().attr("href") || "";
  };

  document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
      return;
    }

    const el = e.target;
    const tag = (el.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable) {
      return;
    }

    const strURL = e.key === "ArrowLeft" ? fnFindPageLink("◀") : fnFindPageLink("▶");
    if (strURL) {
      e.preventDefault();
      window.location.href = strURL;
    }
  });
}

export {
  fnBindListArrowPage,
  fnBindThreadListRefresh,
  fnHideOthersThreadsInTrash,
  fnIsThreadListPage,
  fnMarkThreadList,
};
