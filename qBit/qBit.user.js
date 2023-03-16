// ==UserScript==
// @name         「水水」qBittorrent 管理脚本「QQ 群：189574683」
// @namespace    http://沉冰浮水.tk/
// @version      1.0.0
// @author       沉冰浮水
// @description  通过 WebUI 的 API 批量替换 Tracker
// @null     ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null     ----------------------------
// @link     https://github.com/wdssmq/userscript
// @link     https://afdian.net/@wdssmq
// @link     https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null     ----------------------------
// @noframes
// @run-at       document-end
// @match        http://127.0.0.1:8080
// @grant        GM_xmlhttpRequest
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "qBit";

  // 初始常量或函数
  const curUrl = window.location.href;

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}] \n`, ...args);

  // -------------------------------------

  function fnCheckObj(obj, schema) {
    for (const key in schema) {
      const value = obj[key];
      // 模式中定义的键必须存在
      if (typeof value === "undefined") {
        throw new Error(`${key} is missing from object`);
      }
      // 针对每个键值的模式
      const valueSchema = schema[key];
      valueSchema.forEach(itemSchema => {
        const msg = itemSchema.msg;
        for (const check in itemSchema) {
          if (Object.hasOwnProperty.call(itemSchema, check)) {
            const checkVal = itemSchema[check];
            switch (check) {
              case "not":
                if (value === checkVal) {
                  throw new Error(`${key} ${msg}`);
                }
                break;
            }
          }
        }
      });
    }
    return true;
  }

  class HttpRequest {
    constructor() {
      if (typeof GM_xmlhttpRequest === 'undefined') {
        throw new Error('GM_xmlhttpRequest is not defined');
      }
    }

    get(url, headers = {}) {
      return this.request({
        method: 'GET',
        url,
        headers,
      });
    }

    post(url, data = {}, headers = {}) {
      const formData = new FormData();

      for (const key in data) {
        formData.append(key, data[key]);
      }

      return this.request({
        method: 'POST',
        url,
        data: formData,
        headers,
      });
    }

    request(options) {
      return new Promise((resolve, reject) => {
        const requestOptions = Object.assign({}, options);

        requestOptions.onload = function (res) {
          resolve(res);
        };

        requestOptions.onerror = function (error) {
          reject(error);
        };

        GM_xmlhttpRequest(requestOptions);
      });
    }
  }

  // 导出实例对象
  const http = new HttpRequest();

  const jq = jQuery;

  if (typeof __GM_api !== 'undefined') {
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
        btn: {}
      },
      modalShow: false,
    },
    http,
    // 解析返回
    parseReq(res, type = "text") {
      // _log(res.finalUrl, "\n", res.status, res.response);
      if (res.status !== 200) {
        throw new Error('API Http Request Err');
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
    }
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
      title: `批量替换 Tracker <span class="js-tip-tit"></span>`,
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
      api: gob.data.apiVer
    });
  });

  const schemeObj = {
    category: [
      {
        not: "",
        msg: "不能为空"
      }
    ],
    newUrl: [
      {
        not: "",
        msg: "不能为空"
      }
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
        msg: "操作成功"
      });
    });

    return;
  });

})();
