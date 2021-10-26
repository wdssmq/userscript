// ==UserScript==
// @name         「Z-Blog」- Logo 生成
// @namespace    https://www.wdssmq.com
// @version      0.1
// @description  自动叠加历史图标制作新的图片
// @author       沉冰浮水
// @match        http://127.0.0.1:8000/edsa-zbp/zb_system/admin/index.php?act=PluginMng
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";
  const $ = window.$ || unsafeWindow.$;
  if (location.hash == "") {
    return;
  }

  // 初始化配置
  const config = GM_getValue("config", {});
  if (JSON.stringify(config) === "{}") {
    GM_setValue("config", {
      authName: "沉冰浮水",
      appText: ["&lt;?mz", "-hash-();"],
    });
  }

  // 图标文本
  let appName = location.hash.replace("#", "").trim();
  appName = decodeURI(appName);
  config.appText[1] = config.appText[1].replace("-hash-", appName);

  // 获取图片列表
  const imgList = [];
  let i = 0;
  $(".td25 + .td20").each(function () {
    if ($(this).text() == "沉冰浮水") {
      i++;
      let $img = $(this).parent().find(".td5 img");
      imgList.push($img.attr("src"));
    }
  });
  // console.log(imgList);

  $("body>*").remove();

  function fnRndColor() {
    let rlt = "#";
    return rlt + (~~(Math.random() * (1 << 24))).toString(16);
    rlt += Math.floor(Math.random() * 137).toString(16);
    rlt += Math.floor(Math.random() * 255).toString(16);
    rlt += Math.floor(Math.random() * 255).toString(16);
    return rlt;
  }
  // rgb(20, 47, 58)
  for (let i = 0; i < 37; i++) {
    const curColor = i == 0 ? "rgb(22, 44, 77)" : fnRndColor();
    console.log(curColor);
    $(`<div class="logo-box i-${i}"></div>`).appendTo("body").css({
      backgroundColor: curColor,
    });
    const $curBox = $(`div.i-${i}`);
    $(
      `<div class="logo-text">
        <div class="line-1">${config.appText[0]}</div>
        <div class="line-2">${config.appText[1]}</div>
      </div>`
    ).appendTo($curBox);
    imgList.forEach((href) => {
      const rndIndex = Math.round(Math.random() * 100);
      $(`<img class="i-${i} zIndex-${rndIndex}" src="${href}">`)
        .appendTo($curBox)
        .css({
          zIndex: rndIndex,
        });
    });
  }

  GM_addStyle(`
body { display: flex; flex-wrap: wrap; }
.logo-box { position: relative; min-width: 180px; min-height: 180px; }
.logo-box>* { position: absolute; width: 180px; height: 180px; }
.logo-box img { opacity: 0.01; }
.logo-text {
z-index:100;
font-family: "JetBrains Mono";
color: rgb(255, 255, 255);
font-size: 37px;
text-shadow: 2px 1px 2px;
line-height: 59px;
padding: 0px;
display: flex;
flex-flow: column;
justify-content: center;
opacity: 0.73;
}
`);
  $(".line-1").css({ textAlign: "center", marginLeft: "-1.7em" });
  $(".line-2").css({
    fontSize: "0.8em",
    textAlign: "center",
  });
  return;
})();
