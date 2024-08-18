/* global jQuery, __GM_api, MochaUI */

import {
  _log,
  $n,
  curUrl,
  fnCheckObj,
} from "./_base";
import { http } from "./_http";
import defForm from "./_defForm";

if (typeof __GM_api !== "undefined") {
  _log(__GM_api);
}

const gob = {
  data: {
    qbtVer: sessionStorage.qbtVersion,
    apiVer: "2.x",
    apiBase: curUrl + "api/v2/",
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
    } else {
      return res.response;
    }
  },
  // /api/v2/APIName/methodName
  apiUrl(method = "app/webapiVersion") {
    return gob.data.apiBase + method;
  },
  // 获取种子列表: torrents/info?&category=test
  apiTorrents(category = "", fn = () => { }) {
    const url = gob.apiUrl(`torrents/info?category=${category}`);
    gob.http.get(url).then((res) => {
      gob.data.listTorrent = gob.parseReq(res, "json");
    }).finally(fn);
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
  apiEdtTracker(hash, origUrl, newUrl) {
    _log("apiEdtTracker()\n", hash, origUrl, newUrl);
    const url = gob.apiUrl("torrents/editTracker");
    gob.http.post(url, { hash, origUrl, newUrl });
  },
  // 添加 Tracker: torrents/addTrackers
  apiAddTracker(hash, urls) {
    const url = gob.apiUrl("torrents/addTrackers");
    gob.http.post(url, { hash, urls });
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
        $el.innerText = `(${text})`;
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

// 构建编辑框
const strHtml = `
<div style="padding:13px 23px;">\
    <div class="act-tab" style="display: flex;">操作模式：</div>\
    <hr>
    <h2>分类: （不能是「全部」或「未分类」，区分大小写）<h2><input class="js-input" type="text" name="category" style="width: 97%;" placeholder="包含要修改项目的分类或新建一个">\
    <h2>Tracker: <span class="js-tip-btn"></span></h2>\
    <div class="act-body"></div>\
    <hr>
    「<a target="_blank" title="投喂支持" href="https://www.wdssmq.com/guestbook.html#h3-u6295u5582u652Fu6301" rel="nofollow">投喂支持</a>」\
    「<a target="_blank" title="QQ 群 - 我的咸鱼心" href="https://jq.qq.com/?_wv=1027&k=SRYaRV6T" rel="nofollow">QQ 群 - 我的咸鱼心</a>」\
</div>
`;

// js-modal 绑定点击事件
$n(".js-modal").addEventListener("click", function() {
  const modal = new MochaUI.Window({
    id: "js-modal",
    title: "批量替换 Tracker <span class=\"js-tip-tit\"></span>",
    loadMethod: "iframe",
    contentURL: "",
    scrollbars: true,
    resizable: false,
    maximizable: false,
    closable: true,
    paddingVertical: 0,
    paddingHorizontal: 0,
    width: 500,
    height: 250,
  });
  const modalContent = $n("#js-modal_content");
  modalContent.innerHTML = strHtml;
  const modalContentWrapper = $n("#js-modal_contentWrapper");
  modalContentWrapper.style.height = "auto";
  gob.data.modalShow = true;
  gob.upTips("tit", {
    qbt: gob.data.qbtVer,
    api: gob.data.apiVer,
  });

  // 初始化表单
  gob.formObj = new defForm();

  // debug
  // $n(".js-input[name=category]").value = "test";
  // $n(".js-input[name=origUrl]").value = "123";
  // $n(".js-input[name=newUrl]").value = "456";
  // $n(".js-input[name=matchSubstr]").click();
});

const schemeObj = {
  category: [
    {
      not: "",
      msg: "不能为空",
    },
  ],
  newUrl: [
    {
      not: "",
      msg: "不能为空",
    },
  ],
};


const fnCheckUrl = (name, url) => {
  // 判断是否以 udp:// 或 http(s):// 开头
  const regex = /^(udp|http(s)?):\/\//;
  return [
    name,
    regex.test(url),
  ];
};

document.addEventListener("click", function(event) {
  if (event.target.classList.contains("btn-act")) {
    gob.act = gob.formObj.curSelect;
    gob.urlCheck = [];
    const formData = gob.formObj.getFormData();
    // 遍历数据，如果 key 含有 Url，则判断 value 是否符合要求
    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key];
        if (key.indexOf("Url") > -1) {
          // 判断是否符合要求
          gob.urlCheck.push(fnCheckUrl(key, value));
        }
      }
    }

    gob.apiTorrents(formData.category, () => {
      const list = gob.data.listTorrent;
      _log("apiTorrents()\n", list);
      list.map(function(item) {
        switch (gob.act) {
          case "replace":
            gob.apiEdtTracker(item.hash, formData.origUrl, formData.newUrl);
            break;
          case "add":
            gob.apiAddTracker(item.hash, formData.trackerUrl);
            break;
          default:
            break;
        }
      });
      gob.upTips("btn", {
        num: list.length,
        msg: "操作成功",
      });
    });
    return;
  }
});
