(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.mzAbout = factory());
})(this, (function () { 'use strict';

  // localStorage 封装
  const lsObj = {
    setItem(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    getItem(key, def = "") {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return def;
    },
  };

  var aboutTpl = "<section class=\"mz-about-wrap\">\n  <div class=\"mz-about-panel\">\n    <!-- -------- -->\n    <p>QQ 群：<a href=\"https://jq.qq.com/?_wv=1027&amp;k=efK3gwpH\" title=\"我的咸鱼心\" target=\"_blank\">189574683</a></p>\n\n    <p>博客：<a href=\"https://www.wdssmq.com\" title=\"沉冰浮水的博客\">https://www.wdssmq.com</a></p>\n\n    <p class=\"is-text-bold\">Feed：<a href=\"http://feed.wdssmq.com\" title=\"Feed_沉冰浮水\">https://feed.wdssmq.com</a></p>\n\n    <p>哔哩哔哩：<a href=\"https://space.bilibili.com/44744006\" title=\"沉冰浮水_哔哩哔哩\">https://space.bilibili.com/44744006</a></p>\n\n    <p>GitHub：<a href=\"https://github.com/wdssmq\" title=\"沉冰浮水 - GitHub\">https://github.com/wdssmq</a></p>\n\n    <hr><!-- -------- -->\n\n    <p>文章推荐：「<a target=\"_blank\" href=\"https://www.wdssmq.com/post/20201231613.html\" title=\"「言说」RSS 是一种态度！！\">RSS 是一种态度</a>」「<a href=\"https://www.wdssmq.com/post/20200617652.html\" target=\"_blank\" title=\"「水坑」系列教程索引\">「水坑」系列教程索引</a>」</p>\n\n    <hr><!-- -------- -->\n\n    <p>爱发电：<a target=\"_blank\" href=\"https://afdian.com/a/wdssmq\" title=\"爱发电\">https://afdian.com/a/wdssmq</a></p>\n\n    <p>[AD：<a title=\"老薛主机\" target=\"_blank\" href=\"https://my.laoxuehost.net/aff.php?aff=294\">PHP 美国空间</a> 优惠码：15off-xnxf ]</p>\n\n    <p>[AD：<a title=\"主机云\" target=\"_blank\" href=\"https://my.hostyun.com/page.aspx?c=referral&u=8680\">vps-主机云</a>]</p>\n\n    <p>更多广告：<a title=\"Vultr\" target=\"_blank\" href=\"https://www.wdssmq.com/category/%E5%B9%BF%E5%91%8A%E6%85%8E%E5%85%A5/\">广告慎入 - 沉冰浮水</a></p>\n\n    <p>更多应用：<a href=\"https://app.zblogcn.com/?auth=6401c4a7-89cd-48f9-a68b-d6464d8c3bc8\" target=\"_blank\" title=\"沉冰浮水 - Z-Blog 应用中心\">沉冰浮水 - Z-Blog 应用中心</a></p>\n  </div>\n</section>\n";

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = ".SubMenu a.mz-about-btn {\n  float: right;\n  margin-left: 12px;\n  padding: 0 1em;\n  text-decoration: none;\n}\n\n.mz-about-wrap {\n  border: 1px solid #e9e9e9;\n  padding: 14px;\n  background: #fff;\n  transition: all 0.2s ease;\n}\n\n.mz-about-panel p {\n  margin: 0 0 0.6rem;\n}\n.mz-about-panel hr {\n  border: none;\n  height: 2px;\n  background: #e9e9e9;\n  margin: 0.8rem 0;\n  visibility: visible;\n}\n\n.mz-about-hidden {\n  display: none;\n}";
  styleInject(css_248z);

  // import msgContent from "./base/msg.md";

  // 最后一次显示关于视图的时间戳（单位：秒）
  const LAST_SHOW_TIME_KEY = "mz-about-last-show-ts";

  const defaultConfig = {
    buttonText: "[关 于]",
    buttonTitle: "查看/隐藏关于",
    mainSelector: "#divMain2",
    menuSelector: ".SubMenu",
    // 豁免时间，单位：秒；在此时间内重复点击不需要再等待
    exemptTime: 5,
    // 倒计时等待时间，单位：秒
    countdownSeconds: 15,
  };

  class MzAbout {
    config = { ...defaultConfig };
    buttonEl = null;
    mainEl = null;
    aboutEl = null;
    isShown = false;
    countdownTimer = null;
    countdownRemaining = 0;
    curTime = 0;

    init(options = {}) {
      this.config = { ...defaultConfig, ...options };
      this.mainEl = document.querySelector(this.config.mainSelector);
      this._injectButton();
      this._injectAboutView();
      this.curTime = Math.floor(Date.now() / 1000);
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

    // 判断是否需要等待，在豁免时间内重复点击不需要再等待
    // true: 需要等待，false: 可直接显示
    _shouldWaitBeforeShow() {
      const lastShowTime = Number(lsObj.getItem(LAST_SHOW_TIME_KEY, 0));
      if (!lastShowTime) {
        return true;
      }
      const elapsed = this.curTime - lastShowTime;
      return elapsed >= this.config.exemptTime;
    }

    // 开始倒计时
    _startCountdown() {
      if (!this.buttonEl || this.countdownTimer) {
        return;
      }
      this.countdownRemaining = this.config.countdownSeconds;
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
      // 记录显示时间戳
      lsObj.setItem(LAST_SHOW_TIME_KEY, this.curTime + this.config.countdownSeconds);
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

  return mzAbout;

}));
