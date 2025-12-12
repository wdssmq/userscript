import { $n, _getDateStr, _log } from "./_base";
import { gob } from "./_gob";

// nodeList 转换为 Array
function fnNodeListToArray(nodeList) {
  return Array.prototype.slice.call(nodeList);
}

const bolDebug = false;

// 构造 Bash Shell 脚本
function fnMKShell(arrList, prefix = "") {
  const curDateStr = _getDateStr();
  const _lenTitle = (title) => {
    // 获取长度，中文算两个字符
    const len = title.length;
    const len2 = title.replace(/[\u4E00-\u9FA5]/g, "").length;
    return len2 + (len - len2) * 2;
  };
  let strRlt
    = "if [ ! -d \"prefix-date\" ]; then\n"
      + "mkdir prefix-date\n"
      + "fi\n"
      + "cd prefix-date\n\n";
  strRlt = strRlt.replace(/prefix/g, prefix);
  strRlt = strRlt.replace(/date/g, curDateStr);

  /**
   * e {title:"", href:""}
   */
  arrList.forEach((e, i) => {
    const serial = i + 1;
    // _log(e);

    // 移除不能用于文件名的字符
    let title = e.title || e.textContent;
    title = title.replace(/[\\/:*!<>]|\?\]/g, "");
    title = title.replace(/["'\s]/g, "");
    // _log(title);

    const lenTitle = _lenTitle(title);
    // 判断太长时截取
    if (lenTitle >= 137) {
      title = title.substring(0, 69); // 截取前 69 个字符
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
$n("#root").addEventListener("mouseup", (event) => {
  gob.GetStarItems();
  const $target = event.target;
  // 判断是 h2 标签
  if ($target.tagName !== "H2") {
    return;
  }
  // console.log($target, $target.textContent);
  const curText = $target.textContent.trim().toUpperCase();
  if (curText.includes("END OF FEED")) {
    const listItems = fnNodeListToArray(gob.$$Stars);
    GM_setClipboard(fnMKShell(listItems, "feedly"));
    $target.textContent = "已复制到剪贴板";
  }
}, false);
