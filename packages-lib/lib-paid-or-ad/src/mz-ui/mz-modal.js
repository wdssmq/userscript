class Modal {
    config = null;

    constructor({
        modalId,
        triggers = [],
        openClass = "is-open",
        openTrigger = "data-mz-modal-trigger",
        closeTrigger = "data-mz-modal-close",
        debugMode = false,
    }) {
        this.modal = document.getElementById(modalId);
        if (!this.modal) throw new Error(`Modal with ID ${modalId} not found.`);
        this.config = { openClass, openTrigger, closeTrigger, debugMode };
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
        if (event.keyCode === 27) this.closeModal(event); // esc
        // if (event.keyCode === 9) this.retainFocus(event); // tab
    }

    onClick(event) {
        if (this.config.debugMode) {
            console.log(event.target);
            console.log(this.config);
        }
        if (
            event.target.hasAttribute(this.config.closeTrigger) ||
            event.target.parentNode.hasAttribute(this.config.closeTrigger)
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

        // this.config.onShow(this.modal, this.activeElement, event);
    }

    closeModal(event = null) {
        const modal = this.modal;
        this.modal.setAttribute("aria-hidden", "true");
        this.removeEventListeners();
        // this.scrollBehaviour("enable");
        // if (this.activeElement && this.activeElement.focus) {
        //   this.activeElement.focus();
        // }
        // this.config.onClose(this.modal, this.activeElement, event);
        modal.classList.remove(this.config.openClass);
    }
}

const mzModal = (() => {

    let activeModal = null;

    // 同一个弹出层可以有多个触发器，对其进行关联
    const generateTriggerMap = (triggers, triggerAttr) => {
        const triggerMap = [];
        triggers.forEach((trigger) => {
            const modalId = trigger.attributes[triggerAttr].value;
            if (triggerMap[modalId] === undefined) triggerMap[modalId] = [];
            triggerMap[modalId].push(trigger);
        });

        return triggerMap;
    };

    // init
    const init = (config) => {
        const options = Object.assign({}, { openTrigger: "data-mz-modal-trigger" }, config);
        const triggers = [...document.querySelectorAll(`[${options.openTrigger}]`)];
        const triggerMap = generateTriggerMap(triggers, options.openTrigger);

        if (options.debugMode){
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
        if (activeModal) activeModal.removeEventListeners();
        activeModal = new Modal({ modalId, ...options });
        activeModal.showModal();
    };

    return {
        init,
        show,
    };
})();

export default mzModal;
