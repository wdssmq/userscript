import {
  // $n,
  _now,
} from "./_base";
import type { noteInfo } from "./_type";
import _config from "./_config";

import { GM_setClipboard } from "$";

import {
  http_git_issues,
  http_git_create_comment,
} from "./_git_api";

// updated_at : "2025-09-06T13:17:08Z"
// 转时间戳秒数
// function formatDate(date: string) {
//   const dateObj = new Date(date);
//   return Math.floor(dateObj.getTime() / 1000);
// }

// 对象转 yaml
function formatYAML(obj: noteInfo) {
  let strYaml = "";
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      strYaml += `${key}: `;
      strYaml += value.join(", ") + "\n";
    } else {
      value = value.replace(/\n/g, "");
      strYaml += `${key}: ${value}\n`;
    }
  });
  return strYaml;
}

// 添加复制按钮及事件的封装
function addCopyBtn($btnWrap: HTMLElement, clsList: string[], note: noteInfo, clickHandle: ((arg0: string) => void) | undefined, btnCon = "推送") {
  const $btn = document.createElement("a");
  $btn.href = "javascript:;";
  $btn.classList.add("is-pulled-right");
  $btn.classList.add(...clsList);
  $btn.textContent = btnCon;
  $btn.title = btnCon;

  $btn.addEventListener("click", () => {
    const strYaml = formatYAML(note);
    if (clickHandle) {
      clickHandle(strYaml);
    }
  });

  $btnWrap.appendChild($btn);
}

// 从 issues 中获取评论数小于指定值的 issue
function pickIssue(issues: any[], maxComments: number): any | null {
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    if (issue.comments + 1 <= maxComments) {
      return issue;
    }
  }
  return null;
}

function getLastIssue() {
  const gitInfo = _config.data.GIT_INFO
  if (!gitInfo.GIT_REPO || !gitInfo.GIT_TOKEN) {
    alert("请先配置 GitHub Token 及 Repo");
    return;
  }
  const now = _now();
  const lstIssue = _config.data.lastIssue;
  // 每小时更新一次 issue
  if (lstIssue.number && _config.data.up) {
    if (now - _config.data.up < 3600) {
      return;
    }
  }

  const issues = http_git_issues(gitInfo.PICK_LABEL, gitInfo.GIT_REPO, gitInfo.GIT_TOKEN);
  issues.then((res) => {
    if (res.error) {
      alert("获取 Issues 失败：" + res.message);
      console.log(res.data);

      return;
    }
    const issuesList = res.data;
    const lstIssue = pickIssue(issuesList, 13);
    if (!lstIssue) {
      alert("没有找到合适的 Issue");
      _config.data.lastIssue.number = -1;
      _config.data.lastIssue.updated_at = -1;
    } else {
      _config.data.lastIssue.number = lstIssue.number;
      _config.data.lastIssue.updated_at = lstIssue.updated_at;
    }
    _config.data.up = now - 3000;
    _config.save();
    console.log(lstIssue);
  });
}

function createComment(strYaml: string) {
  const gitInfo = _config.data.GIT_INFO;
  const issueNumber = _config.data.lastIssue.number;
  if (!issueNumber || issueNumber < 0) {
    alert("请先获取最新的 Issue");
    return;
  }
  const postBody = `\`\`\`yaml\n${strYaml}\n\`\`\``;

  const comments_url = `https://api.github.com/repos/${gitInfo.GIT_REPO}/issues/${issueNumber}/comments`;
  console.log(comments_url);

  http_git_create_comment(comments_url, postBody, gitInfo.GIT_TOKEN).then((res) => {
    if (res.error) {
      alert("创建评论失败：" + res.message);
      console.log(res.data);
      return;
    }
    // alert("创建评论成功");
    console.log(res.data);
  });
  console.log(postBody);
}

function copyNoteYaml(strYaml: string) {
  GM_setClipboard(`\`\`\`yaml\n${strYaml}\n\`\`\``, "text");
}

export {
  addCopyBtn,
  copyNoteYaml,
  createComment,
  getLastIssue,
  pickIssue,
}
