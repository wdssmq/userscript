import {
  _getDateStr,
} from "./_base";

export const gob = {
  bolDebug: false, // 是否调试模式
  // url 列表下载为 .url 文件
  fnMakeUrlFile(arrList, prefix = "") {
    const curDateStr = _getDateStr();
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

    if (!gob.bolDebug) {
      strRlt += "exit\n\n";
    }

    return strRlt;
  },
};
