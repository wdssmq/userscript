import { _log, $n, $na } from "./_base";
// 星标文章导出为 *.url 文件
function fnMKShell($list) {
  const today = new Date(); // 获得当前日期
  const year = today.getFullYear(); // 获得年份
  const month = today.getMonth() + 1; // 此方法获得的月份是从0---11，所以要加1才是当前月份
  const day = today.getDate(); // 获得当前日期
  const arrDate = [year, month, day];
  let strRlt =
    'if [ ! -d "foldername" ]; then\n' +
    "mkdir foldername\n" +
    "fi\n" +
    "cd foldername\n";
  strRlt = strRlt.replace(/foldername/g, "later-" + arrDate.join("-"));
  $list.forEach(function (e, i) {
    // console.log(e);
    let strTitle = `${i}丨`;
    strTitle += e.textContent.replace(/\\|\/|:|\*|!|\?]|<|>/g, "");
    const lenTitle = strTitle.length;
    if (lenTitle >= 155) {
      strTitle = `${i}丨标题过长丨${lenTitle}`;
    }
    let strUrl = e.href;
    // strRlt += `\n#${i} - ${lenTitle}\n`;
    strRlt += 'echo [InternetShortcut] > "' + strTitle + '.url"\n';
    strRlt += 'echo "URL=' + strUrl + '" >> "' + strTitle + '.url"\n';
  });
  strRlt += "exit\n\n";
  strRlt = strRlt.replace(/\/\/\//g, "//www.bilibili.com/");
  //console.log(strRlt);
  return strRlt;
  //$n("body").innerHTML = strRlt.replace(/\n/g, "<br/>");
}
$n("#box").addEventListener("mouseup", function (event) {
  if (event.target.innerHTML.indexOf("Read later") > -1) {
    const $el = event.target;
    console.log($el);
    GM_setClipboard(fnMKShell($na("div.content a")));
  }
}, false);
