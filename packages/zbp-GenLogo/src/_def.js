import { _log, $ } from "./_base";
import config from "./_config";
import {
  fnBindEvent,
  fnCheckAppLogo,
  fnGetAppInfo,
  fnGetDefColor,
} from "./_function";

(() => {
  // 获取图片列表
  const appList = fnGetAppInfo();

  const fnMain = (hash = "") => {
    if (location.hash == "" && hash == "") {
      return;
    }
    $("body>*").remove();

    // 图标文本
    let appName = hash || location.hash.replace("#", "").trim();
    appName = decodeURI(appName);
    // 定义 appText 为 config.appText 的副本
    const appText = config.appText.map(item => item);
    appText[1] = appText[1].replace(/-hash-/, appName);
    // console.log(appText, appName, config.appText);


    // 生成 logo 列表
    for (let i = 0; i < 59; i++) {
      const curColor = fnGetDefColor(i);
      // console.log(curColor);
      $(`<div class="logo-box i-${i}"></div>`).appendTo("body").css({
        backgroundColor: curColor,
      });
      const $curBox = $(`div.i-${i}`);
      // data-color
      $curBox.attr("data-color", curColor);
      $(
        `<div class="logo-text">
        <div class="line-1">${appText[0]}</div>
        <div class="line-2">${appText[1]}</div>
      </div>`,
      ).appendTo($curBox);
      fnBindEvent(i);
      appList.forEach(({ appId, imgUrl }) => {
        const rndIndex = Math.round(Math.random() * 100);
        $(`<img class="i-${i} zIndex-${rndIndex} app-${appId}" src="${imgUrl}">`)
          .appendTo($curBox)
          .css({
            zIndex: rndIndex,
          });
      });
    }

    if (config.longName) {
      $(".logo-text").addClass("long-name");
    }

    fnCheckAppLogo(appList, (appId) => {
      // 删除失败的 logo
      $(`.app-${appId}`).remove();
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
