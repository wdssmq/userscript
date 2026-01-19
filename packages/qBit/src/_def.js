/* global __GM_api, MochaUI */

import {
  $n,
  _log,
  curUrl,
} from "./_base";
import DefForm from "./_defForm";
import { http } from "./_http";
import tplEdt from "./tpl/edt.html";
import "./style/style.css";

import { registerRssAutoDlBtn } from "./_rssRule";

if (typeof __GM_api !== "undefined") {
  _log(__GM_api);
}

const gob = {
  data: {
    qbtVer: sessionStorage.qbtVersion,
    apiVer: "2.x",
    apiBase: `${curUrl}api/v2/`,
    listTorrent: [],
    curTorrentTrackers: [],
    tips: {
      tit: {},
      btn: {},
    },
    modalShow: false,
  },
  http,
  // 解析返回
  parseReq(res, type = "text") {
    // _log(res.finalUrl, "\n", res.status, res.response);
    if (res.status !== 200) {
      throw new Error("API Http Request Err");
    }
    if (type === "json") {
      return JSON.parse(res.response);
    }
    else {
      return res.response;
    }
  },
  // /api/v2/APIName/methodName
  apiUrl(method = "app/webapiVersion") {
    return gob.data.apiBase + method;
  },
  // 判断 API 是否支持 tag 查询（2.8.3 及以上）
  apiSupportsTag(min = "2.8.3") {
    const ver = gob.data.apiVer || "";
    const parse = s => s.split(".").map(n => Number.parseInt(n, 10) || 0);
    const a = parse(ver);
    const b = parse(min);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const ai = a[i] || 0;
      const bi = b[i] || 0;
      if (ai > bi)
        return true;
      if (ai < bi)
        return false;
    }
    return true;
  },
  // 获取种子列表: torrents/info?tag=test 或 category=test (2.8.3+)
  apiTorrents(filter = "", fn = () => { }) {
    // category 查询
    const tryCategory = () => {
      const url = gob.apiUrl(`torrents/info?category=${filter}`);
      gob.http.get(url).then((res) => {
        gob.data.listTorrent = gob.parseReq(res, "json");
        fn();
      }).catch(() => {
        gob.data.listTorrent = [];
        fn();
      });
    };
    // tag 查询
    const tryTag = () => {
      const url = gob.apiUrl(`torrents/info?tag=${filter}`);
      gob.http.get(url).then((res) => {
        const list = gob.parseReq(res, "json");
        if (list.length > 0) {
          gob.data.listTorrent = list;
          fn();
        }
        else {
          tryCategory();
        }
      }).catch(tryCategory);
    };
    if (filter) {
      // tag 参数自 v2.8.3 支持，低版本使用 category 查询
      if (gob.apiSupportsTag()) {
        tryTag();
      }
      else {
        tryCategory();
      }
    }
  },
  // 获取指定种子的 Trackers: torrents/trackers
  apiGetTrackers(hash, fn = () => { }) {
    const url = gob.apiUrl(`torrents/trackers?hash=${hash}`);
    gob.http.get(url).then((res) => {
      _log("apiGetTrackers()\n", hash, gob.parseReq(res, "json"));
      gob.data.curTorrentTrackers = gob.parseReq(res, "json");
    }).finally(fn);
  },
  // 替换 Tracker: torrents/editTracker
  apiEdtTracker(hash, origUrl, newUrl, isPartial = false) {
    _log("apiEdtTracker()\n", hash, origUrl, newUrl);
    const url = gob.apiUrl("torrents/editTracker");
    if (isPartial) {
      gob.apiGetTrackers(hash, () => {
        const seedTrackers = gob.data.curTorrentTrackers;
        seedTrackers.forEach((tracker) => {
          if (tracker.url.includes(origUrl)) {
            const updatedUrl = tracker.url.replace(origUrl, newUrl);
            gob.http.post(url, { hash, origUrl: tracker.url, newUrl: updatedUrl });
          }
        });
      });
    }
    else {
      gob.http.post(url, { hash, origUrl, newUrl });
    }
  },
  // 添加 Tracker: torrents/addTrackers
  apiAddTracker(hash, urls) {
    const url = gob.apiUrl("torrents/addTrackers");
    gob.http.post(url, { hash, urls });
  },
  // 删除 Tracker: torrents/removeTrackers
  apiDelTracker(hash, urls) {
    const url = gob.apiUrl("torrents/removeTrackers");
    gob.http.post(url, { hash, urls });
  },

  // 获取 RSS 订阅
  apiRssFeeds(fn = () => { }) {
    const url = gob.apiUrl("rss/items");
    gob.http.get(url).then((res) => {
      // _log("apiRssFeeds()\n", gob.parseReq(res, "json"));
      return gob.parseReq(res, "json");
    }).then(fn);
  },

  // RSS 自动下载规则
  apiRssSetRule(ruleName, ruleDef, fn = () => { }) {
    const url = gob.apiUrl("rss/setRule");
    gob.http.post(url, { ruleName, ruleDef }).then((res) => {
      _log("apiRssSetRule()\n", gob.parseReq(res));
    }).finally(fn);
  },

  // 获取 API 版本信息
  apiInfo(fn = () => { }) {
    const url = gob.apiUrl();
    gob.http.get(url).then((res) => {
      gob.data.apiVer = gob.parseReq(res);
    }).finally(fn);
  },
  // 显示提示信息到页面
  viewTips() {
    if (!gob.data.modalShow) {
      return;
    }
    for (const key in gob.data.tips) {
      if (Object.hasOwnProperty.call(gob.data.tips, key)) {
        const tip = gob.data.tips[key];
        const $el = $n(`.js-tip-${key}`);
        const text = JSON.stringify(tip).replace(/(,|:)"/g, "$1 ").replace(/["{}]/g, "");
        if (text) {
          $el.textContent = `(${text})`;
        }
        if (key === "btn") {
          $el.style.color = "var(--color-text-red)";
        }
      }
    }
  },
  // 更新提示信息
  upTips(key = "tit", tip) {
    const tipData = gob.data.tips[key];
    Object.assign(tipData, tip);
    gob.viewTips();
  },
  init() {
    gob.apiInfo(() => {
      _log(gob.data);
    });
  },
};

