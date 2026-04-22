(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.mzPaiad = factory());
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

  var tplHtml = "<!-- [1] -->\n<div id=\"{modal-id}\" class=\"mz-modal mz-reset\" aria-hidden=\"true\">\n    <!-- [2] -->\n    <div tabindex=\"-1\" class=\"mz-modal__overlay\" data-mz-modal-close>\n        <!-- [3] -->\n        <div role=\"dialog\" class=\"mz-modal__container\" aria-modal=\"true\" aria-labelledby=\"{modal-id}-title\">\n            <header class=\"mz-modal__header\">\n                <h2 id=\"{modal-id}-title\" class=\"mz-modal__title\">\n                    {title}\n                </h2>\n                <!-- [4] -->\n                <button class=\"mz-modal__close\" aria-label=\"Close modal\" data-mz-modal-close></button>\n            </header>\n            <div id=\"{modal-id}-content\" class=\"mz-modal__content mz-content\">\n                {content}\n            </div>\n        </div>\n    </div>\n</div>\n";

  var msgContent = "<p>这是一条弹出公告，你可能需要多看一会儿才能关闭；</p>\n<p>或者使用 <a href=\"https://cn.bing.com/search?q=uBlock+Origin\" title=\"uBlock Origin - 必应搜索\">uBlock Origin</a> 等广告过滤插件永久屏蔽；</p>\n<p><code>{location.hostname}##.mz-modal.ads</code></p>\n<p>「<a href=\"https://afdian.com/a/wdssmq\" title=\"沉冰浮水正在创作和 Z-BlogPHP 相关或无关的各种有用或没用的代码 | 爱发电\">爱发电</a>」\n「<a href=\"https://jq.qq.com/?_wv=1027&amp;k=SRYaRV6T\" title=\"QQ 群 - 我的咸鱼心\">QQ 群 - 我的咸鱼心</a>」\n「群号：189574683」</p>\n<p>「<a href=\"https://space.bilibili.com/44744006\" title=\"沉冰浮水的个人空间_哔哩哔哩_bilibili\">哔哩哔哩</a>」\n「<a href=\"https://account.bilibili.com/account/big/myPackage\" title=\"大会员卡券领取 - bilibili\">大会员卡券领取 - bilibili</a>」</p>\n<p>「<a href=\"https://www.wdssmq.com/post/20201231613.html\" title=\"「言说」RSS 是一种态度！！\">「言说」RSS 是一种态度！！</a>」\n「<a href=\"https://cn.bing.com/search?q=%E5%B0%8F%E4%BB%A3%E7%A0%81+%E6%B2%89%E5%86%B0%E6%B5%AE%E6%B0%B4\" title=\"小代码 沉冰浮水 - 必应搜索\">更多「小代码」</a>」</p>\n<!-- ##################################### -->\n\n";

  class Modal {
    config = null;

    constructor({
      modalId,
      triggers = [],
      openClass = "is-open",
      disableCloseClass = "disable-close",
      openTrigger = "data-mz-modal-trigger",
      closeTrigger = "data-mz-modal-close",
      onShow = () => { },
      onClose = () => { },
      debugMode = false,
    }) {
      this.modal = document.getElementById(modalId);
      if (!this.modal)
        throw new Error(`Modal with ID ${modalId} not found.`);
      this.config = { openClass, disableCloseClass, openTrigger, closeTrigger, onShow, onClose, debugMode };
      if (debugMode) {
        console.log(modalId);
        console.log(this.modal);
      }
      if (triggers.length > 0) {
        this.registerTriggers(...triggers);
      }

      // 将 this 绑定到方法中
      this.onClick = this.onClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
    }

    registerTriggers(...triggers) {
      triggers.filter(Boolean).forEach((trigger) => {
        trigger.addEventListener("click", event => this.showModal(event));
      });
    }

    onKeydown(event) {
      if (event.keyCode === 27)
        this.closeModal(event); // esc
      // if (event.keyCode === 9) this.retainFocus(event); // tab
    }

    onClick(event) {
      if (this.config.debugMode) {
        console.log(event.target);
        console.log(this.config);
      }
      if (
        event.target.hasAttribute(this.config.closeTrigger)
        || event.target.parentNode.hasAttribute(this.config.closeTrigger)
      ) {
        event.preventDefault();
        event.stopPropagation();
        this.closeModal(event);
      }
    }

    addEventListeners() {
      this.modal.addEventListener("touchstart", this.onClick);
      this.modal.addEventListener("click", this.onClick);
      document.addEventListener("keydown", this.onKeydown);
    }

    removeEventListeners() {
      this.modal.removeEventListener("touchstart", this.onClick);
      this.modal.removeEventListener("click", this.onClick);
      document.removeEventListener("keydown", this.onKeydown);
    }

    showModal(event = null) {
      // this.activeElement = document.activeElement;
      this.modal.setAttribute("aria-hidden", "false");
      this.modal.classList.add(this.config.openClass);
      // this.scrollBehaviour("disable");
      this.addEventListeners();

      this.config.onShow({ modal: this.modal }, event);
    }

    closeModal(event = null) {
      const modal = this.modal;
      const isDisabled = modal.classList.contains(this.config.disableCloseClass);
      if (!isDisabled) {
        modal.setAttribute("aria-hidden", "true");
        this.removeEventListeners();
        // this.scrollBehaviour("enable");
        modal.classList.remove(this.config.openClass);
      }
      this.config.onClose({ modal, isDisabled }, event);
    }
  }

  const mzModal = (() => {
    let activeModal = null;

    // 同一个弹出层可以有多个触发器，对其进行关联
    const generateTriggerMap = (triggers, triggerAttr) => {
      const triggerMap = [];
      triggers.forEach((trigger) => {
        const modalId = trigger.attributes[triggerAttr].value;
        if (triggerMap[modalId] === undefined)
          triggerMap[modalId] = [];
        triggerMap[modalId].push(trigger);
      });

      return triggerMap;
    };

    // init
    const init = (config) => {
      const options = Object.assign({}, { openTrigger: "data-mz-modal-trigger" }, config);
      const triggers = [...document.querySelectorAll(`[${options.openTrigger}]`)];
      const triggerMap = generateTriggerMap(triggers, options.openTrigger);

      if (options.debugMode) {
        console.log("mzModal init");
        console.log(options);
        console.log(triggers);
      }

      for (const modalId in triggerMap) {
        if (Object.hasOwnProperty.call(triggerMap, modalId)) {
          const arrEl = triggerMap[modalId];
          options.modalId = modalId;
          options.triggers = [...arrEl];
          activeModal = new Modal(options);
        }
      }
    };

    // show
    const show = (modalId, config = null) => {
      const options = config || {};
      if (activeModal)
        activeModal.removeEventListeners();
      activeModal = new Modal({ modalId, ...options });
      activeModal.showModal();
    };

    return {
      init,
      show,
    };
  })();

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

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

  var css_248z$1 = "@charset \"UTF-8\";\n.mz-hidden {\n  display: none;\n}\n\n.mz-reset * {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n.mz-content code {\n  background-color: hsl(0, 0%, 96%);\n  color: hsl(348, 100%, 61%);\n  font-weight: 400;\n  padding: 0.25em 0.5em;\n}\n\n.mz-modal {\n  box-sizing: border-box;\n}\n\n.mz-modal__overlay, .mz-modal {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n\n.mz-modal {\n  display: none;\n}\n.mz-modal.is-open {\n  display: block;\n}\n.mz-modal * {\n  box-sizing: inherit;\n}\n\n.mz-modal__overlay {\n  background: rgba(0, 0, 0, 0.6);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.mz-modal__container {\n  background-color: #fff;\n  padding: 30px;\n  max-width: 540px;\n  max-height: 100vh;\n  border-radius: 4px;\n  overflow-y: auto;\n  box-sizing: border-box;\n}\n\n.mz-modal__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid #e5e5e5;\n  padding-bottom: 0.3em;\n  margin-bottom: 0.7em;\n}\n\n.mz-modal__title {\n  display: flex;\n  align-items: center;\n  font-weight: 600;\n  font-size: 1.25rem;\n  line-height: 1.25;\n  color: #333;\n  box-sizing: border-box;\n}\n.mz-modal__title > span {\n  padding-right: 1em;\n}\n\n.mz-modal__close {\n  background: transparent;\n  border: 0;\n  cursor: pointer;\n  font-size: 1.25rem;\n  line-height: 1.25;\n}\n.mz-modal__close:before {\n  content: \"✕\";\n}\n.mz-modal__close:focus {\n  outline: 0;\n}\n\n.mz-modal__content {\n  line-height: 1.5;\n  color: rgba(0, 0, 0, 0.8);\n}\n.mz-modal__content p:not(:last-child) {\n  margin-bottom: 0.7em;\n}\n\n.mz-modal__container {\n  min-width: 523px;\n}";
  styleInject(css_248z$1);

  var css_248z = ".js-mz-tips {\n  font-size: 12px;\n  padding-left: 4em;\n}\n\n.mz-content {\n  font-size: 16px;\n}\n.mz-content a:link, .mz-content a:visited {\n  color: #e60;\n  text-decoration: none;\n}\n.mz-content a:hover {\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}";
  styleInject(css_248z);

  const defConfig = {
    // 关闭倒计时
    cntDownMax: 5,
    // 弹出间隔
    interval: 86400 * 4,
    // 弹出内容
    msg: {
      title: "这里是标题（弹出间隔 {IntervalText}）",
      content: msgContent.trim().replace("{location.hostname}", location.hostname),
    },
    adsFlag: false,
  };

  class PaidOrAd {
    $modal = null;
    $modalOverlay = null;
    cntDownCur = defConfig.cntDownMax;
    cntDownRunning = false;
    config = defConfig;
    domCreated = false;
    lsData = null;
    modalId = "paiad";
    modalOpts = {}; // 用于传给 mzModal 的配置
    NODE_ENV = "prod";
    ts = Math.floor(Date.now() / 1000);

    constructor(options = {}) {
      // 合并配置
      this.modalOpts = Object.assign({}, {
        onClose: this._onClose.bind(this),
        onShow: this._onShow.bind(this),
      }, options);
      // 初始化
      this.init();
    }

    _onClose(args) {
      // console.log(args);
      const $tips = this.$modal.querySelector(".js-mz-tips");
      if (args.isDisabled) {
        // const $modal = $(args.modal);
        $tips.classList.remove("mz-hidden");
      }
      else {
        $tips.classList.add("mz-hidden");
      }
      // 倒计时结束后才允许关闭
      this.cntDown();
    }

    _onShow(_args) {
      // console.log(args);
      this.cntDownCur = this.config.cntDownMax;
      this.disableClose();
    }

    init() {
      this.lsData = lsObj.getItem(this.modalId, {});
      this.createDom();
      mzModal.init(this.modalOpts);
      this.preventAccidentalClose();
    }

    // 时间间隔转换为友好的显示
    get intervalText() {
      const interval = this.config.interval;
      if (interval < 3600) {
        const minute = Math.floor(interval / 60);
        return `${minute} 分钟`;
      }
      if (interval < 86400) {
        const hour = Math.floor(interval / 3600);
        return `${hour} 小时`;
      }
      const day = Math.floor(interval / 3600 / 24);
      return `${day} 天`;
    }

    get intervalHour() {
      const interval = this.config.interval;
      const hour = Math.floor(interval / 3600);
      return hour;
    }

    get intervalDay() {
      const interval = this.config.interval;
      const day = Math.floor(interval / 3600 / 24);
      return day;
    }

    buildHtml() {
      return tplHtml
        .replace(/\{modal-id\}/g, this.modalId);
    }

    createDom() {
      const strHtml = this.buildHtml();
      if (!this.domCreated) {
        this.domCreated = true;
        document.body.insertAdjacentHTML("beforeend", strHtml);
      }
      this.$modal = document.getElementById(this.modalId);
      this.$modalOverlay = this.$modal.querySelector(".mz-modal__overlay");
      // this.$modalOverlay.removeAttribute("data-mz-modal-close");
    }

    // 更新 Dom 内容
    updateDom() {
      const $modalCon = this.$modal.querySelector("#paiad-content");
      const modalCon = this.config.msg.content;
      $modalCon.innerHTML = modalCon;

      const $modalTitle = this.$modal.querySelector("#paiad-title");
      const modalTitle = this.config.msg.title
        .replace("{IntervalHour}", this.intervalHour)
        .replace("{IntervalDay}", this.intervalDay)
        .replace("{IntervalText}", this.intervalText);
      $modalTitle.innerHTML = modalTitle;

      // 链接添加 target="_blank"
      const links = this.$modal.querySelectorAll("a");
      links.forEach(link => link.setAttribute("target", "_blank"));

      // 追加元素
      const span = document.createElement("span");
      span.className = "js-mz-tips mz-hidden";
      span.textContent = "{tips}";
      $modalTitle.appendChild(span);
      // 添加额外的 class
      this.addClass();
    }

    // 防止非预期关闭
    preventAccidentalClose() {
      const _this = this;
      // this.$modal 绑定鼠标按下事件
      this.$modal.addEventListener("mousedown", (e) => {
        // 触发元素不为 .mz-modal__overlay 或 .mz-modal__close
        if (!e.target.classList.contains("mz-modal__overlay") && !e.target.classList.contains("mz-modal__close")) {
          _this.$modalOverlay.removeAttribute("data-mz-modal-close");
        }
        else {
          _this.$modalOverlay.setAttribute("data-mz-modal-close", "");
        }
      });
    }

    addClass() {
      if (this.config.adsFlag === false)
        return;
      this.$modal.classList.add("ads");
    }

    setTips() {
      const _tips = (cnt) => {
        return cnt > 0 ? `${cnt}丨继续点→` : "最后一次→";
      };
      const $tips = this.$modal.querySelector(".js-mz-tips");
      $tips.textContent = _tips(this.cntDownCur);
    }

    setLsData(key, value) {
      this.lsData[key] = value;
      lsObj.setItem(this.modalId, this.lsData);
    }

    // 倒计时封装
    cntDown() {
      this.setTips();
      // 判断倒计时执行中
      if (this.cntDownRunning) {
        // 重复点击可以加速
        this.cntDownCur -= 1;
        return;
      }
      this.cntDownRunning = true;
      const _this = this;
      const cnt = setInterval(() => {
        _this.cntDownCur -= 1;
        _this.setTips();
        if (_this.cntDownCur <= 0) {
          clearTimeout(cnt);
          _this.enableClose();
        }
      }, 1000);
    }

    // 禁止关闭
    disableClose() {
      // console.log("disableClose");
      this.$modal.classList.add("disable-close");
    }

    // 允许关闭
    enableClose() {
      this.$modal.classList.remove("disable-close");
      this.cntDownRunning = false;
    }

    // 显示弹窗
    show(force = false) {
      this.updateDom();
      const lstShowTime = this.lsData.lstShowTime || 0;
      const interval = this.NODE_ENV === "dev" ? 10 : this.config.interval;

      // console.log("lstShowTime", lstShowTime);
      // console.log("interval", interval);
      // console.log("ts", this.ts);

      if (this.ts - lstShowTime > interval || force) {
        mzModal.show(this.modalId, this.modalOpts);
        this.setLsData("lstShowTime", this.ts);
      }
      return this;
    }
  }

  const paidOrAdInstance = new PaidOrAd();

  return paidOrAdInstance;

}));
