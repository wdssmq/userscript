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
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  }

  function fnGetDefColor(i) {
    const defColors = [
      "rgb(18, 37, 70)",
      "rgb(27, 58, 123)",
      "rgb(31, 56, 148)",
      "rgb(57, 112, 198)",
      "rgb(64, 144, 194)",
    ];
    if (defColors[i]) {
      return defColors[i];
    }
    return fnRndColor();
  }

  // 点击指定元素时输出颜色
  const fnBindClick = (i) => {
    const $curBox = $(`div.i-${i}`);
    $curBox.on("click", function() {
      const color = $curBox.attr("data-color");
      console.log(color);
    });
  };

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
        <div class="line-1">${config.appText[0]}</div>
        <div class="line-2">${config.appText[1]}</div>
      </div>`,
    ).appendTo($curBox);
    fnBindClick(i);
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
