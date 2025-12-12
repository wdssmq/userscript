// ==UserScript==
// @name         「水水」GesF-Note
// @namespace    com.wdssmq.gesf-note
// @version      1.0.0
// @author       沉冰浮水
// @description  收集各种作品信息发送至 GitHub Issues
// @match        https://www.bilibili.com/video/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  const d=new Set;const importCSS = async e=>{d.has(e)||(d.add(e),(t=>{typeof GM_addStyle=="function"?GM_addStyle(t):(document.head||document.documentElement).appendChild(document.createElement("style")).append(t);})(e));};

  const styleCss = ".js-note-btn{margin-left:8px;padding:4px 8px;color:#fff;background-color:#00aeec;border:none;border-radius:4px;cursor:pointer}.js-note-btn:hover{background-color:#00b8f6;color:#fff}";
  importCSS(styleCss);
  const _now = () => Math.floor(Date.now() / 1e3);
  const $n = (selector, parent = document) => {
    return parent.querySelector(selector);
  };
  const fnElChange = (el, fn = (mr, mo) => {
    console.log(mr, mo);
  }) => {
    const observer = new MutationObserver((mr, mo) => {
      fn(mr, mo);
    });
    observer.observe(el, {

childList: true,
subtree: true
    });
  };
  var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_setClipboard = (() => typeof GM_setClipboard != "undefined" ? GM_setClipboard : void 0)();
  var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _GM_xmlhttpRequest = (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  const _config = {
    default: {
      "DEBUG": false,
      "GIT_INFO": {
        "GIT_REPO": "wdssmq/GesF-Note",
        "GIT_TOKEN": "",
        "GIT_USER": "wdssmq",
        "PICK_LABEL": "pick"
      },
      "firstRun": true,
      "lastIssue": {
        number: -1,
        updated_at: ""
      },
      up: -1
    },
    data: {},
    save: function() {
      _GM_setValue("config", this.data);
    },
    load: function() {
      this.data = _GM_getValue("config", this.default);
      if (this.data.firstRun) {
        this.data.firstRun = false;
        this.save();
      }
    }
  };
  _config.load();
  class HttpRequest {
    constructor() {
      if (typeof _GM_xmlhttpRequest === "undefined") {
        throw new Error("GM_xmlhttpRequest is not defined");
      }
    }
    get(url, headers = {}) {
      return this.request({
        method: "GET",
        url,
        headers
      });
    }
    post(url, data = {}, headers = {}, dataType = "json") {
      const getData = (data2) => {
        switch (dataType) {
          case "form":
            const formData = new FormData();
            for (const key in data2) {
              formData.append(key, data2[key]);
            }
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            return formData;
          case "json":
          default:
            headers["Content-Type"] = "application/json";
            return JSON.stringify(data2);
        }
      };
      return this.request({
        method: "POST",
        url,
        data: getData(data),
        headers
      });
    }
    request(options) {
      return new Promise((resolve, reject) => {
        const requestOptions = Object.assign({}, options);
        requestOptions.onload = function(res) {
          resolve(res);
        };
        requestOptions.onerror = function(error) {
          reject(error);
        };
        _GM_xmlhttpRequest(requestOptions);
      });
    }
  }
  const http = new HttpRequest();
  function http_git_headers(token = "", other = {}) {
    return {
      "Accept": "application/vnd.github+json",
      "Authorization": "token " + token,
      ...other
    };
  }
  function http_git_check(res_data) {
    let error_message = "";
    if (typeof res_data === "object" && res_data !== null && "status" in res_data) {
      if (res_data.status !== 200) {
        error_message = res_data.message || "未知错误";
      }
    }
    if (error_message !== "") {
      return { error: true, message: error_message, data: res_data };
    }
    return { error: false, data: res_data };
  }
  async function http_git_issues(labels = "pick", repo = "", token = "") {
    const url = `https://api.github.com/repos/${repo}/issues?labels=${labels}`;
    const headers = http_git_headers(token);
    const response = await http.get(url, headers);
    const responseData = JSON.parse(response.responseText);
    return http_git_check(responseData);
  }
  async function http_git_create_comment(comments_url, comment, token) {
    const headers = http_git_headers(token);
    const data = { body: comment };
    const response = await http.post(comments_url, data, headers);
    const responseData = JSON.parse(response.responseText);
    return http_git_check(responseData);
  }
  function formatYAML(obj) {
    let strYaml = "";
    Object.entries(obj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        strYaml += `${key}: `;
        strYaml += value.join(", ") + "\n";
      } else {
        value = value.replace(/\n/g, "");
        strYaml += `${key}: ${value}
`;
      }
    });
    return strYaml;
  }
  function addCopyBtn($btnWrap, clsList, note, clickHandle, btnCon = "推送") {
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
  function pickIssue(issues, maxComments) {
    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      if (issue.comments + 1 <= maxComments) {
        return issue;
      }
    }
    return null;
  }
  function getLastIssue() {
    const gitInfo = _config.data.GIT_INFO;
    if (!gitInfo.GIT_REPO || !gitInfo.GIT_TOKEN) {
      alert("请先配置 GitHub Token 及 Repo");
      return;
    }
    const now = _now();
    const lstIssue = _config.data.lastIssue;
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
      const lstIssue2 = pickIssue(issuesList, 13);
      if (!lstIssue2) {
        alert("没有找到合适的 Issue");
        _config.data.lastIssue.number = -1;
        _config.data.lastIssue.updated_at = -1;
      } else {
        _config.data.lastIssue.number = lstIssue2.number;
        _config.data.lastIssue.updated_at = lstIssue2.updated_at;
      }
      _config.data.up = now - 3e3;
      _config.save();
      console.log(lstIssue2);
    });
  }
  function createComment(strYaml) {
    const gitInfo = _config.data.GIT_INFO;
    const issueNumber = _config.data.lastIssue.number;
    if (!issueNumber || issueNumber < 0) {
      alert("请先获取最新的 Issue");
      return;
    }
    const postBody = `\`\`\`yaml
${strYaml}
\`\`\``;
    const comments_url = `https://api.github.com/repos/${gitInfo.GIT_REPO}/issues/${issueNumber}/comments`;
    console.log(comments_url);
    http_git_create_comment(comments_url, postBody, gitInfo.GIT_TOKEN).then((res) => {
      if (res.error) {
        alert("创建评论失败：" + res.message);
        console.log(res.data);
        return;
      }
      console.log(res.data);
    });
    console.log(postBody);
  }
  function copyNoteYaml(strYaml) {
    _GM_setClipboard(`\`\`\`yaml
${strYaml}
\`\`\``, "text");
  }
  class BiliNote {
    noteScheme = {
      item: {
        "Title": "node:.video-info-title-inner h1",
        "Desc": "node:.desc-info-text",
        "Source": "[url=https://space.bilibili.com/44744006]沉冰浮水@bilibili[/url]",
        "Tags": ["哔哩哔哩"],
        "Type": "视频",
        "Url": ""
      },
      btnWrap: ".video-info-meta"
    };
    _loadCheck() {
      const $btnSpan = $n(".js-note-btn");
      if ($btnSpan) return "loaded";
      const $title = $n(this.noteScheme.item.Title.slice(5));
      const $desc = $n(this.noteScheme.item.Desc.slice(5));
      if (!$title || !$desc) return "-1";
      return "loading";
    }
    _getVideoUrl() {
      return "https://www.bilibili.com/video/" + window.__INITIAL_STATE__?.bvid;
    }
    _getTitle() {
      return $n(this.noteScheme.item.Title.slice(5))?.textContent?.trim() || "";
    }
    _getDesc() {
      return $n(this.noteScheme.item.Desc.slice(5))?.textContent?.trim() || "";
    }
    get note() {
      const title = this._getTitle();
      const url = this._getVideoUrl();
      const desc = this._getDesc();
      return Object.assign({}, this.noteScheme.item, { Title: title, Url: url, Desc: desc });
    }
  }
  (() => {
    const $body = document.body;
    getLastIssue();
    let g;
    let t;
    if ("www.bilibili.com" === location.hostname) {
      g = new BiliNote();
      fnElChange($body, (mr, mo) => {
        t = setTimeout(() => {
          if ("loaded" === g._loadCheck()) {
            mo.disconnect();
            clearTimeout(t);
          }
          if ("loading" === g._loadCheck()) {
            const $btnWrap = $n(g.noteScheme.btnWrap);
            if ($btnWrap) {
              addCopyBtn($btnWrap, ["js-note-btn"], g.note, createComment);
              addCopyBtn($btnWrap, ["js-note-btn"], g.note, copyNoteYaml, "复制 YAML");
            }
            console.log("body changed", mr, mo);
          } else if ("-1" === g._loadCheck()) {
            console.log("等待元素加载");
          }
        }, 500);
      });
    }
  })();

})();