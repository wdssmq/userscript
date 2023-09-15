// 引入 bulma
// import "../node_modules/bulma/bulma.sass";

// 自定义 bulma
// import "../src/style/bulma.sass";
// import "./style/bulma.sass";


import $ from "./base/_domq.js";
import "./mz-ui/mz-ui.sass";
import mzModal from "./mz-ui/mz-modal";
import tplHtml from "./base/_tplHtml.js";

class paidOrAd {

    domCreated = false;
    modalId = "paid-or-ad";
    // modalId = "modal-test";
    config = null;

    constructor(options) {
        this.config = options || {};
        this.init();
    }

    init() {
        this.createDom();
        this.addClass();
        mzModal.init(this.config);
    }

    createDom() {
        const strHtml = tplHtml.replace(/{modal-id}/g, this.modalId);
        if (!this.domCreated) {
            this.domCreated = true;
            $(document.body).append(strHtml);
        }
    }

    addClass() {
        $(`#${this.modalId}`).addClass("ads");
    }

    show() {
        mzModal.show(this.modalId);
    }

}

const paidOrAdInstance = new paidOrAd();
paidOrAdInstance.show();

export default paidOrAdInstance;

// if (typeof window !== "undefined") {
//     window.mzLibPaidOrAd = paidOrAdInstance;
// }
