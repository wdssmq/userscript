/* global jQuery, __GM_api, MochaUI */

import { _log, curUrl, fnCheckObj } from "./_base";
import { http } from "./_http";
const jq = jQuery;

if (typeof __GM_api !== "undefined") {
  _log(__GM_api);
}

const gob = {
  data: {
    qbtVer: sessionStorage.qbtVersion,
    apiVer: "2.x",
    apiBase: curUrl + "api/v2/",
    listTorrent: [],
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
  // 获取种子列表：torrents/info?&category=test
  apiTorrents(category = "", fn = () => { }) {
    const url = gob.apiUrl(`torrents/info?category=${category}`);
    gob.http.get(url).then((res) => {
      gob.data.listTorrent = gob.parseReq(res, "json");
    }).finally(fn);
  },
  // 替换 Tracker： torrents/editTracker
  apiEdtTracker(hash, origUrl, newUrl) {
    const url = gob.apiUrl("torrents/editTracker");
    gob.http.post(url, { hash, origUrl, newUrl });
  },
  // 添加 Tracker： torrents/addTrackers
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
        const $el = jq(`.js-tip-${key}`);
        const text = JSON.stringify(tip).replace(/(,|:)"/g, "$1 ").replace(/["{}]/g, "");
        $el.text(`(${text})`);
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
jq("#desktopNavbar>ul").append(
  "<li><a class=\"js-modal\"><b>→批量替换 Tracker←</b></a></li>",
);

// 构建编辑框
const strHtml = `
<div style="padding:13px 23px;">\
    <h2>分类：（必须指定分类，区分大小写）<h2><input class="js-input" type="text" name="category" style="width: 97%;"><br>\
    <h2>旧 Trakcer：<h2><input class="js-input" type="text" name="origUrl" style="width: 97%;"><br>\
    <h2>新 Tracker：<h2><input class="js-input" type="text" name="newUrl" style="width: 97%;"><br>\
    <hr>\
    <button class="js-replace">替换</button>\
    <span class="js-tip-btn"></span>\
    <hr>\
    「<a target="_blank" title="爱发电 - @wdssmq" href="https://afdian.net/@wdssmq" rel="nofollow">爱发电 - @wdssmq</a>」\
    「<a target="_blank" title="QQ群 - 我的咸鱼心" href="https://jq.qq.com/?_wv=1027&k=SRYaRV6T" rel="nofollow">QQ群 - 我的咸鱼心</a>」\
</div>
`;

// js-modal 绑定点击事件
jq(".js-modal").click(function () {
  new MochaUI.Window({
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
  jq("#js-modal_content").append(strHtml);
  gob.data.modalShow = true;
  gob.upTips("tit", {
    qbt: gob.data.qbtVer,
    api: gob.data.apiVer,
  });
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

jq(document).on("click", ".js-replace", function () {
  // alert(jq(".js-input[name=category]").val());
  const obj = {
    category: jq(".js-input[name=category]").val().trim(),
    origUrl: jq(".js-input[name=origUrl]").val().trim(),
    newUrl: jq(".js-input[name=newUrl]").val().trim(),
  };

  try {
    fnCheckObj(obj, schemeObj);
  } catch (error) {
    alert(error);
    return;
  }

  if (obj.origUrl === "" && !confirm("未填写「旧 Tracker」，将执行添加操作，是否继续？")) {
    return;
  }

  gob.apiTorrents(obj.category, () => {
    const list = gob.data.listTorrent;
    list.map(function (item) {
      // 替换或添加 Tracker
      if (obj.origUrl !== "") {
        gob.apiEdtTracker(item.hash, obj.origUrl, obj.newUrl);
      } else {
        gob.apiAddTracker(item.hash, obj.newUrl);
      }
    });
    gob.upTips("btn", {
      num: list.length,
      msg: "操作成功",
    });
  });

  return;
});
