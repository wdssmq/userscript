import {
  $na,
  _log,
  fnCopy,
  fnElChange,
} from "./_base";
import { gob } from "./_gob";

const objPodList = {
  baseInfo: {
    $$page: null,
    $podItem: null,
    bid: null,
    title: null,
  },
  pageUrlList: [],
  init() {
    this.setBase();
  },
  setBase() {
    if (this.baseInfo.$podItem) {
      return;
    }
    const $curVideo = Array.from($na(".pod-item.simple")).find($item => $item.dataset.scrolled === "true");
    if (!$curVideo) {
      return null;
    }
    // 解析分页信息
    this.baseInfo.$$page = $curVideo.querySelectorAll(".page-item");
    this.baseInfo.$podItem = $curVideo;
    this.baseInfo.bid = $curVideo.dataset.key;
    this.baseInfo.title = $curVideo.querySelector(".head .title-txt").textContent.trim();
    // 生成分页链接列表
    this.pageUrlList = this.genPageUrlList();
    // 绑定复制链接事件
    this.bindCopy();

    _log(this.pageUrlList);
  },
  genPageUrlList() {
    const pageUrlList = [];
    this.baseInfo.$$page.forEach(($page, i) => {
      const title = $page.querySelector(".title-txt").textContent.trim();
      const cid = i + 1;
      const url = `https://www.bilibili.com/video/${this.baseInfo.bid}/?p=${cid}`;
      pageUrlList.push({
        title,
        cid,
        url,
      });
    });
    return pageUrlList;
  },
  bindCopy() {
    const $btn = document.querySelector(".video-pod__header .pod-description-reference");
    fnCopy($btn, gob.fnMakeUrlFile(this.pageUrlList, this.baseInfo.bid));
  },
};

fnElChange(document.body, (_mutationRecord, _mutationObserver) => {
  objPodList.init();
}, false);
