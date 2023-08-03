import {
  _log,
  $n,
  $na,
  fnElChange,
} from "./_base";

const $root = $n("#root");

const _sidebar = {
  $feedlyChrome: null,
  $btnToggle: null,
  $navLeft: null,
  loaded: false,
  _GetDOM() {
    const $$btn = $na("button");
    // 遍历并查找 aria-label 属性值为 "Open Navigation" 的按钮
    for (let i = 0; i < $$btn.length; i++) {
      if ($$btn[i].getAttribute("aria-label")?.indexOf(" Sidebar") > -1) {
        this.$btnToggle = $$btn[i];
        break;
      }
    }
    this.$feedlyChrome = $n("#feedlyChrome");
    this.$navLeft = $n("nav.LeftnavList");
    if (!this.$feedlyChrome || !this.$btnToggle) {
      return;
    }
    this.loaded = true;
    // _log("侧栏开关按钮：", this.$btnToggle);
    // _log("侧栏控制元素：", this.$feedlyChrome);
  },
  _BindEvent() {
    if (!this.loaded) {
      return;
    }
    const _ToggleLeftnav = (act= "show") => {
      $n("body").classList.add("animate-leftnav");
      if (act == "show") {
        this.$feedlyChrome.classList.remove("feedlyChrome--leftnav-closed");
        this.$feedlyChrome.classList.add("feedlyChrome--leftnav-open");
      } else {
        this.$feedlyChrome.classList.remove("feedlyChrome--leftnav-open");
        this.$feedlyChrome.classList.add("feedlyChrome--leftnav-closed");
      }
    };

    // 当鼠标移入按钮时，显示侧栏
    this.$btnToggle.addEventListener("mouseover", () => {
      _ToggleLeftnav("show");
    });
    // 当鼠标移出 .Leftnav 时，隐藏侧栏
    $n(".Leftnav").addEventListener("mouseleave", () => {
      // 判断 $navLeft 的 aria-hidden 属性，为 "false" 时不自动隐藏
      if (this.$navLeft.getAttribute("aria-hidden") == "false") {
        return;
      }
      _ToggleLeftnav("hide");
    });
  },
  init() {
    if (!this.loaded) {
      this._GetDOM();
      this._BindEvent();
    }
  },
};

fnElChange($root, () => {
  _sidebar.init();
});
