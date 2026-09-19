import { $, _curHref, lsObj } from "../_base.js";
import { TRASH_KEY, VIEW_KEY } from "./constants.js";

function fnGetThreadId(strURL = _curHref()) {
  const match = strURL.match(/(?:\/|-)thread-(\d+)(?:\.html)?/i)
    || strURL.match(/thread-(\d+)/i);
  return match ? match[1] : "";
}

function fnUserText($sel) {
  return $sel.first().text().replace(/\s+/g, " ").trim();
}

function fnLoadRecordMap(key, def = {}) {
  const val = lsObj.getItem(key, def);
  return val && typeof val === "object" ? val : def;
}

function fnIsCurrentUserThread() {
  const threadId = fnGetThreadId();
  if (!threadId) {
    return false;
  }

  const authorName = fnUserText($(".media-body .username a, .card-thread .media .username a, .username a"));
  const currentName = fnUserText($(".nav-item.username a.nav-link, header .nav-item.username a.nav-link"));

  return Boolean(authorName && currentName && authorName === currentName);
}

function fnRecordThreadView() {
  if (!_curHref().includes("/thread-") || !fnIsCurrentUserThread()) {
    return;
  }

  const threadId = fnGetThreadId();
  const viewMap = fnLoadRecordMap(VIEW_KEY, {});
  viewMap[threadId] = Date.now();
  lsObj.setItem(VIEW_KEY, viewMap);

  const isTrash = $(".breadcrumb, .breadcrumb-item, .breadcrumb a").filter((_, el) => {
    return $(el).text().includes("回收站");
  }).length > 0;

  if (isTrash) {
    const arr = Array.isArray(lsObj.getItem(TRASH_KEY, [])) ? lsObj.getItem(TRASH_KEY, []) : [];
    if (!arr.includes(threadId)) {
      arr.push(threadId);
      lsObj.setItem(TRASH_KEY, arr);
    }
    $(".media-body h4").append("<span class=\"zbp-del-post-trash-badge\">「回收站」</span>");
  }
}

export {
  fnGetThreadId,
  fnIsCurrentUserThread,
  fnLoadRecordMap,
  fnRecordThreadView,
};
