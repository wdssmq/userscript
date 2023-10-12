import {
  _log,
  _getDateStr,
  fnCopy,
  fnFindDom,
  $n,
  $na
} from "./_base";

_log("_later2url.js", "开始");

const bolDebug = false;

// 构造 Bash Shell 脚本
function fnMKShell(arrList, prefix = "") {
  const curDateStr = _getDateStr();
  let strRlt =
    "if [ ! -d \"prefix-date\" ]; then\n" +
    "mkdir prefix-date\n" +
    "fi\n" +
    "cd prefix-date\n\n";
  strRlt = strRlt.replace(/prefix/g, prefix);
  strRlt = strRlt.replace(/date/g, curDateStr);

  /**
   * e {title:"", href:""}
   */
  arrList.forEach(function (e, i) {
    const serial = i + 1;
    // _log(e);

    // 移除不能用于文件名的字符
    let title = e.title || e.innerText;
    title = title.replace(/\\|\/|:|\*|!|\?]|<|>/g, "");
    title = title.replace(/["'\s]/g, "");
    // _log(title);

    const lenTitle = title.length;
    if (lenTitle >= 155) {
      title = `标题过长丨${lenTitle}`;
    }

    // 获取文章链接
    const href = e.href || e.url;

    // url 文件名
    const urlFileName = `${serial}丨${title}.url`;

    strRlt += `echo [InternetShortcut] > "${urlFileName}"\n`;
    strRlt += `echo "URL=${href}" >> "${urlFileName}"\n`;
    strRlt += "\n";
  });

  if (!bolDebug) {
    strRlt += "exit\n\n";
  }

  return strRlt;
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
}

// 分 p 链接获取
(() => {
  const selectorMap = {
    epListBox: ".eplist_ep_list_wrapper__PzLHa",
    epListTitle: ".eplist_list_title__JwP3d h4",
    // epList: ".imageList_wrap__pDHvN",
    epList: ".imageList_wrap__pDHvN .imageListItem_wrap__HceXs a",
  };
  const $$epListBox = $na(selectorMap.epListBox);
  if ($$epListBox.length === 0) {
    return;
  }
  const fnGetLinkList = ($epList) => {
    // _log("fnOnCLick", $epList);
    const arrList = Array.prototype.map.call($epList, ($item, index) => {
      const href = $item.href;
      const title = $item.innerText.replace(/\n.+/g, "");
      return {
        href,
        title,
      };
    });
    _log("arrList", arrList);
    return arrList;
  };
  
  const elListDom = [];
  // 遍历 NodeList，不能直接使用 forEach
  Array.prototype.forEach.call($$epListBox, ($epListBox, index) => {
    const $epListTitle = fnFindDom($epListBox, selectorMap.epListTitle);
    const $epList = fnFindDom($epListBox, selectorMap.epList);
    const textTitle = $epListTitle.innerText;
    // 注册点击复制
    fnCopy($epListTitle, fnMKShell(fnGetLinkList($epList), textTitle));
    elListDom.push({
      box: $epListBox,
      title: $epListTitle,
      list: $epList,
    });
  });
  console.log(elListDom);
})();

// 导出稍后再看为 .lnk 文件
(function () {
  // 跳转到标准播放页
  const urlMatch = /list\/watchlater\?bvid=(\w+)/.exec(location.href);
  if (urlMatch) {
    const bvid = urlMatch[1];
    location.href = `https://www.bilibili.com/video/${bvid}`;
    return;
  }
  if (/watchlater/.test(location.href)) {
    let tmpHTML = $("span.t").html();
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
      // _log("稍后再看", arrRlt.length);
      tmpHTML = tmpHTML.replace(/0\//g, arrRlt.length + "/");
      $("span.t").html(tmpHTML + "「点击这里复制 bash shell 命令」");
      let appCon = "「已复制」";
      if (arrRlt.length > 37) {
        appCon = "「已复制，数量过多建议保存为 .sh 文件执行」";
      }
      // 注册点击复制
      fnCopy("span.t", fnMKShell(arrRlt, "bilibili"), () => {
        $("span.t").html(tmpHTML + appCon);
      });
    });
    return false;
  }
})();

_log("_later2url.js", "结束");
