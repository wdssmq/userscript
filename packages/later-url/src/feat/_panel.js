import { $n, _log, fnPrompt } from "../_base";
import config from "../func/_config";

// 浮层设置面板：两套远程的开关与地址，改动即时保存
const ID_ROOT = "gm-later-panel";
const ID_STYLE = "gm-later-panel-style";

// 空间页 UP 的 uid
const RE_UID = /space\.bilibili\.com\/(\d+)/;
// 昵称所在元素，与 _bilibili 中的选择器一致
const SEL_USERNAME = ".header-upinfo .upinfo-detail .nickname";
// ZBP 插件推送地址的特征
const RE_ZBP_URL = /src=odd_Later/i;

// 取地址中的 host，解析失败返回空串
function urlHost(url) {
  try {
    return new URL(url).host;
  }
  catch {
    return "";
  }
}

// 转义后插入面板，避免页面文本被当作 HTML 解析
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[c]));
}

const CSS = `
#gm-later-panel{position:fixed;right:16px;bottom:16px;z-index:2147483000;
  font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;font-size:12px;color:#fff;
  line-height:1.5;-webkit-user-select:none;user-select:none;}
#gm-later-panel *{box-sizing:border-box;}
.gm-later-card{width:260px;max-width:calc(100vw - 32px);
  background:rgba(31,33,40,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border:1px solid rgba(255,255,255,.12);border-radius:12px;
  box-shadow:0 10px 28px rgba(0,0,0,.35);overflow:hidden;
  animation:gm-later-in .16s ease-out;}
@keyframes gm-later-in{from{opacity:0;transform:translateY(6px) scale(.98);}to{opacity:1;transform:none;}}
.gm-later-head{display:flex;align-items:center;justify-content:space-between;
  padding:10px 12px;font-size:14px;font-weight:600;
  background:linear-gradient(90deg,rgba(251,114,153,.18),rgba(35,173,229,.14));}
.gm-later-fold{cursor:pointer;color:#C9CCD4;font-size:12px;font-weight:400;
  padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.08);transition:background .16s ease,color .16s ease;}
.gm-later-fold:hover{background:rgba(255,255,255,.16);color:#fff;}
.gm-later-body{padding:10px 12px 12px;}
.gm-later-sec{margin-bottom:10px;padding:8px 10px;border-radius:8px;background:rgba(43,46,56,.8);}
.gm-later-sec:last-of-type{margin-bottom:0;}
.gm-later-title{display:flex;align-items:center;justify-content:space-between;
  font-size:13px;font-weight:500;color:#fff;}
.gm-later-row{display:flex;align-items:center;justify-content:space-between;
  margin-top:6px;color:#C9CCD4;}
.gm-later-row > span:first-child{color:#8B90A0;}
.gm-later-sw{width:36px;height:20px;border-radius:999px;background:#6B6F7A;
  position:relative;cursor:pointer;transition:background .16s ease;}
.gm-later-sw[data-on="true"]{background:#FB7299;}
.gm-later-sw i{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;
  background:#fff;transition:left .16s ease;box-shadow:0 1px 3px rgba(0,0,0,.4);}
.gm-later-sw[data-on="true"] i{left:18px;}
.gm-later-link{cursor:pointer;color:#23ADE5;max-width:150px;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;}
.gm-later-link:hover{text-decoration:underline;}
.gm-later-ok{color:#3DBF7A;}
.gm-later-warn{color:#F5A623;}
.gm-later-err{color:#E5534B;}
.gm-later-btn{cursor:pointer;padding:2px 8px;border-radius:999px;font-size:12px;
  background:rgba(251,114,153,.18);color:#FB7299;transition:background .16s ease;}
.gm-later-btn:hover{background:rgba(251,114,153,.32);}
.gm-later-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}
.gm-later-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;
  background:rgba(255,255,255,.08);color:#C9CCD4;font-size:12px;cursor:pointer;transition:background .16s ease;}
.gm-later-chip:hover{background:rgba(229,83,75,.28);color:#fff;}
.gm-later-chip[data-read="true"]{cursor:default;}
.gm-later-chip[data-read="true"]:hover{background:rgba(255,255,255,.08);color:#C9CCD4;}
.gm-later-status{margin-top:10px;padding:6px 8px;border-radius:8px;font-size:12px;
  color:#C9CCD4;background:rgba(255,255,255,.05);word-break:break-all;}
.gm-later-fab{width:48px;height:48px;border-radius:50%;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:rgba(31,33,40,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 20px rgba(0,0,0,.35);
  transition:transform .16s ease,box-shadow .16s ease;}
.gm-later-fab:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(0,0,0,.45);}
.gm-later-fab-t{font-size:11px;font-weight:600;color:#fff;letter-spacing:.5px;}
.gm-later-fab-n{font-size:11px;color:#FB7299;}
`;

