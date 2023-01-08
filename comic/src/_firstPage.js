import { _log, $n, fnAfter } from "./_base";
import { gob } from "./_gob";
import { fnGenUrl, fnGenInfo, fnGet } from "./_def";

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

const fnDLImg = async (pageInfo) => {
  // const data = await fnGet(pageInfo.url, "arraybuffer");
  // const data = await fnGet(pageInfo.url, "blob");
  fnGet(pageInfo.url, "arraybuffer").then(
    (res) => {
      let url = window.URL.createObjectURL(new Blob([res]));
      let a = document.createElement("a");
      a.setAttribute("download", `${pageInfo.chapter}.jpg`);
      a.href = url;
      a.click();
    },
  );
};

const fnCheckFistPage = (cur, list) => {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.name === cur.name && item.chapter === cur.chapter) {
      return true;
    }
  }
  return false;
};

const fnGenFistPage = (auto = false) => {
  // _log("[log]fnGenFistPage()", auto);
  const wgetImgs = gob.wgetImgs;
  if (wgetImgs.length >= gob.maxWget) {
    _log("[log]\n", wgetImgs);
    gob.autoNextC = 0;
    gob.save();
    return;
  } else {
    gob.autoNextC = auto ? 1 : 0;
  }
  const curPage = {
    url: gob.curImgUrl,
    name: gob.curInfo.name,
    chapter: gob.curInfo.chapter,
  };
  if (!fnCheckFistPage(curPage, wgetImgs)) {
    fnDLImg(curPage);
    wgetImgs.push(curPage);
    gob.wgetImgs = wgetImgs;
    gob.save();
  }
  _log("[log]fnGenFistPage()", JSON.stringify(gob.wgetImgs));
  if (gob.autoNextC && $n(".nextC")) {
    setTimeout(() => {
      $n(".nextC").click();
    }, 3000);
  }
};

const fnBtn = () => {
  const btn = document.createElement("span");
  if (gob.wgetImgs.length >= gob.maxWget || gob.wgetImgs.length == 0) {
    btn.innerHTML = "收集首图";
  } else {
    btn.innerHTML = `收集首图(${gob.wgetImgs.length + 1} / ${gob.maxWget})`;
  }
  btn.style = "color: #f00; font-size: 12px; cursor: pointer; font-weight: bold; text-decoration: underline; padding-left: 1em;";
  btn.onclick = (() => {
    if (gob.wgetImgs.length >= gob.maxWget) {
      gob.wgetImgs = [];
    }
    fnGenFistPage(true);
  });
  fnAfter(btn, $n("#lighter"));
};

fnBtn();

if (gob.autoNextC) {
  fnGenFistPage(true);
}
