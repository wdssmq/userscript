import { lsObj } from "./base/_util";
import aboutTpl from "./base/about.html";
import "./style/style.sass";
// import msgContent from "./base/msg.md";

// 最后一次显示关于视图的时间戳（单位：秒）
const LAST_SHOW_TIME_KEY = "mz-about-last-show-ts";
// 冷却时间，单位：秒
const COOL_DOWN_TIME = 500;
// 倒计时等待时间，单位：秒
const COUNTDOWN_SECONDS = 15;

const defaultConfig = {
  buttonText: "[关 于]",
  buttonTitle: "查看/隐藏关于",
  mainSelector: "#divMain2",
  menuSelector: ".SubMenu",
};

class MzAbout {
  config = { ...defaultConfig };
  buttonEl = null;
  mainEl = null;
  aboutEl = null;
  isShown = false;
  countdownTimer = null;
  countdownRemaining = 0;

  init(options = {}) {
    this.config = { ...defaultConfig, ...options };
    this.mainEl = document.querySelector(this.config.mainSelector);
    this._injectButton();
    this._injectAboutView();
    return this;
  }

  toggle() {
    if (this.isShown) {
      this._hideAboutView();
    }
    else if (this._shouldWaitBeforeShow() || this.countdownRemaining > 0) {
      this._startCountdown();
    }
    else {
      this._showAboutView();
    }
    return this;
  }

  // 判断是否需要等待冷却时间才能显示
  _shouldWaitBeforeShow() {
    const lastShowTime = Number(lsObj.getItem(LAST_SHOW_TIME_KEY, 0));
    if (!lastShowTime) {
      return true;
    }
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - lastShowTime;
    return elapsed >= COOL_DOWN_TIME;
  }

  // 开始倒计时
  _startCountdown() {
    if (!this.buttonEl || this.countdownTimer) {
      return;
    }
    this.countdownRemaining = this.config.countdownSeconds || COUNTDOWN_SECONDS;
    this._setCountdownText();
    this.buttonEl.classList.add("is-countdown");
    this.countdownTimer = window.setInterval(() => {
      this.countdownRemaining -= 1;
      if (this.countdownRemaining <= 0) {
        this._stopCountdown();
        this._showAboutView();
        return;
      }
      this._setCountdownText();
    }, 1000);
  }

  // 停止倒计时
  _stopCountdown() {
    if (this.countdownTimer) {
      window.clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.countdownRemaining = 0;
    if (this.buttonEl) {
      this.buttonEl.classList.remove("is-countdown");
      this.buttonEl.textContent = this.config.buttonText;
    }
  }

  // 更新按钮上的倒计时文本
  _setCountdownText() {
    if (!this.buttonEl) {
      return;
    }
    this.buttonEl.textContent = `[需要等待 ${this.countdownRemaining} 秒才能看广告]`;
    this.buttonEl.title = "是的，看广告前反而需要等待什么的/doge";
  }

  // 显示关于视图
  _showAboutView() {
    if (!this.mainEl || !this.aboutEl) {
      return;
    }
    this.mainEl.classList.add("mz-about-hidden");
    this.aboutEl.hidden = false;
    this.isShown = true;
    lsObj.setItem(LAST_SHOW_TIME_KEY, Math.floor(Date.now() / 1000));
  }

  // 隐藏关于视图
  _hideAboutView() {
    if (!this.mainEl || !this.aboutEl) {
      return;
    }
    this.mainEl.classList.remove("mz-about-hidden");
    this.aboutEl.hidden = true;
    this.isShown = false;
  }

  // 构建关于视图的模板
  _buildTemplate() {
    const data = {
      // msgContent,
    };
    let tpl = aboutTpl;
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      tpl = tpl.replace(regex, data[key]);
    });
    return tpl;
  }

  // 注入关于视图
  _injectAboutView() {
    if (!this.mainEl) {
      return;
    }
    if (this.aboutEl) {
      return;
    }
    const aboutEl = document.createElement("div");
    aboutEl.className = "mz-about-view";
    aboutEl.innerHTML = this._buildTemplate();
    aboutEl.hidden = true;
    this.mainEl.insertAdjacentElement("afterend", aboutEl);
    this.aboutEl = aboutEl;
  }

  // 注入按钮到菜单
  _injectButton() {
    const menuEl = document.querySelector(this.config.menuSelector);
    if (!menuEl) {
      return;
    }
    if (menuEl.querySelector(".mz-about-btn")) {
      this.buttonEl = menuEl.querySelector(".mz-about-btn");
      return;
    }
    const btn = document.createElement("a");
    btn.className = "mz-about-btn";
    btn.href = "javascript:;";
    btn.title = this.config.buttonTitle;
    btn.textContent = this.config.buttonText;
    btn.addEventListener("click", () => this.toggle());
    menuEl.appendChild(btn);
    this.buttonEl = btn;
  }
}

const mzAbout = new MzAbout();

export default mzAbout;

