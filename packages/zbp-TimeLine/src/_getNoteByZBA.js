import { $n, _log, curUrl } from "./_base";
import config from "./_config";
import { addCopyBtn } from "./_func";

const noteScheme = config.noteScheme;

// 应用信息获取
function zba_appInfo() {
  const appInfo = {};
  appInfo.title = document.title;
  appInfo.desc = document.title;
  appInfo.img = (() => {
    const $img = $n(".app-header-image>img");
    if (!$img)
      return "";
    return $img.src.replace("-logo", "");
  })();
  // _log("img", img);
  appInfo.url = curUrl;
  return appInfo;
}

// update noteScheme
function zba_noteScheme() {
  const { title, desc, img, url } = zba_appInfo();

  noteScheme.item.Desc = desc;
  noteScheme.item.Image = img;
  noteScheme.item.Source = "[url=https://app.zblogcn.com/?auth=6401c4a7-89cd-48f9-a68b-d6464d8c3bc8]沉冰浮水 - Z-Blog 应用中心[/url]";
  noteScheme.item.Tags = ["Z-BlogPHP", "Z-BlogPHP_插件"];
  noteScheme.item.Title = `Z-BlogPHP - ${title}`;
  noteScheme.item.Type = "代码";
  noteScheme.item.Url = url.replace(/#.+/g, "");
  // _log("noteScheme", noteScheme);
}

// 设置复制按钮
function zba_btnCopy() {
  const $base = $n(".app-download");
  // _log("$base", $base);
  if (!$base)
    return;
  addCopyBtn($base, noteScheme.item, "复制 YAML", "yaml");
  // insertAdjacentHTML 添加一个 span
  $base.insertAdjacentHTML("beforeend", "<span class=\"is-pulled-right\">&nbsp;&nbsp;</span>");
  addCopyBtn($base, noteScheme.item, "复制 JSON", "json");
}

(async () => {
  if (!curUrl.includes("zblogcn.com/?id="))
    return;
  zba_noteScheme();
  zba_btnCopy();
})();
