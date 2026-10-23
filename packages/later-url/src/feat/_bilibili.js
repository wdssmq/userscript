import {
  $n,
  $na,
  _curUrl,
  _getDateStr,
  _log,
  _logHis,
  _logOnce,
  _sleep,
  fnElChange,
} from "../_base";

import { gob } from "../_gob";
import config from "../func/_config";
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

// 过滤字符信息
gob.filter = (str) => {
  let rlt = str;
  rlt = rlt.replace(/\s/g, "");
  rlt = rlt.replace(/#/g, "");
  return rlt;
};

// 发送链接信息到远程
gob.post = async (info, data) => {
  // 如果有 data.showProgress() 函数
  const fnShowProgress = typeof data.showProgress === "function" ? data.showProgress : () => { };
  // 远程服务开关未启用时直接跳过，不计配额也不发请求
  if (!config.data.enableCf) {
    _logOnce("gob.post() - 远程服务未启用，跳过发送");
    return false;
  }
  gob.postIndex += 1;
  if (gob.stopByErrCount()) {
    return false;
  }
  if (gob.stopBySendLimit(info.url)) {
    return false;
  }
  const { baseUrl, authToken } = config.data;
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  info.title = gob.filter(info.title);
  const url = `${baseUrl}add?url=${encodeURIComponent(info.url)}&title=${encodeURIComponent(info.title)}&author=${encodeURIComponent(data.username)}&category=${encodeURIComponent(data.category)}&date=${data.date}`;
  gob.postCount += 1;
  _log(`gob.post() - ${gob.postCount} \n`, url);

  try {
    const res = await gob.http.get(url, headers);
    // _log("gob.post()\n", res);
    _log("gob.post()\n", res.responseText);
    if (res.status !== 200) {
      gob.errCount += 1;
      return false;
    }
    const resJSON = JSON.parse(res.responseText);
    gob.remoteTotal = resJSON.data.count || 0;
    fnShowProgress(gob.postIndex, gob.remoteTotal);
    return true;
  }
  catch (error) {
    gob.errCount += 1;
    _log("gob.post() - error\n", error);
    return false;
  }
};

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
  // 快速防重 key
  _quickKey: "",

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

  // 检查快速防重是否触发
  isQuickCheckStopped(quickKey) {
    if (!quickKey || !gob.stopByQuickCheck(quickKey, true)) {
      return false;
    }
    _logOnce("bilibili.main() - 快速防重触发\n", quickKey);
    return true;
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
      $div.style = "margin: 4px 8px;";
      $div.style.color = "red";
      $div.style.fontSize = "18px";
      $div.style.fontWeight = "bold";
      // 加到 $title 后面
      $title.parentNode.insertBefore($div, $title.nextSibling);
      $progress = $div;
    }
    // 更新进度
    $progress.textContent = `进度: ${itemIndex}/${pageTotal} 远程: ${remoteTotal}`;
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
      this._quickKey = "";
      this.resetProgress();
      _logHis.clear();
    }
    // 加载完成后的快速防重检查，实际加载检查在这之后
    const quickKeyAtStart = this._quickKey;
    if (this.isQuickCheckStopped(quickKeyAtStart)) {
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
    }).then(({ videos, quickKey }) => {
      _logOnce("bilibili.main()->vlist\n", videos);
      // 更新快速防重 key
      this._quickKey = quickKey;
      if (quickKey !== quickKeyAtStart && this.isQuickCheckStopped(quickKey)) {
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
      // 更新进度通过 bilibili.data 传递给 gob.post
      bilibili.data.showProgress = (itemIndex, remoteTotal) => {
        bilibili.showProgress(itemIndex, list.length, remoteTotal);
      };
      // 计数器清零
      gob.postIndex = 0;
      gob.postCount = 0;
      gob.errCount = 0;
      // _logOnce("bilibili.main()->data", bilibili.data);
      // 对于 list 中的每个视频，发送到远程，使用异步队列
      const queue = createQueue(list, gob.post, bilibili.data);
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
