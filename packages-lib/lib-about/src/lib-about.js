import "./style/style.sass";
import aboutTpl from "./base/about.html";
// import msgContent from "./base/msg.md";

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
    else {
      this._showAboutView();
    }
    return this;
  }

  _showAboutView() {
    if (!this.mainEl || !this.aboutEl) {
      return;
    }
    this.mainEl.classList.add("mz-about-hidden");
    this.aboutEl.hidden = false;
    this.isShown = true;
  }

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
    Object.keys(data).forEach(key => {
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

