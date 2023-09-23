// 引入 bulma
// import "../node_modules/bulma/bulma.sass";

// 自定义 bulma
// import "../src/style/bulma.sass";
// import "./style/bulma.sass";


import $ from "./base/_domq.js";
import "./mz-ui/mz-ui.sass";
import mzModal from "./mz-ui/mz-modal";
import tplHtml from "./base/_tplHtml.js";

const msg = {
    title: "这里是标题",
    content: `
    理论上你可以直接关掉本弹窗，不影响后续功能的使用；
    根据你的选择，将决定之后出现的周期；
    或者使用 uBlock Origin 等广告过滤插件永久屏蔽；
    <code>${location.hostname}##.mz-modal.ads</code>
    `.trim(),
};

class paidOrAd {

    domCreated = false;
    modalId = "paid-or-ad";
    $modal = null;
    cntDown = 5;
    cntDownRunning = false;
    config = {};

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
        this.addClass();
        mzModal.init(this.config);
    }

    buildHtml() {
        msg.content = ((content) => {
            const arrLines = content.split("\n").map((line) => {
                return line.trim();
            });
            return `<p>${arrLines.join("</p><p>")}</p>`;
        })(msg.content);
        // console.log(msg.content);
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
    }

    addClass() {
        this.$modal.addClass("ads");
    }

    setTips() {
        const _tips = (cnt) => {
            return cnt > 0 ? `${cnt} 秒后方可关闭` : "再次点击关闭";
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
paidOrAdInstance.show();

export default paidOrAdInstance;

// if (typeof window !== "undefined") {
//     window.mzLibPaidOrAd = paidOrAdInstance;
// }
