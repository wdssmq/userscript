import {
  $,
  _log,
} from "./_base";

const _postMng = {
  // 属性变量
  $thDate: null,
  // 初始化函数
  init() {
    this.setThDate();
  },
  // 设置表头函数，找到 data-field="date" 的 th 元素并保存到 $thDate 属性中
  setThDate() {
    if (this.$thDate) {
      return;
    }
    const $thDate = $("th");
    for (let i = 0; i < $thDate.length; i++) {
      const $th = $($thDate[i]);
      if ($th.data("field") === "date") {
        this.$thDate = $th;
        break;
      }
    }
  },
  // makeOrderBtn
  makeOrderBtn() {
    // 从网址中获取当前的排序方式
    const curOrder = new URLSearchParams(window.location.search).get("order");
    // 根据当前排序方式设置按钮的链接和文本
    const field = "updatetime";
    let order = "asc";
    if (curOrder === `${field}_asc`) {
      order = "desc";
    }
    else {
      order = "asc";
    }

    return {
      link: `${window.bloghost}zb_system/admin/index.php?act=ArticleMng&order=${field}_${order}`,
      text: `${order === "asc" ? "升序" : "降序"}`,
      icon: order === "asc" ? "icon-arrow-down-short" : "icon-arrow-up-short",
    };
  },
  // 封装一个函数，用于向 $thDate 添加按钮，参数为链接、class 和文本
  addBtn() {
    if (!this.$thDate) {
      _log("[postMng] 无法添加按钮，因为 $thDate 未找到");
      return;
    }
    const { text, link, icon } = this.makeOrderBtn();
    const $btn = $(`<a href="${link}" class="order_button" title="${text}">修改日期<i class="${icon}"></i></a>`);
    this.$thDate.prepend($btn);
    this.$thDate.addClass("flex gap-1 justify-center");
  },

  run() {
    this.addBtn();
  },
};

_postMng.init();

export default _postMng;
