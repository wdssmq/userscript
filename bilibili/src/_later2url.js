import { _log, fnCopy } from "./_base";

// 构造 Bash Shell 脚本
function fnMKShell(arrList) {
  const today = new Date(); // 获得当前日期
  const year = today.getFullYear(); // 获得年份
  const month = today.getMonth() + 1; // 此方法获得的月份是从0---11，所以要加1才是当前月份
  const day = today.getDate(); // 获得当前日期
  const arrDate = [year, month, day];
  let strRlt =
    'if [ ! -d "bilibili-foldername" ]; then\n' +
    "mkdir bilibili-foldername\n" +
    "fi\n" +
    "cd bilibili-foldername\n";
  strRlt = strRlt.replace(/foldername/g, arrDate.join("-"));
  /**
   * e {title:"",href:""}
   */
  arrList.forEach(function (e, i) {
    const serial = i + 1;
    // _log(e);
    const title = e.title.replace(/\\|\/|:|\*|!|\?]|<|>/g, "");
    const href = e.href || e.url;
    // echo [InternetShortcut] > "*.url"
    // echo "URL=*" >> "*.url"
    strRlt += `echo [InternetShortcut] > "${serial}-${title}.url"\n`;
    strRlt += `echo "URL=${href}" >> "${serial}-${title}.url"\n`;
  });
  strRlt += "exit\n\n";
  // strRlt = strRlt.replace(/\/\/\//g, "//www.bilibili.com/");
  //_log(strRlt);
  return strRlt;
  //$("body").innerHTML = strRlt.replace(/\n/g, "<br/>");
}

// Ajax 封装
function fnGetAjax(callback = function () { }) {
  $.ajax({
    url: "https://api.bilibili.com/x/v2/history/toview/web",
    type: "GET",
    xhrFields: {
      withCredentials: true, // 这里设置了withCredentials
    },
    success: function (data) {
      // _log();
      callback(data.data.list);
    },
    error: function (err) {
      console.error(err);
    },
  });
  // $.get("https://api.bilibili.com/x/v2/history/toview/web", function (data) {
  //   _log(data);
  // });
}

// 导出稍后再看为 .lnk 文件
(function () {
  if (/#\/list|#\/video/g.test(location.href)) {
    fnGetAjax(function (list) {
      const arrRlt = [];
      list.forEach((item, index) => {
        arrRlt.push({
          title: item.title,
          href: `https://www.bilibili.com/video/${item.bvid}`,
          bvid: item.bvid,
        });
        // _log(item, index);
      });
      _log("稍后再见",arrRlt.length);
      // 注册点击复制
      fnCopy("span.t", fnMKShell(arrRlt));
    });
    return false;
  }
})();
