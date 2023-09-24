// 引入 bulma
// import "../node_modules/bulma/bulma.sass";

// 自定义 bulma
// import "../src/style/bulma.sass";
// import "./style/bulma.sass";


import $ from "./base/_domq.js";
import "./mz-ui/mz-ui.sass";
import "./style/style.sass";
import mzModal from "./mz-ui/mz-modal";

import tplHtml from "./base/modal.html";
import msgContent from "./base/msg.md";

const msg = {
    title: "这里是标题",
    content: msgContent.trim().replace("{location.hostname}", location.hostname),
};

class paidOrAd {

    domCreated = false;
    modalId = "paid-or-ad";
    $modal = null;
    $modalOverlay = null;
    cntDown = 5;
    cntDownRunning = false;
    config = {};
    NODE_ENV = process.env.NODE_ENV;

    constructor(options) {
        this.config = Object.assign({}, {
            onClose: this._onClose.bind(this),
            onShow: this._onShow.bind(this),
        }, options);
        this.init();
    }

    _onClose(args) {
        // console.log(args);
        const $tips = this.$modal.find(".js-mz-tips");
        if (args.isDisabled) {
            const $modal = $(args.modal);
            $tips.removeClass("mz-hidden");
        } else {
            $tips.addClass("mz-hidden");
        }
    }

    _onShow(args) {
        // console.log(args);
        this.cntDown = 5;
        this.disableClose();
    }

    init() {
        this.createDom();
        mzModal.init(this.config);
        this.preventAccidentalClose();
    }

    buildHtml() {
        return tplHtml
            .replace(/{modal-id}/g, this.modalId)
            .replace(/{content}/g, msg.content)
            .replace(/{title}/g, msg.title);
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
    }

    // 防止非预期关闭
    preventAccidentalClose() {
        const _this = this;
        // this.$modal 绑定鼠标按下事件
        this.$modal.on("mousedown", (e) => {
            console.log(e);
            // 触发元素为 mz-modal__container 内部元素，但不是关闭按钮
            if (e.target.classList.contains("mz-modal__container") && !e.target.classList.contains("mz-modal__close")) {
                _this.disableClose();
            }
            // 延迟恢复关闭
            setTimeout(() => {
                _this.enableClose();
            }, 300);
        });
    }


    addClass() {
        if (this.NODE_ENV === "dev") return;
        this.$modal.addClass("ads");
    }

    setTips() {
        const _tips = (cnt) => {
            return cnt > 0 ? `${cnt} 秒后方可关闭` : "再次点击关闭→";
        };
        const $tips = this.$modal.find(".js-mz-tips");
        $tips.text(_tips(this.cntDown));
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
            _this.cntDown -= 1;
            this.setTips();
            if (_this.cntDown <= 0) {
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

    show() {
        mzModal.show(this.modalId, this.config);
        return this;
    }

}

const paidOrAdInstance = new paidOrAd();
paidOrAdInstance
    .show()
    .addClass();

export default paidOrAdInstance;

// if (typeof window !== "undefined") {
//     window.mzLibPaidOrAd = paidOrAdInstance;
// }
