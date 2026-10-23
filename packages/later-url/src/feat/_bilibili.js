import {
  $n,
  $na,
  _curUrl,
  _error,
  _getDateStr,
  _log,
  _logHis,
  _logOnce,
  _sleep,
  fnElChange,
} from "../_base";

import { gob } from "../_gob";
import {
  // createPromise,
  createQueue,
  runQueue,
} from "../func/_queue";

// 新版空间页（fresh-space）选择器
const SEL = {
  // 用户名
  username: ".header-upinfo .upinfo-detail .nickname",
  // 视频列表外层容器
  list: ".space-upload .video-list",
  // 单个视频卡片
  card: ".space-upload .video-list .upload-video-card",
  // 列表加载中
  loading: ".space-upload .video-body .loading",
  // 空列表
  empty: ".space-upload .video-body .empty",
  // 列表头部，进度条挂载位置
  header: ".video-header__top",
};
// 从链接中提取 BVID
const RE_BVID = /\/video\/(BV[0-9A-Za-z]+)/;
// 卡片中的日期文本
const RE_DATE = /\d{4}-\d{1,2}-\d{1,2}/;

// df For Old ↑
// df For Old ↑

// df For New ↓
// df For New ↓

// 快速防重
const stopQuick = {
  key: "",
  // 组成 key 的 bvid
  bvids: new Set(),
  // 本网址会话内已走过 fnPost 的 bvid
  tried: new Set(),
  // 当前 key 是否已写入过计数
  written: false,

  // 网址变化时重置
  reset() {
    this.key = "";
    this.bvids.clear();
    this.tried.clear();
    this.written = false;
  },

  // 检查快速防重是否触发，只读检查
  checkOnly(quickKey) {
    if (!quickKey || !gob.stopByQuickCheck(quickKey, false)) {
      return false;
    }
    _logOnce("stopQuick.checkOnly() - 快速防重触发\n", quickKey);
    return true;
  },

  // 更新快速防重 key，并另存一份组成 key 的 bvid
  setKey(quickKey, quickBvids) {
    if (quickKey === this.key) {
      return;
    }
    this.key = quickKey;
    this.bvids = new Set(quickBvids);
    this.written = false;
  },

  // 记录走过一遍 fnPost 的 bvid，全部到齐后才写入计数
  // 网址变化或 key 变化前，同一 key 只写一次
  writeCheck(bvid) {
    if (bvid) {
      this.tried.add(bvid);
    }
    const { key, bvids, tried, written } = this;
    if (written || !key || bvids.size === 0) {
      return false;
    }
    const bAllTried = Array.from(bvids).every(item => tried.has(item));
    if (!bAllTried) {
      return false;
    }
    this.written = true;
    _logOnce("stopQuick.writeCheck() - 已全部发送，写入计数\n", key);
    return !!gob.stopByQuickCheck(key, true);
  },
};

// df bilibili

