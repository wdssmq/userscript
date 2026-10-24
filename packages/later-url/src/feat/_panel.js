import { $n, _log, fnPrompt } from "../_base";
import config from "../func/_config";
import "../style/style.css";

// 浮层设置面板：两套远程的开关与地址，改动即时保存
const ID_ROOT = "gm-later-panel";

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

  // 记录最近一次提示，并只刷新状态行
  notify(text, type = "") {
    this.last = {
      text,
      type,
    };
    _log("panel.notify()\n", this.last);
    this.renderStatus();
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
      <div class="gm-later-sec gm-later-hidden">
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
        </div>
        ${htmlCur}
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
      this.onAct($act.dataset.act);
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

  onAct(act) {
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