const panel = {
  // 当前是否已注入面板
  isPage() {
    return /space\.bilibili\.com/i.test(location.href);
  },

  // 已启用的远程数量，用于角标提示
  enabledCount() {
    return [config.data.enableCf, config.data.enableZbp].filter(Boolean).length;
  },

  // 已登记 UP 列表：{ [uid]: "name" }
  users() {
    if (!config.data.zbpUsers || typeof config.data.zbpUsers !== "object") {
      config.data.zbpUsers = {};
    }
    return config.data.zbpUsers;
  },

  // 当前空间页的 UP 信息，用户名取不到时退回 uid
  curUp() {
    const oMatch = location.href.match(RE_UID);
    const uid = oMatch ? oMatch[1] : "";
    const $name = $n(SEL_USERNAME);
    let name = $name ? $name.textContent.trim() : "";
    if (!name) {
      // 兜底：document.title 形如 「某某的个人空间-……」
      const oTitle = document.title.match(/^(.+?)的个人空间/);
      if (oTitle) {
        name = oTitle[1];
      }
    }
    return {
      uid,
      name,
    };
  },

  // 登记当前 UP
  regCurUser() {
    const { uid, name } = this.curUp();
    if (!uid) {
      this.notify("未获取到当前 UP 的 uid", "err");
      return false;
    }
    const strName = name || uid;
    const isNew = !Object.hasOwnProperty.call(this.users(), uid);
    this.users()[uid] = strName;
    config.save();
    this.notify(isNew ? `已登记 ${strName}（${uid}）` : `已更新 ${strName}（${uid}）`, "ok");
    return true;
  },

  // 移除已登记的 UP
  delUser(uid) {
    const users = this.users();
    if (!uid || !Object.hasOwnProperty.call(users, uid)) {
      return false;
    }
    delete users[uid];
    config.save();
    return true;
  },

  // 记录最近一次提示，并只刷新状态行
  notify(text, type = "") {
    this.last = {
      text,
      type,
    };
    _log("panel.notify()\n", this.last);
    this.renderStatus();
  },

  injectStyle() {
    if ($n(`#${ID_STYLE}`)) {
      return;
    }
    const $style = document.createElement("style");
    $style.id = ID_STYLE;
    $style.textContent = CSS;
    document.head.appendChild($style);
  },

  // 收起时的角标
  htmlFab() {
    return `
      <div class="gm-later-fab" data-act="fold" title="later-url 远程设置">
        <span class="gm-later-fab-t">later</span>
        <span class="gm-later-fab-n">${this.enabledCount()}/2</span>
      </div>
    `;
  },

  // 开关组件
  htmlSwitch(act, on) {
    return `<span class="gm-later-sw" data-act="${act}" data-on="${on ? "true" : "false"}"><i></i></span>`;
  },

  // 远程服务区块
  htmlCf() {
    const { baseUrl, authToken, enableCf } = config.data;
    const host = urlHost(baseUrl) || "未配置";
    const token = authToken ? `${String(authToken).slice(0, 6)}•••` : "未配置";
    return `
      <div class="gm-later-sec">
        <div class="gm-later-title">
          <span>远程服务</span>
          ${this.htmlSwitch("cf-switch", enableCf)}
        </div>
        <div class="gm-later-row">
          <span>地址</span>
          <span class="gm-later-link" data-act="cf-url" title="点击重填">${host}</span>
        </div>
        <div class="gm-later-row">
          <span>Token</span>
          <span class="gm-later-link" data-act="cf-token" title="点击重填">${token}</span>
        </div>
      </div>
    `;
  },

  // ZBP 插件区块，已登记部分只读展示
  htmlZbp() {
    const { zbpUrl, enableZbp } = config.data;
    const strUrl = (zbpUrl || "").trim();
    const hasUrl = /^https?:\/\//i.test(strUrl);
    const users = this.users();
    const uidList = Object.keys(users);
    // 当前页面 UP 的登记状态
    const { uid, name } = this.curUp();
    const isReg = !!uid && Object.hasOwnProperty.call(users, uid);
    const htmlUrl = hasUrl
      ? `<span class="gm-later-link" data-act="zbp-url" title="点击重填">${urlHost(strUrl) || "已配置"}</span>`
      : `<span class="gm-later-link gm-later-err" data-act="zbp-url">点此粘贴推送地址</span>`;
    const htmlCur = uid
      ? `<div class="gm-later-row">
          <span>当前 UP</span>
          ${isReg
            ? `<span class="gm-later-ok">已登记：${escapeHtml(users[uid] || name || uid)}</span>`
            : `<span class="gm-later-warn">未登记：${escapeHtml(name || uid)}</span>`}
        </div>`
      : "";
    const htmlChips = uidList.length
      ? `<div class="gm-later-chips">${uidList.map(cur => `<span class="gm-later-chip" data-read="true" title="${escapeHtml(cur)}">${escapeHtml(users[cur] || cur)}（${escapeHtml(cur)}）</span>`).join("")}</div>`
      : "";
    return `
      <div class="gm-later-sec">
        <div class="gm-later-title">
          <span>ZBP 插件</span>
          ${this.htmlSwitch("zbp-switch", enableZbp)}
        </div>
        <div class="gm-later-row">
          <span>推送地址</span>
          ${htmlUrl}
        </div>
        <div class="gm-later-row">
          <span>已登记 ${uidList.length} 个</span>
          <span class="gm-later-btn" data-act="zbp-reg" title="${isReg ? "更新当前 UP 的名称" : "登记当前 UP"}">${isReg ? "更新名称" : "登记当前 UP"}</span>
        </div>
        ${htmlCur}
        ${htmlChips}
      </div>
    `;
  },

  htmlCard() {
    return `
      <div class="gm-later-card">
        <div class="gm-later-head">
          <span>远程设置</span>
          <span class="gm-later-fold" data-act="fold">收起</span>
        </div>
        <div class="gm-later-body">
          ${this.htmlCf()}
          ${this.htmlZbp()}
          <div class="gm-later-status">${this.statusHtml()}</div>
        </div>
      </div>
    `;
  },

  // 状态行文本
  statusHtml() {
    const last = this.last || {};
    if (last.text) {
      const cls = last.type === "ok" ? "gm-later-ok" : (last.type === "err" ? "gm-later-err" : (last.type === "warn" ? "gm-later-warn" : ""));
      return `<span class="${cls}">${last.text}</span>`;
    }
    if (!config.data.enableCf && !config.data.enableZbp) {
      return `<span class="gm-later-warn">两套远程均未启用，不会发送</span>`;
    }
    if (config.data.enableZbp && !/^https?:\/\//i.test((config.data.zbpUrl || "").trim())) {
      return `<span class="gm-later-warn">ZBP 已启用但未填写推送地址</span>`;
    }
    return `<span>改动即时生效</span>`;
  },

  // 只更新状态行，避免整块重绘打断交互
  renderStatus() {
    const $status = $n(`#${ID_ROOT} .gm-later-status`);
    if ($status) {
      $status.innerHTML = this.statusHtml();
    }
    const $fab = $n(`#${ID_ROOT} .gm-later-fab-n`);
    if ($fab) {
      $fab.textContent = `${this.enabledCount()}/2`;
    }
  },

  render() {
    if (!this.isPage()) {
      return;
    }
    this.injectStyle();
    let $root = $n(`#${ID_ROOT}`);
    if (!$root) {
      $root = document.createElement("div");
      $root.id = ID_ROOT;
      document.body.appendChild($root);
    }
    $root.innerHTML = config.data.panelFold ? this.htmlFab() : this.htmlCard();
    $root.onclick = (e) => {
      const $act = e.target.closest("[data-act]");
      if (!$act) {
        return;
      }
      this.onAct($act.dataset.act, $act.dataset.key || "");
    };
  },

  // 展开/收起
  toggle() {
    if (!this.isPage()) {
      _log("panel.toggle() - 当前页面未注入面板\n", location.href);
      return;
    }
    config.data.panelFold = !config.data.panelFold;
    config.save();
    this.render();
  },

  // 设置 ZBP 推送地址
  setZbpUrl() {
    const val = fnPrompt("粘贴 ZBP 推送地址\n（插件后台复制的完整地址）", config.data.zbpUrl || "", s => /^https?:\/\//i.test(s));
    if (val === null) {
      return false;
    }
    if (val === false) {
      this.notify("地址需以 http(s):// 开头", "err");
      return false;
    }
    config.data.zbpUrl = val;
    config.save();
    const like = RE_ZBP_URL.test(val);
    this.notify(like ? "推送地址已更新" : "地址中未包含 src=odd_Later，请确认是否复制完整", like ? "ok" : "warn");
    return true;
  },

  // 设置远程服务地址
  setCfUrl() {
    const val = fnPrompt("远程服务地址（以 / 结尾）", config.data.baseUrl || "", s => /^https?:\/\//i.test(s));
    if (val === null) {
      return false;
    }
    if (val === false) {
      this.notify("地址需以 http(s):// 开头", "err");
      return false;
    }
    config.data.baseUrl = `${val.replace(/\/+$/, "")}/`;
    config.save();
    this.notify("远程服务地址已更新", "ok");
    return true;
  },

  // 设置远程服务 Token
  setCfToken() {
    const val = fnPrompt("远程服务 Token", config.data.authToken || "");
    if (val === null || val === false) {
      return false;
    }
    config.data.authToken = val;
    config.save();
    this.notify("Token 已更新", "ok");
    return true;
  },

  onAct(act, key) {
    switch (act) {
      case "fold":
        config.data.panelFold = !config.data.panelFold;
        config.save();
        this.render();
        break;
      case "cf-switch":
        config.data.enableCf = !config.data.enableCf;
        config.save();
        // 开关变化后旧的提示已过期
        this.last = null;
        this.render();
        break;
      case "zbp-switch":
        config.data.enableZbp = !config.data.enableZbp;
        config.save();
        this.last = null;
        this.render();
        break;
      case "cf-url":
        if (this.setCfUrl()) {
          this.render();
        }
        break;
      case "cf-token":
        if (this.setCfToken()) {
          this.render();
        }
        break;
      case "zbp-url":
        if (this.setZbpUrl()) {
          this.render();
        }
        break;
      case "zbp-reg":
        if (this.regCurUser()) {
          this.render();
        }
        break;
      case "zbp-del": {
        const name = this.users()[key] || key;
        if (this.delUser(key)) {
          this.notify(`已移除 ${name}（${key}）`, "ok");
          this.render();
        }
        break;
      }
      default:
        break;
    }
  },

  init() {
    if (!this.isPage()) {
      return;
    }
    this.render();
    // 状态行刷新由 notify() 触发
  },
};

panel.init();

export { panel };
export default panel;
