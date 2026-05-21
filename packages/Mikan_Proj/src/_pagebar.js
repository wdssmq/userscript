import {
  _log,
  $n,
  $na,
  fnElChange,
  lsObj,
} from "./_base";

const LAST_PAGE_KEY = "lastPage";

const pageBar = {
  curPage: 1,
  nextPage: null,
  prevPage: null,
  gotoFlag: false,

  $anList: null,

  $dateText: null,
  $$dateLi: null,

  // 初始化
  init() {
    this.$anList = $n("#an-list");
    this.$dateText = $n(".date-text");
    // console.log(this.$anList, this.$dateText);
    if (!this.$anList || !this.$dateText) {
      // _log("未找到必要的 DOM 元素，分页组件无法初始化");
      return;
    }
    this.$$dateLi = $na(".date-select .dropdown-submenu li>a");
    const lastPage = lsObj.getItem(LAST_PAGE_KEY, 1);
    if (lastPage >= 1 && lastPage <= this.$$dateLi.length) {
      this.curPage = lastPage;
    }
    this.insertPagebar();
  },

  // 插入分页组件
  insertPagebar() {
    const pagebar = document.createElement("div");
    pagebar.classList.add("sk-bangumi", "pagebar", "is-flex", "is-align-center", "is-justify-evenly");
    let pagebarHTML = `
      <a href="javascript:;" class="prev">上一页</a>
      <span class="cur-page">{{curPage}}</span>
      <a href="javascript:;" class="next">下一页</a>
    `;
    pagebarHTML = pagebarHTML.replace("{{curPage}}", this.$dateText.textContent.trim());
    pagebar.innerHTML = pagebarHTML
    this.$anList.insertAdjacentElement("afterend", pagebar);

    // 获取分页按钮
    const $prev = $n(".pagebar .prev");
    const $next = $n(".pagebar .next");

    // 绑定点击事件
    $prev.addEventListener("click", () => {
      if (this.prevPage !== null) {
        this.gotoPage(this.prevPage, $prev, $next);
      }
    });
    $next.addEventListener("click", () => {
      if (this.nextPage !== null) {
        this.gotoPage(this.nextPage, $prev, $next);
      }
    });

    // 监听 $dateText 的变化，更新分页信息
    fnElChange(this.$dateText, () => {
      this.updatePageInfo($prev, $next);
    });

    if (this.curPage !== 1) {
      // 自动跳转到上次访问的页码
      this.gotoPage(this.curPage, $prev, $next);
    } else {
      // 初始更新分页信息
      this.updatePageInfo($prev, $next, true);
    }
  },

  // 跳转到指定页码（页码从 1 开始）
  gotoPage(pageNo, $prev, $next) {
    if (pageNo < 1 || pageNo > this.$$dateLi.length) {
      return;
    }
    this.gotoFlag = true;
    this.curPage = pageNo;
    const pageIndex = pageNo - 1;
    this.$$dateLi[pageIndex].click();
  },

  // 根据季度文本获取页码（页码从 1 开始）
  getPageByDate(dateText) {
    for (let i = 0; i < this.$$dateLi.length; i++) {
      const $li = this.$$dateLi[i];
      const year = $li.getAttribute("data-year");
      const season = $li.getAttribute("data-season");
      if (dateText === `${year} ${season}季番组`) {
        return i + 1;
      }
    }
    return 1;
  },

  // 更新分页信息
  updatePageInfo($prev = null, $next = null, isInit = false) {
    const dateText = this.$dateText.textContent.trim();
    if (!isInit) {
      if (this.gotoFlag) {
        this.gotoFlag = false;
      } else {
        this.curPage = this.getPageByDate(dateText);
      }
      lsObj.setItem(LAST_PAGE_KEY, this.curPage);
    }

    const nextPage = this.curPage + 1;
    if (nextPage <= this.$$dateLi.length) {
      this.nextPage = nextPage;
      $next.textContent = `下一页（${this.nextPage}）`;
      $next.classList.remove("disabled");
    } else {
      this.nextPage = null;
      $next.textContent = "";
      $next.classList.add("disabled");
    }
    const prevPage = this.curPage - 1;
    if (prevPage >= 1) {
      this.prevPage = prevPage;
      $prev.textContent = `上一页（${this.prevPage}）`;
      $prev.classList.remove("disabled");
    } else {
      this.prevPage = null;
      $prev.textContent = "";
      $prev.classList.add("disabled");
    }
    $n(".pagebar .cur-page").textContent = dateText + `（${this.curPage}）`;
  },
}

pageBar.init();
