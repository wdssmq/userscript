// ==UserScript==
// @name         「Z-Blog」Logo 生成
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  自动叠加历史图标制作新的图片
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.net/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        http://*/zb_system/admin/index.php?act=PluginMng
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==
/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  // ---------------------------------------------------
  const $$1 = window.$ || unsafeWindow.$;

  // 初始化配置
  const config = GM_getValue("config", {});
  if (JSON.stringify(config) === "{}") {
    GM_setValue("config", {
      authName: "沉冰浮水",
      appText: ["&lt;?mz", "-hash-();"],
      longName: false,
    });
  }

  // 表格内提取指定应用信息
  const fnGetAppInfo = () => {
    // 一个提取应用 id 的函数
    const fnGetAppId = (src) => {
      // http://127.0.0.1:8081/zb_users/plugin/mz_admin2/logo.png，应用 id 为 mz_admin2
      const appId = src.replace(/.*\/plugin\//, "").replace(/\/logo.png/, "");
      return appId;
    };
    const appList = [];
    $(".td25 + .td20").each(function() {
      if ($(this).text() == "沉冰浮水") {
        const $img = $(this).parent().find(".td5 img");
        const imgUrl = $img.attr("src");
        const appId = fnGetAppId(imgUrl);
        appList.push({
          appId,
          imgUrl,
        });
      }
    });
    return appList;
  };

  // 封装一个函数，用于检查图片能正常加载
  const fnCheckAppLogo = (appList, cb = () => { }) => {
    appList.forEach(({ imgUrl, appId }) => {
      $.ajax({
        url: imgUrl,
        success() { },
        error(err) {
          cb(appId, imgUrl);
          console.log("图片加载失败", err);
        },
      });
    });
  };

  // 随机颜色
  function fnRndColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return `rgb(${r}, ${g}, ${b})`;
  }

  // 获取默认颜色
  function fnGetDefColor(i) {
    const defColors = [
      "rgb(18, 37, 70)",
      "rgb(22, 59, 95)",
      "rgb(27, 58, 123)",
      "rgb(54, 114, 177)",
      "rgb(9, 33, 62)",
      // "rgb(41, 61, 79)",
      // --------------------
      "rgb(0, 0, 0)",
    ];
    if (defColors[i]) {
      return defColors[i];
    }
    return fnRndColor();
  }

  // 绑定元素事件
  const fnBindEvent = (i) => {
    const $curBox = $(`div.i-${i}`);
    const color = $curBox.attr("data-color");
    $curBox.on("click", function() {
      document.title = `${i} - ${color}`;
      console.log(`"${color}",`);
    });
    // // 鼠标移入时修改页面 title
    // $curBox.on("mouseover", function() {
    //   document.title = `${i} - ${color}`;
    // });
  };

  (() => {
    // 获取图片列表
    const appList = fnGetAppInfo();

    const fnMain = (hash = "") => {
      if (location.hash == "" && hash == "") {
        return;
      }
      $$1("body>*").remove();

      // 图标文本
      let appName = hash || location.hash.replace("#", "").trim();
      appName = decodeURI(appName);
      // 定义 appText 为 config.appText 的副本
      const appText = config.appText.map(item => item);
      appText[1] = appText[1].replace(/-hash-/, appName);
      // console.log(appText, appName, config.appText);


      // 生成 logo 列表
      for (let i = 0; i < 73; i++) {
        const curColor = fnGetDefColor(i);
        // console.log(curColor);
        $$1(`<div class="logo-box i-${i}"></div>`).appendTo("body").css({
          backgroundColor: curColor,
        });
        const $curBox = $$1(`div.i-${i}`);
        // data-color
        $curBox.attr("data-color", curColor);
        $$1(
          `<div class="logo-text">
        <div class="line-1">${appText[0]}</div>
        <div class="line-2">${appText[1]}</div>
      </div>`,
        ).appendTo($curBox);
        fnBindEvent(i);
        appList.forEach(({ appId, imgUrl }) => {
          const rndIndex = Math.round(Math.random() * 100);
          $$1(`<img class="i-${i} zIndex-${rndIndex} app-${appId}" src="${imgUrl}">`)
            .appendTo($curBox)
            .css({
              zIndex: rndIndex,
            });
        });
      }

      if (config.longName) {
        $$1(".logo-text").addClass("long-name");
      }

      fnCheckAppLogo(appList, (appId) => {
        // 删除失败的 logo
        $$1(`.app-${appId}`).remove();
      });
    };

    fnMain();

    GM_registerMenuCommand("生成 logo", () => {
      // 输入 logo 文本
      const logoText = prompt("请输入 logo 文本 1", "");
      if (logoText) {
        fnMain(logoText);
      }
    });

    GM_addStyle(`
body { display: flex; flex-wrap: wrap; }
.logo-box { position: relative; min-width: 180px; min-height: 180px; }
.logo-box>* { position: absolute; width: 180px; height: 180px; }
.logo-box img { opacity: 0.01; }
.logo-text {
  z-index: 100;
  font-family: "JetBrains Mono";
  color: rgb(255, 255, 255);
  font-size: 37px;
  text-shadow: 2px 1px 2px;
  line-height: 1.4em;
  padding: 0px;
  display: flex;
  flex-flow: column;
  justify-content: center;
  opacity: 0.73;
}
.logo-text .line-1 {
  text-align: center;
  font-size: 47px;
  font-weight: bold;
  margin-left: -0.73em;
  margin-top: -0.3em;
}
.logo-text .line-2 {
  text-align: center;
  font-size: 0.8em;
}
.logo-text.long-name .line-1 {
  margin-top: -0.9em;
}
.logo-text.long-name .line-2 {
  font-size: 0.6em;
  line-height: 1.3em;
}
`);
  })();

})();
