import {
  $,
  _log,
} from "./_base";

export function _cmtPlus(cb = () => { }) {
  if ($(".js-edt").length === 0) {
    return;
  }

  const toTimestamp = (input) => {
    const text = String(input).trim();

    // 兼容 "YYYY-MM-DD HH:mm:ss" 这类格式。
    const ts = Date.parse(text.replace(/-/g, "/"));
    if (!Number.isNaN(ts)) {
      return ts / 1000;
    }

    return Number.NaN;
  };

  // 获取 .post-time
  const $postTime = $(".post-time");
  // 评论时间
  const $$cmtTime = $(".cmt-time time");
  if ($postTime.length === 0 || $$cmtTime.length === 0) {
    return;
  }
  // 获取当前文章的发布时间，属性为 data-time
  const postTime = toTimestamp($postTime.data("time"));
  if (Number.isNaN(postTime)) {
    _log("[cmtPlus] 无法解析文章发布时间", $postTime.data("time"));
    return;
  }

  // 一个 flag 变量，记录是否有评论的时间早于文章发布时间
  let hasEarlyCmt = false;

  // 遍历每个评论时间，比较与文章发布时间
  $$cmtTime.each(function() {
    const rawTime = $(this).attr("datetime");
    const cmtTime = toTimestamp(rawTime);
    if (Number.isNaN(cmtTime)) {
      _log("[cmtPlus] 无法解析评论时间", rawTime);
      return;
    }
    // console.log(cmtTime <= postTime);
    if (cmtTime < postTime) {
      hasEarlyCmt = true;
      return false; // 退出 each 循环
    }
  });

  // 如果有评论时间早于文章发布时间
  if (hasEarlyCmt && typeof cb === "function") {
    // console.log(hasEarlyCmt);
    cb();
  }
}