const bilibili = {
  // 变量复用
  data: {
    uid: "",
    username: "",
    category: "default",
    date: _getDateStr(),
  },

  // 需要的页面元素
  _$list: {
    $warp: null,
    $title: null,
    $progress: null,
    $cards: [],
  },

  // 已处理过的视频，避免列表重复渲染时重发
  _sent: new Set(),
  // 防止重复执行
  _busy: false,

  // 获取当前用户的 uid
  getUid() {
    const oMatch = gob.curUrl.match(/space\.bilibili\.com\/(\d+)/);
    if (!oMatch) {
      _logOnce("bilibili.getUid() - 未匹配到 uid\n", gob.curUrl);
      return "";
    }
    const uid = oMatch[1];
    this.data.uid = uid;
    this.data.category = `bilibili_${uid}`;
    // _logOnce("bilibili.getUid()\n", this.data);
    return uid;
  },

  // 获取用户名
  getUsername() {
    const $username = $n(SEL.username);
    if ($username) {
      this.data.username = $username.textContent.trim();
    }
    // 兜底：document.title 形如 「某某的个人空间-某某个人主页-哔哩哔哩视频」
    if (!this.data.username) {
      const oMatch = document.title.match(/^(.+?)的个人空间/);
      if (oMatch) {
        this.data.username = oMatch[1];
      }
    }
    // _logOnce("bilibili.getUsername()\n", this.data.username);
    return this.data.username;
  },

  // 当前页渲染出的视频卡片
  _$cards() {
    return $na(SEL.card);
  },

  // 网页加载检查
  async check(maxTry = 20) {
    this.data.username = this.getUsername();
    this.data.uid = this.getUid();
    _logOnce("bilibili.check() - 当前用户信息\n", this.data);

    for (let i = 0; i < maxTry; i++) {
      // 需要的页面元素：列表头部、标题、视频卡片
      const $warp = $n(SEL.header);
      const $title = $warp?.querySelector(".title");
      const $cards = [...this._$cards()];
      this._$list.$warp = $warp;
      this._$list.$title = $title;
      this._$list.$cards = $cards;
      // 三者都在，才算加载完成
      if ($warp && $title && $cards.length > 0) {
        return {
          loaded: true,
        };
      }
      // 没有卡片且不在加载中、且列表为空，则无需继续等待
      if (!$n(SEL.loading) && $n(SEL.empty)) {
        return {
          loaded: true,
        };
      }
      await _sleep(500);
    }
    _log("bilibili.check() - 等待超时\n", {
      warp: !!this._$list.$warp,
      title: !!this._$list.$title,
      cards: this._$list.$cards.length,
    });
    return {
      loaded: false,
    };
  },

  // 在页面元素中显示进度
  showProgress(itemIndex = -1, pageTotal = -1, remoteTotal = -1) {
    const $warp = this._$list.$warp;
    const $title = this._$list.$title;
    if (!$warp || !$title) {
      return;
    }
    // 向 $warp 中添加进度元素
    let $progress = $n("#gm-progress");
    if (!$progress) {
      const $div = document.createElement("div");
      $div.id = "gm-progress";
      $div.style = "margin-left: auto;";
      $div.style.color = "red";
      $div.style.fontSize = "18px";
      $div.style.fontWeight = "bold";
      // 加到 $title 后面
      $title.parentNode.insertBefore($div, $title.nextSibling);
      $progress = $div;
    }
    // 更新进度
    $progress.textContent = `进度: ${itemIndex}/${pageTotal} 远程: ${remoteTotal}`;
    if (!$n("#gm-copy-up")) {
      const $button = document.createElement("button");
      $button.id = "gm-copy-up";
      $button.type = "button";
      $button.textContent = "复制";
      $button.style = "margin-left: 8px;";
      $button.classList.add("vui_button");
      $button.addEventListener("click", async () => {
        const text = `uid: ${this.data.uid}\nname: ${this.data.username}\ntype: up`;
        try {
          await navigator.clipboard.writeText(text);
          $button.textContent = "已复制";
          setTimeout(() => {
            $button.textContent = "复制";
          }, 1500);
        }
        catch (error) {
          _error("bilibili.copyUpInfo() - error\n", error);
          $button.textContent = "复制失败";
        }
      });
      $progress.insertAdjacentElement("beforebegin", $button);
    }
  },

  // 重置进度条
  resetProgress() {
    this.showProgress(-1, -1, -1);
  },

  // 从卡片中提取需要的信息
  pickCard($card) {
    // 卡片中的视频链接（封面、标题均指向视频页）
    const $link = $card.querySelector("a[href*=\"/video/BV\"]");
    if (!$link) {
      return null;
    }
    const oMatch = $link.getAttribute("href").match(RE_BVID);
    if (!oMatch) {
      return null;
    }
    const bvid = oMatch[1];
    // 标题：网格模式在卡片标题，列表模式在卡片外层 a.title
    let title = "";
    const $title = $card.querySelector(".bili-video-card__title");
    if ($title) {
      title = $title.getAttribute("title") || $title.textContent;
    }
    if (!title) {
      const $aTitle = $card.querySelector("a.title");
      if ($aTitle) {
        title = $aTitle.getAttribute("title") || $aTitle.textContent;
      }
    }
    // 日期：「xxxx-xx-xx」
    const $subtitle = $card.querySelector(".bili-video-card__subtitle");
    const oDate = ($subtitle ? $subtitle.textContent : $card.textContent).match(RE_DATE);
    return {
      uid: this.data.uid,
      name: this.data.username,
      bvid,
      title: title.trim(),
      date: oDate ? oDate[0] : _getDateStr(),
      url: `https://www.bilibili.com/video/${bvid}`,
      category: this.data.category,
    };
  },

  // 从网页元素中获取投稿视频
  async getVideosFromPage($cards) {
    const videoList = $cards || [...this._$cards()];
    const videos = [];
    const bvids = new Set();
    videoList.forEach(($card) => {
      const v = this.pickCard($card);
      if (!v || bvids.has(v.bvid)) {
        return;
      }
      bvids.add(v.bvid);
      videos.push(v);
    });
    // bvids 里取首尾各两个 bvid
    const arrTmp = [...bvids];
    const arrSet = new Set(arrTmp.slice(0, 2).concat(arrTmp.slice(-2)));
    return {
      videos,
      quickKey: Array.from(arrSet).join("_"),
      quickBvids: arrSet,
    };
  },

  // 主函数
  main() {
    // 避免 MutationObserver 触发导致的重复执行
    if (this._busy) {
      return;
    }
    // 获取当前网址
    gob.curUrl = _curUrl();
    // 判断网址是否匹配 https://space.bilibili.com/7078836/upload/video
    if (!gob.curUrl.match(/space\.bilibili\.com\/\d+\/upload\/video/)) {
      return;
    }
    // 网址改变时重置状态
    if (gob.curUrl !== gob.lstUrl) {
      gob.lstUrl = gob.curUrl;
      this._sent.clear();
      stopQuick.reset();
      this.resetProgress();
      _logHis.clear();
    }
    // 加载完成后的快速防重检查，实际加载检查在这之后
    const quickKeyAtStart = stopQuick.key;
    if (stopQuick.checkOnly(quickKeyAtStart)) {
      return;
    }
    this._busy = true;
    // 加载检查中的快速防重标记
    let bQuickCheckStopped = false;
    // 等待列表渲染完成，元素存于 this._$list
    this.check().then((checkResult) => {
      // 初始显示进度
      this.showProgress();
      // 取需要的页面元素
      const $cards = checkResult.loaded ? this._$list.$cards : [];
      // 获取用户投稿视频
      return this.getVideosFromPage($cards);
    }).then(({ videos, quickKey, quickBvids }) => {
      _logOnce("bilibili.main()->vlist\n", videos);
      // 更新快速防重 key，并另存一份组成 key 的 bvid
      stopQuick.setKey(quickKey, quickBvids);
      if (quickKey !== quickKeyAtStart && stopQuick.checkOnly(quickKey)) {
        bQuickCheckStopped = true;
        return;
      }
      // 过滤掉已经发送过的视频
      const list = videos.filter(v => !this._sent.has(v.bvid));
      list.length && _log("bilibili.main()\n", {
        total: videos.length,
        new: list.length,
      });
      if (list.length === 0) {
        return;
      }
      list.forEach(v => this._sent.add(v.bvid));
      // 更新进度通过 bilibili.data 传给 gob.postCF
      bilibili.data.showProgress = (itemIndex, remoteTotal) => {
        bilibili.showProgress(itemIndex, list.length, remoteTotal);
      };
      // 计数器清零
      gob.postIndex = 0;
      gob.postCount = 0;
      gob.errCount = 0;
      // _logOnce("bilibili.main()->data", bilibili.data);
      // 两套远程各发一次，任一成功即算成功
      const fnPost = async (info, data) => {
        const rltCF = await gob.postCF(info, data);
        const rltZBP = await gob.postZBP(info, data);
        // 无论成功与否，该 bvid 都算走过一遍 fnPost
        stopQuick.writeCheck(info.bvid);
        return rltCF || rltZBP;
      };
      // 对于 list 中的每个视频，发送到远程，使用异步队列
      const queue = createQueue(list, fnPost, bilibili.data);
      runQueue(queue);
    }).catch((error) => {
      _log("bilibili.main() - error\n", error);
    }).finally(() => {
      this._busy = false;
      if (bQuickCheckStopped) {
        return;
      }
      // 执行期间页面可能又渲染出新内容，补一次检查
      const bHasNew = [...this._$cards()].some(($card) => {
        const v = this.pickCard($card);
        return v && !this._sent.has(v.bvid);
      });
      if (bHasNew) {
        setTimeout(() => this.main(), 500);
      }
    });
  },

  // 监听网页元素变化
  watch() {
    const $body = $n("body");
    if (!$body) {
      return;
    }
    const _this = this;
    fnElChange($body, _this.main.bind(_this));
  },
};

bilibili.watch();
bilibili.main();
