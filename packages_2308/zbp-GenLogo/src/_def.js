import { _log, $ } from "./_base";
import config from "./_config";

(() => {
  if (location.hash == "") {
    return;
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

  // 随机颜色
  function fnRndColor() {
    return "#" + ("00000" + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6);
  }

  function fnGetDefColor(i) {
    const defColors = [
      "6,71,100",
      "0,80,100",
      "10,90,109",
      "25,91,131",
      "74,105,150",
      "34,80,115",
      "41,61,71",
      "56,84,108",
      "57,90,131",
      "59,91,162",
      "60,93,119",
      "65,53,84",
      "70,9,39", // 紫红
    ];
    if (defColors[i]) {
      return `rgb(${defColors[i]})`;
    }
    return fnRndColor();
  }

  // 生成 logo 列表
  for (let i = 0; i < 59; i++) {
    const curColor = fnGetDefColor(i);
    // console.log(curColor);
    $(`<div class="logo-box i-${i}"></div>`).appendTo("body").css({
      backgroundColor: curColor,
    });
    const $curBox = $(`div.i-${i}`);
    $(
      `<div class="logo-text">
        <div class="line-1">${config.appText[0]}</div>
        <div class="line-2">${config.appText[1]}</div>
      </div>`,
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
  margin-left: -1em;
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
  if (config.longName) {
    $(".logo-text").addClass("long-name");
  }
})();
