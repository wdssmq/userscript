import { $n, $na, fnElChange, curUrl } from "./_base";
import { _log } from "./_base";
import config from "./_config";
import { formatJSON, formatYAML, addCopyBtn, btnToggle } from "./_func";

const noteScheme = config.noteScheme;

const mapNode = {
  $title: "h1.video-title",
  $desc: ".desc-info-text",
  $btnSpan: ".js-note-btn",
  $btnWrap: ".video-info-meta",
};

// update noteScheme
function bili_noteScheme() {
  noteScheme.item.Tags = ["哔哩哔哩"];
  noteScheme.item.Type = "视频";
  noteScheme.item.Url = "https://www.bilibili.com/video/" + window.__INITIAL_STATE__.bvid;
  noteScheme.item.Title = $n(mapNode.$title).innerText.trim();
  noteScheme.item.Desc = $n(mapNode.$desc).innerText.trim().replace(/\n/g, " ");
  noteScheme.item.Source = "[url=https://space.bilibili.com/44744006]沉冰浮水@bilibili[/url]";
  // _log("noteScheme", noteScheme);
}

// 设置复制按钮
function bili_btnCopy() {
  const $btnWrap = $n(mapNode.$btnWrap);
  if (!$btnWrap) return;
  addCopyBtn($btnWrap, noteScheme.item, "复制 YAML", "yaml");
  // insertAdjacentHTML 添加一个 span
  $btnWrap.insertAdjacentHTML("beforeend", "<span class=\"is-pulled-right js-note-btn\">&nbsp;&nbsp;</span>");
  addCopyBtn($btnWrap, noteScheme.item, "复制 JSON", "json");
}


(async () => {
  if (!curUrl.includes("www.bilibili.com/video")) return;
  const fnMain = () => {
    const $btnSpan = $n(mapNode.$btnSpan);
    // _log("$btnSpan", $btnSpan);
    if ($btnSpan) return;
    const $title = $n(mapNode.$title);
    const $desc = $n(mapNode.$desc);
    if ($title && $desc) {
      bili_noteScheme();
      bili_btnCopy();
    }
  };
  const $body = $n("body");

  // 监听鼠标移动事件，绑定到 body 上
  $body.addEventListener("mousemove", fnMain, false);

})();
