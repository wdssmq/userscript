
import $ from "./base/_domq.js";
import "./mz-ui/mz-ui.sass";
import "./style/style.sass";
import mzModal from "./mz-ui/mz-modal.js";

import { lsObj } from "./base/_util.js";
import tplHtml from "./base/modal.html";
import msgContent from "./base/msg.md";

const defConfig = {
    // 关闭倒计时
    cntDownMax: 5,
    // 弹出间隔
    interval: 86400 * 4,
    // 弹出内容
    msg: {
        title: "这里是标题（弹出间隔 {IntervalDay} 天）",
        content: msgContent.trim().replace("{location.hostname}", location.hostname),
    },
};

class paidOrAd {
    $modal = null;
    $modalOverlay = null;
    cntDownCur = defConfig.cntDownMax;
    cntDownRunning = false;
    config = defConfig;
    domCreated = false;
    lsData = null;
    modalId = "paiad";
    modalOpts = {}; // 用于传给 mzModal 的配置
    NODE_ENV = process.env.NODE_ENV;
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
        const $tips = this.$modal.find(".js-mz-tips");
        if (args.isDisabled) {
            // const $modal = $(args.modal);
            $tips.removeClass("mz-hidden");
        } else {
            $tips.addClass("mz-hidden");
        }
    }

    _onShow(args) {
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
            .replace(/{modal-id}/g, this.modalId);
    }

    createDom() {
        const strHtml = this.buildHtml();
        if (!this.domCreated) {
            this.domCreated = true;
            $(document.body).append(strHtml);
        }
        this.$modal = $(`#${this.modalId}`);
        this.$modalOverlay = this.$modal.find(".mz-modal__overlay");
        // this.$modalOverlay.removeAttr("data-mz-modal-close");
        // 链接添加 target="_blank"
        this.$modal.find("a").attr("target", "_blank");
    }

    // 更新 Dom 内容
    updateDom() {
        const $modalCon = this.$modal.find("#paiad-content");
        const modalCon = this.config.msg.content;
        $modalCon.html(modalCon);

        const $modalTitle = this.$modal.find("#paiad-title");
        const modalTitle = this.config.msg.title
            .replace("{IntervalHour}", this.intervalHour)
            .replace("{IntervalDay}", this.intervalDay);
        $modalTitle.html(modalTitle);

        // 追加元素
        $modalTitle.append("<span class=\"js-mz-tips mz-hidden\">{tips}</span>");
    }

    // 防止非预期关闭
    preventAccidentalClose() {
        const _this = this;
        // this.$modal 绑定鼠标按下事件
        this.$modal.on("mousedown", (e) => {
            // 触发元素不为 .mz-modal__overlay 或 .mz-modal__close
            if (!e.target.classList.contains("mz-modal__overlay") && !e.target.classList.contains("mz-modal__close")) {
                _this.$modalOverlay.removeAttr("data-mz-modal-close");
            } else {
                _this.$modalOverlay.attr("data-mz-modal-close", "");
            }
        });
    }

    addClass() {
        // if (this.NODE_ENV === "dev") return;
        this.$modal.addClass("ads");
    }

    setTips() {
        const _tips = (cnt) => {
            return cnt > 0 ? `${cnt} 秒后方可关闭` : "再次点击关闭→";
        };
        const $tips = this.$modal.find(".js-mz-tips");
        $tips.text(_tips(this.cntDownCur));
    }

    setLsData(key, value) {
        this.lsData[key] = value;
        lsObj.setItem(this.modalId, this.lsData);
    }

    // 禁止关闭
    disableClose() {
        // console.log("disableClose");
        this.$modal.addClass("disable-close");
        if (this.cntDownRunning) {
            return;
        }
        this.cntDownRunning = true;
        this.setTips();
        const _this = this;
        const cnt = setInterval(() => {
            _this.cntDownCur -= 1;
            this.setTips();
            if (_this.cntDownCur <= 0) {
                clearTimeout(cnt);
                _this.enableClose();
            }
        }, 1000);
    }

    // 允许关闭
    enableClose() {
        this.$modal.removeClass("disable-close");
        this.cntDownRunning = false;
    }

    show(force = false) {
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

const paidOrAdInstance = new paidOrAd();

// paidOrAdInstance
//     .show()
//     .addClass();

// export default paidOrAdInstance;

if (typeof window !== "undefined") {
    window.paiad = paidOrAdInstance;
}
