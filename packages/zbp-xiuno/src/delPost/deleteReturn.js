import { _curHref, lsObj } from "../_base.js";
import { DELETE_RETURN_KEY, DELETE_RETURN_MS, VIEW_KEY } from "./constants.js";
import { fnIsThreadListPage } from "./list.js";
import { fnGetThreadId, fnIsCurrentUserThread, fnLoadRecordMap } from "./thread.js";

function fnGetDeleteReturnInfo() {
  const info = lsObj.getItem(DELETE_RETURN_KEY, null);
  if (!info || typeof info !== "object") {
    return null;
  }
  return info;
}

function fnCheckDeleteReturn() {
  if (fnIsThreadListPage()) {
    return;
  }
  const info = fnGetDeleteReturnInfo();
  console.log(info);
  if (!info || !info.url || !Number.isFinite(info.time)) {
    return;
  }
  console.log(Date.now() - info.time);
  if (Date.now() - info.time > DELETE_RETURN_MS) {
    lsObj.setItem(DELETE_RETURN_KEY, null);
    return;
  }
  if (_curHref() !== info.url) {
    window.setTimeout(() => {
      lsObj.setItem(DELETE_RETURN_KEY, null);
      window.location.href = info.url;
    }, 3000);
  }
}

function fnBindDeleteReturn() {
  document.addEventListener("click", (event) => {
    const deleteLink = event.target.closest("a.post_delete");
    if (!deleteLink) {
      return;
    }
    const curUrl = _curHref();
    const threadId = fnGetThreadId();
    if (threadId && fnIsCurrentUserThread()) {
      const viewMap = fnLoadRecordMap(VIEW_KEY, {});
      viewMap[threadId] = Date.now();
      lsObj.setItem(VIEW_KEY, viewMap);
    }
    lsObj.setItem(DELETE_RETURN_KEY, {
      url: curUrl,
      time: Date.now(),
    });
  }, true);
}

export {
  fnBindDeleteReturn,
  fnCheckDeleteReturn,
};
