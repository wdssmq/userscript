import {
  _log,
  _getDateStr,
  fnCopy,
  fnFindDom,
  $n,
  $na,
} from "./_base";
import { http } from "./_http";

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
  arrList.forEach(function(e, i) {
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
function fnGetAjax(callback = function() { }) {
  http.get("https://api.bilibili.com/x/v2/history/toview/web", {
    // 可根据需要添加 headers
    // "Content-Type": "application/json"
  })
    .then(res => {
      let data;
      try {
        data = typeof res.response === "string" ? JSON.parse(res.response) : res.response;
      } catch (e) {
        console.error("解析响应失败", e);
        return;
      }
      callback(data.data.list);
    })
    .catch(err => {
      console.error(err);
    });
}

// 分 p 链接获取
(() => {
  // 【个人中字】擅长捉弄的高木同学 特典广播剧1~6 第一季BD特典_哔哩哔哩_bilibili
  // https://www.bilibili.com/video/BV1XZ4y1R74P/
  const gob = {
    // 选择器
    epBox: "#multi_page",
    epBoxTitle: ".head-con h3",
    epList: ".cur-list .list-box li a",
    // 状态
    epLoaded: false,
  };
  const $$epBox = $na(gob.epBox);
  _log("$$epBox", $$epBox);
  if ($$epBox.length === 0) {
    return;
  }

  // 获取 DOM
  const fnGetDom = ($epBox) => {
    const $epBoxTitle = $epBox.querySelector(gob.epBoxTitle);
    const $epList = $epBox.querySelectorAll(gob.epList);
    return {
      $epBoxTitle,
      $epList,
    };
  };

  // 检查是否加载完毕
  const fnCheckLoaded = (callback) => {
    if (gob.epLoaded) {
      callback();
      return;
    }
    const { $epBoxTitle, $epList } = fnGetDom($$epBox[0]);
    if ($epBoxTitle && $epList.length > 0) {
      gob.epLoaded = true;
    }
    setTimeout(() => {
      fnCheckLoaded(callback);
    }, 3000);
  };

  const fnGetLinkList = ($epList) => {
    // _log("fnOnCLick", $epList);
    const arrList = Array.prototype.map.call($epList, ($item, index) => {
      const href = $item.href;
      const title = $item.innerText.replace(/\n[^\n]+$/g, "").replace("\n", "_");
      return {
        href,
        title,
        innerText: $item.innerText,
      };
    });
    _log("arrList", arrList);
    return arrList;
  };

  const fnMain = () => {
    // const elListDom = [];
    // 遍历 NodeList，不能直接使用 forEach
    Array.prototype.forEach.call($$epBox, ($epBox, index) => {
      const { $epBoxTitle, $epList } = fnGetDom($epBox);
      const textTitle = $epBoxTitle.innerText;
      // 注册点击复制
      fnCopy($epBoxTitle, fnMKShell(fnGetLinkList($epList), textTitle));
      // elListDom.push({
      //   box: $epBox,
      //   title: $epBoxTitle,
      //   list: $epList,
      // });
    });
    // console.log(elListDom);
  };

  // 等待加载完毕
  fnCheckLoaded(fnMain);
})();

// 导出稍后再看为 .lnk 文件
(function() {
  // 跳转到标准播放页
  const urlMatch = /list\/watchlater\/?\?bvid=(\w+)/.exec(location.href);
  if (urlMatch) {
    const bvid = urlMatch[1];
    location.href = `https://www.bilibili.com/video/${bvid}`;
    return;
  }
  if (/watchlater/.test(location.href)) {
    let tmpHTML = $("span.t").html();
    fnGetAjax(function(list) {
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
