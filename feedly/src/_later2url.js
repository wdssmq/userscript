import { _log, _getDateStr, $n, $na } from "./_base";

// nodeList 转换为 Array
function fnNodeListToArray(nodeList) {
  return Array.prototype.slice.call(nodeList);
}

const bolDebug = false;

// 构造 Bash Shell 脚本
function fnMKShell(arrList, prefix = "") {
  const curDateStr = _getDateStr();
  let strRlt =
    'if [ ! -d "prefix-date" ]; then\n' +
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

// 星标文章导出为 *.url 文件
$n("#box").addEventListener("mouseup", function (event) {
  if (event.target.innerHTML.indexOf("Read later") > -1) {
    const $el = event.target;
    console.log($el);
    const listItems = fnNodeListToArray($na("div.content a"));
    GM_setClipboard(fnMKShell(listItems, "feedly"));
  }
}, false);
