import { $n, _log, fnAfter } from "./_base";
import { fnGenInfo, fnGenUrl, fnGet } from "./_def";
import { gob } from "./_gob";

gob.curImgUrl = fnGenUrl();
gob.curInfo = fnGenInfo();
// gob.wgetImgs = [];

// _log("[TEST]gob.data", gob.data);

// const fnGenBash = () => {
//   let bash = "";
//   const wgetImgs = gob.wgetImgs;
//   wgetImgs.forEach((img) => {
//     bash += `wget "${img.url}" "${img.name}-${img.chapter}.jpg"\n`;
//   });
//   return bash;
// };

async function fnDLImg(pageInfo) {
  // const data = await fnGet(pageInfo.url, "arraybuffer");
  // const data = await fnGet(pageInfo.url, "blob");
  fnGet(pageInfo.url, "arraybuffer").then(
    (res) => {
      const url = window.URL.createObjectURL(new Blob([res]));
      const a = document.createElement("a");
      a.setAttribute("download", `${pageInfo.chapter}.jpg`);
      a.href = url;
      a.click();
    },
  );
}

function fnCheckFistPage(cur, list) {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.name === cur.name && item.chapter === cur.chapter) {
      return true;
    }
  }
  return false;
}

function fnGenFistPage(auto = false) {
  // _log("[log]fnGenFistPage()", auto);
  // 当前页面信息
  const curPage = {
    url: gob.curImgUrl,
    name: gob.curInfo.name,
    chapter: gob.curInfo.chapter,
  };
  // 已收集的首图
  const wgetImgs = gob.wgetImgs;
  // 检查当前页面是否已收集，并写入变量
  const bolHasWget = fnCheckFistPage(curPage, wgetImgs);
  _log("[log]fnGenFistPage\n", wgetImgs, "\n", curPage, "\n", bolHasWget);
  // 重复收集或收集数量达到上限，停止自动收集
  if (bolHasWget || wgetImgs.length >= gob.maxWget) {
    gob.autoNextC = 0;
    // gob.save();
    // return;
  }
  else {
    gob.autoNextC = auto ? 1 : 0;
  }
  // 自动下载，并加入已收集列表
  if (!bolHasWget) {
    fnDLImg(curPage);
    wgetImgs.push(curPage);
    gob.wgetImgs = wgetImgs;
    // gob.save();
  }
  // 询问是否重复下载
  if (bolHasWget && confirm("已收集过该首图，是否重复下载？")) {
    fnDLImg(curPage);
  }
  _log("[log]fnGenFistPage\n", gob.wgetImgs, "\n", gob.autoNextC);
  if (gob.autoNextC && $n(".nextC")) {
    setTimeout(() => {
      $n(".nextC").click();
    }, 3000);
  }
  gob.save();
}

function fnBtn() {
  const btn = document.createElement("span");
  if (gob.wgetImgs.length >= gob.maxWget || gob.wgetImgs.length === 0) {
    btn.innerHTML = "收集首图";
  }
  else {
    btn.innerHTML = `收集首图(${gob.wgetImgs.length + 1} / ${gob.maxWget})`;
  }
  btn.style = "color: #f00; font-size: 12px; cursor: pointer; font-weight: bold; text-decoration: underline; padding-left: 1em;";
  btn.onclick = () => {
    if (gob.wgetImgs.length >= gob.maxWget) {
      gob.wgetImgs = [];
    }
    fnGenFistPage(true);
  };
  fnAfter(btn, $n("#lighter"));
}

fnBtn();

if (gob.autoNextC) {
  fnGenFistPage(true);
}