gob.init();

// 构建编辑入口
$n("#desktopNavbar ul").insertAdjacentHTML(
  "beforeend",
  "<li><a class=\"js-modal\"><b>→批量替换 Tracker←</b></a></li>",
);

// js-modal 绑定点击事件
$n(".js-modal").addEventListener("click", () => {
  const _modal = new MochaUI.Window({
    id: "js-modal",
    title: "批量替换 Tracker <span class=\"js-tip-tit\"></span>",
    loadMethod: "iframe",
    contentURL: "",
    scrollbars: true,
    resizable: true,
    maximizable: false,
    closable: true,
    paddingVertical: 0,
    paddingHorizontal: 0,
    width: 500,
    height: 360,
  });
  // console.log(modal);

  const modalContent = $n("#js-modal_content");
  modalContent.innerHTML = tplEdt;
  const modalContentWrapper = $n("#js-modal_contentWrapper");
  modalContentWrapper.style.height = "auto";
  gob.data.modalShow = true;
  gob.upTips("tit", {
    qbt: gob.data.qbtVer,
    api: gob.data.apiVer,
  });

  // 初始化表单
  gob.formObj = new DefForm();

  // debug
  // $n(".js-input[name=category]").value = "test";
  // $n(".js-input[name=origUrl]").value = "123";
  // $n(".js-input[name=newUrl]").value = "456";
  // $n(".js-input[name=matchSubstr]").click();
});

// 自动点击
if (process.env.NODE_ENV === "dev") {
  setTimeout(() => {
    $n(".js-modal").click();
  }, 1500);
}

function fnCheckUrl(name, url) {
  // 判断是否以 udp:// 或 http(s):// 开头
  const regex = /^(?:udp|https?):\/\//;
  return [
    name,
    regex.test(url),
  ];
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("btn-act")) {
    gob.act = gob.formObj.curSelect;
    gob.urlCheck = [];
    const formData = gob.formObj.getFormData();
    // 判断筛选条件
    if (!formData.filter || /全部|未分类|无标签/.test(formData.filter)) {
      gob.upTips("btn", {
        msg: "「标签」或「分类」错误，请重新输入",
      });
      return;
    }
    // 遍历数据，如果 key 含有 Url，则判断 value 是否符合要求
    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key];
        if (key.includes("Url")) {
          // 判断是否符合要求
          gob.urlCheck.push(fnCheckUrl(key, value));
        }
      }
    }

    let isOk = gob.urlCheck.every((item) => {
      return item[1];
    });

    if (gob.act === "partialReplace") {
      const isOk2 = gob.urlCheck.every((item) => {
        return !item[1];
      });
      if (!isOk && !isOk2) {
        gob.upTips("btn", {
          msg: "子串替换模式下，请对应输入要替换的新旧文本",
        });
        return;
      }
    }

    if (gob.act === "remove" && formData.trackerUrl === "****") {
      isOk = confirm("继续将清空匹配任务的全部 Tracker");
      gob.act = "removeAll";
    }

    if (!isOk) {
      gob.urlCheck.forEach((item) => {
        if (!item[1]) {
          gob.upTips("btn", {
            msg: `「${item[0]}」不符合要求`,
          });
        }
      });
      return;
    }

    const fnRemoveAll = (hash) => {
      gob.apiGetTrackers(hash, () => {
        const seedTrackers = gob.data.curTorrentTrackers;
        const seedTrackersUrl = seedTrackers.map((item) => {
          return item.url;
        });
        gob.apiDelTracker(hash, seedTrackersUrl.join("|"));
      });
    };

    gob.apiTorrents(formData.filter, () => {
      const list = gob.data.listTorrent;
      _log("apiTorrents()\n", list);
      if (list.length === 0) {
        gob.upTips("btn", {
          msg: "没有符合条件的种子，请确认分类存在且添加要修改的任务项；",
        });
        return;
      }
      list.forEach((item) => {
        switch (gob.act) {
          case "replace":
            gob.apiEdtTracker(item.hash, formData.origUrl, formData.newUrl, false);
            break;
          case "partialReplace":
            gob.apiEdtTracker(item.hash, formData.origUrl, formData.newUrl, true);
            break;
          case "add":
            gob.apiAddTracker(item.hash, formData.trackerUrl);
            break;
          case "remove":
            gob.apiDelTracker(item.hash, formData.trackerUrl);
            break;
          case "removeAll":
            fnRemoveAll(item.hash);
            break;
          default:
            break;
        }
      });
      gob.upTips("btn", {
        num: list.length,
        msg: "操作完成",
      });
    });
  }
  // RSS 自动下载规则按钮
  if (event.target.textContent.trim() === "RSS") {
    registerRssAutoDlBtn(gob, event.target);
  }
});
