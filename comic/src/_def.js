import { _log, _sleep, $n, $na } from "./_base";

// -----------------------

// 当前项目的各种函数
function fnGenUrl() {
  // 用于下载图片
  const imgUrl = $n(".mangaFile").getAttribute("src");
  _log("[log]fnGenUrl()\n", imgUrl);
  // return encodeURI(imgUrl);
  return imgUrl;
}

function fnGenInfo() {
  const name = $n(".title h1 a").innerHTML; // 漫画名
  const chapter = $n(".title h2").innerHTML; // 章节
  const pages = $na("option").length; // 总页数
  return { name, chapter, pages };
}

// 网络请求
const fnGet = (url, responseType = "json", retry = 2) =>
  new Promise((resolve, reject) => {
    try {
      // console.log(navigator.userAgent);
      GM_xmlhttpRequest({
        method: "GET",
        url,
        headers: {
          "User-Agent": navigator.userAgent, // If not specified, navigator.userAgent will be used.
          referer: "https://www.manhuagui.com/",
        },
        responseType,
        onerror: (e) => {
          if (retry === 0) reject(e);
          else {
            console.warn("Network error, retry.");
            setTimeout(() => {
              resolve(fnGet(url, responseType, retry - 1));
            }, 1000);
          }
        },
        onload: ({ status, response }) => {
          if (status === 200) resolve(response);
          else if (retry === 0) reject(`${status} ${url}`);
          else {
            console.warn(status, url);
            setTimeout(() => {
              resolve(fnGet(url, responseType, retry - 1));
            }, 500);
          }
        },
      });
    } catch (error) {
      reject(error);
    }
  });

const JSZip = (() => {
  const blob = new Blob(
    [
      "importScripts(\"https://cdn.jsdelivr.net/npm/comlink@4.3.0/dist/umd/comlink.min.js\",\"https://cdn.jsdelivr.net/npm/jszip@3.5.0/dist/jszip.min.js\");class JSZipWorker{constructor(){this.zip=new JSZip}file(name,{data:data}){this.zip.file(name,data)}generateAsync(options,onUpdate){return this.zip.generateAsync(options,onUpdate).then(data=>Comlink.transfer({data:data},[data]))}}Comlink.expose(JSZipWorker);",
    ],
    { type: "text/javascript" },
  );
  const worker = new Worker(URL.createObjectURL(blob));
  return Comlink.wrap(worker);
})();

const getCompressionOptions = (level = 4) => {
  if (level === 0) return {};
  return {
    compression: "DEFLATE",
    compressionOptions: { level: level },
  };
};

const fnDownload = async ($btn = null) => {
  const info = fnGenInfo();
  const cfName = `${info.name}_${info.chapter}`;
  info.done = 0;
  info.error = 0;
  info.bad = {};
  _log("[log]fnDownload()\n", info);
  // zip
  const zip = await new JSZip();
  //
  const btnDownloadProgress = (curPage = 0) => {
    if ($btn) {
      $btn.innerHTML = `正在下载：${curPage} /${info.pages}`;
    }
  };
  const btnCompressingProgress = (percent = 0) => {
    if ($btn) {
      $btn.innerHTML = percent == 100 ? "已完成√" : `正在压缩：${percent}`;
    }
  };
  // 下载并添加到 zip
  // page 从 1 开始
  const fileNameLen = (len => len > 2 ? len : 2)(info.pages.toString().length);
  const dlPromise = async (url, page, threadID = 0) => {
    const fileName = ((i) => {
      return `${String(i).padStart(fileNameLen, 0)}.jpg`;
    })(page);
    try {
      const data = await fnGet(url, "arraybuffer");
      await zip.file(fileName, Comlink.transfer({ data }, [data]));
      info.done++;
    } catch (e) {
      _log("[error]dlPromise()\n", e);
      await zip.file(`${fileName}.bad.txt`, "");
      info.bad[page] = `${url}`;
      info.error++;
    }
  };
  for (let page = 0; page < info.pages; page++) {
    const url = fnGenUrl();
    btnDownloadProgress(page + 1);
    await dlPromise(url, page + 1);
    await _sleep(137);
    if (info.error) {
      alert("下载失败");
      break;
    }
    $n("#next").click();
  }
  // await multiThread(urls, dlPromise);
  return async () => {
    // info.compressing = true;
    // let lastZipFile = "";
    const { data } = await zip.generateAsync(
      { type: "arraybuffer", ...getCompressionOptions() },
      Comlink.proxy(({ percent, currentFile }) => {
        // if (lastZipFile !== currentFile && currentFile) {
        //   lastZipFile = currentFile;
        //   console.log(`Compressing ${percent.toFixed(2)}%`, currentFile);
        // }
        btnCompressingProgress(percent.toFixed(2));
        info.compressingPercent = percent;
      }),
    );
    console.log(info);
    // console.log("Done");
    return {
      name: `${cfName}.zip`,
      data: new Blob([data]),
      error: info.error,
    };
  };
};


// 单图查看
const setCurImgLink = () => {
  if ($n("#curimg")) {
    $n("#curimg").href = fnGenUrl();
    return;
  }
  const $imgLink = document.createElement("a");
  $imgLink.id = "curimg";
  $imgLink.innerHTML = "查看单图";
  $imgLink.className = "btn-red";
  $imgLink.href = fnGenUrl();
  $imgLink.target = "_blank";
  $imgLink.style.background = "#0077D1";
  $imgLink.style.cursor = "pointer";
  $n(".main-btn").insertBefore($imgLink, $n("#viewList"));
};
setCurImgLink();


// 下载按钮
const setBtnDownload = () => {
  const $btn = document.createElement("a");
  $btn.id = "gm-btn-download";
  $btn.className = "btn-red";
  $btn.innerHTML = "开始下载";
  $n(".main-btn").appendChild($btn);
  $btn.style.background = "#0077D1";
  $btn.style.cursor = "pointer";
  $btn.addEventListener("click", async () => {
    let curPage = parseInt($n("#page").innerHTML);
    if (curPage > 1) {
      alert("请从第一页开始下载");
      return false;
    }
    const fnDL = await fnDownload($btn);
    const { data, name, error } = await fnDL();
    if (!error) {
      saveAs(data, name);
    }
  });
};
setBtnDownload();


window.addEventListener("hashchange", () => {
  setCurImgLink();
});

export {
  fnGenUrl,
  fnGenInfo,
  fnGet,
};
