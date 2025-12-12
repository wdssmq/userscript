import { $n, _log, curUrl } from "./_base";
import config from "./_config";
import { addCopyBtn } from "./_func";

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
  }
  else {
    repoInfo.data = null;
    _log("response", response);
  }
  return repoInfo;
}

// update noteScheme
function git_noteScheme(repoInfo) {
  const { path, desc, tags } = repoInfo;
  noteScheme.item.Desc = desc;
  noteScheme.item.Source = "[url=https://github.com/wdssmq]wdssmq (沉冰浮水)@github[/url]";
  noteScheme.item.Tags = ["GitHub"].concat(tags);
  noteScheme.item.Title = `GitHub - ${path}`;
  noteScheme.item.Type = "代码";
  noteScheme.item.Url = curUrl;
  // _log("noteScheme", noteScheme);
}

// 设置复制按钮
function git_btnCopy() {
  const $base = $n(".BorderGrid-cell>div");
  // _log("$base", $base);
  if (!$base)
    return;
  addCopyBtn($base, noteScheme.item, "复制 YAML", "yaml");
  // insertAdjacentHTML 添加一个 span
  $base.insertAdjacentHTML("beforeend", "<span class=\"is-pulled-right\">&nbsp;&nbsp;</span>");
  addCopyBtn($base, noteScheme.item, "复制 JSON", "json");
}

(async () => {
  if (!curUrl.includes("github.com/wdssmq"))
    return;
  const repoInfo = await git_repoInfo();
  git_noteScheme(repoInfo);
  git_btnCopy();
})();
