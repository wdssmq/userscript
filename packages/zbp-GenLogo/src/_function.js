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
    "rgb(27, 58, 123)",
    "rgb(31, 56, 148)",
    "rgb(7, 58, 143)",
    // "rgb(16, 135, 192)",
    // "rgb(54, 134, 181)",
    // "rgb(57, 112, 198)",
    // "rgb(64, 144, 194)",
    // "rgb(68, 121, 224)",
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

export {
  fnBindEvent,
  fnCheckAppLogo,
  fnGetAppInfo,
  fnGetDefColor,
  fnRndColor,
};
