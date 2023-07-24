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
    <h2>分类：（不能是「全部」或「未分类」，区分大小写）<h2><input class="js-input" type="text" name="category" style="width: 97%;" placeholder="包含要修改项目的分类或新建一个"><br>\
    <h2>旧 Trakcer：<h2><input class="js-input" type="text" name="origUrl" style="width: 97%;"><br>\
    <h2>新 Tracker：<h2><input class="js-input" type="text" name="newUrl" style="width: 97%;"><br>\
    <h2>子串模式：<input class="js-input" type="checkbox" name="matchSubstr" value="matchSubstr">仅替换链接中的部分文本<h2>\
    <hr>\
    <button class="js-replace">替换</button>\
    <span class="js-tip-btn"></span>\
    <hr>\
    「<a target="_blank" title="投喂支持" href="https://www.wdssmq.com/guestbook.html#h3-u6295u5582u652Fu6301" rel="nofollow">投喂支持</a>」\
    「<a target="_blank" title="QQ 群 - 我的咸鱼心" href="https://jq.qq.com/?_wv=1027&k=SRYaRV6T" rel="nofollow">QQ 群 - 我的咸鱼心</a>」\
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
  jq("#js-modal_contentWrapper").css({
    height: "auto",
  });
  gob.data.modalShow = true;
  gob.upTips("tit", {
    qbt: gob.data.qbtVer,
    api: gob.data.apiVer,
  });
  // debug
  // jq(".js-input[name=category]").val("test");
  // jq(".js-input[name=origUrl]").val("123");
  // jq(".js-input[name=newUrl]").val("456");
  // jq(".js-input[name=matchSubstr]").click();
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

const fnCheckUrl = (url) => {
  // 判断是否以 udp:// 或 http(s):// 开头
  const regex = /^(udp|http(s)?):\/\//;
  return regex.test(url);
};

jq(document).on("click", ".js-replace", function () {
  // alert(jq(".js-input[name=category]").val());
  const obj = {
    category: jq(".js-input[name=category]").val().trim(),
    origUrl: jq(".js-input[name=origUrl]").val().trim(),
    newUrl: jq(".js-input[name=newUrl]").val().trim(),
    matchSubstr: jq(".js-input[name=matchSubstr]").is(":checked"),
  };

  try {
    fnCheckObj(obj, schemeObj);
  } catch (error) {
    alert(error);
    return;
  }

  if (obj.origUrl === "") {
    if (!confirm("未填写「旧 Tracker」，将执行添加操作，是否继续？")) {
      return;
    }
    if (!fnCheckUrl(obj.newUrl)) {
      alert("「新 Tracker」必须以 udp:// 或 http(s):// 开头");
      return;
    }
  } else {
    // 新旧 Tracker 执行 fnCheckUrl 判断的结果应该相同
    if (fnCheckUrl(obj.origUrl) !== fnCheckUrl(obj.newUrl)) {
      alert("「旧 Tracker」和「新 Tracker」必须同为链接或同为子串");
      return;
    }
    if (!fnCheckUrl(obj.origUrl) && !obj.matchSubstr) {
      alert("必须以 udp:// 或 http(s):// 开头\n或者勾选「子串模式」");
      return;
    }
  }

  // 根据子串获取完整的 Url
  const replaceBySubstr = async (hash, oldSubstr, newSubstr) => {

    gob.apiGetTrackers(hash, () => {
      const seedTrackers = gob.data.curTorrentTrackers;
      const rlt = {
        oldUrl: "",
        newUrl: "",
        bolMatch: false,
      };
      seedTrackers.forEach((item) => {
        let oldUrl = item.url, newUrl = "";
        // _log("oldUrl", oldUrl, oldSubstr);
        if (oldUrl.indexOf(oldSubstr) > -1 && !rlt.bolMatch) {
          newUrl = oldUrl.replace(oldSubstr, newSubstr);
          rlt.bolMatch = true;
          rlt.oldUrl = oldUrl;
          rlt.newUrl = newUrl;
        }
      });
      if (rlt.bolMatch) {
        gob.apiEdtTracker(hash, rlt.oldUrl, rlt.newUrl);
      }
    });

  };

  gob.apiTorrents(obj.category, () => {
    const list = gob.data.listTorrent;
    _log("apiTorrents()\n", list);
    list.map(function (item) {
      if (obj.matchSubstr) {
        replaceBySubstr(item.hash, obj.origUrl, obj.newUrl);
        return;
      }
      // 替换或添加 Tracker（完整匹配）
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
