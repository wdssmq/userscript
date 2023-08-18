import { $n, $na, fnFindDom, curUrl } from "./_base";
import { _log } from "./_base";
import config from "./_config";
import { formatJSON, formatYAML, addCopyBtn, btnToggle } from "./_func";

const noteScheme = config.noteScheme;

// 获取 github 仓库基本信息
async function git_repoInfo() {
  const repoInfo = {};
  repoInfo.path = curUrl.replace("https://github.com/", "");
  // 使用 api 获取
  const url = `https://api.github.com/repos/${repoInfo.path}`;
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    repoInfo.desc = data.description;
    repoInfo.tags = data.topics;
    repoInfo.data = data;
    _log("repoInfo", repoInfo);
  } else {
    repoInfo.data = null;
    _log("response", response);
  }
  return repoInfo;
}

// update noteScheme
function git_noteScheme(repoInfo) {
  const { path, desc, tags } = repoInfo;
  noteScheme.item.Source = "[url=https://github.com/wdssmq]wdssmq (沉冰浮水)@github[/url]";
  noteScheme.item.Url = curUrl;
  noteScheme.item.Title = `GitHub - ${path}`;
  noteScheme.item.Desc = desc;
  noteScheme.item.Tags = ["GitHub"].concat(tags);
  // _log("noteScheme", noteScheme);
}

// 设置复制按钮
function git_btnCopy() {
  const $base = $n(".BorderGrid-cell>h2");
  // _log("$base", $base);
  if (!$base) return;
  addCopyBtn($base, noteScheme.item, "复制 JSON", "json");
  // insertAdjacentHTML 添加一个 span
  $base.insertAdjacentHTML("beforeend", "<span class=\"is-pulled-right\">&nbsp;&nbsp;</span>");
  addCopyBtn($base, noteScheme.item, "复制 YAML", "yaml");
}

(async () => {
  if (!curUrl.includes("github.com/wdssmq")) return;
  const repoInfo = await git_repoInfo();
  git_noteScheme(repoInfo);
  git_btnCopy();
})();


// Object.keys(noteScheme.item).forEach((key) => {
