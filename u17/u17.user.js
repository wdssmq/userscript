// ==UserScript==
// @name         有妖气漫画下载
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  归档下载有妖气的漫画
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.net/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://www.u17.com/comic/*.html
// @match        https://www.u17.com/chapter/*.html
// @require      https://cdn.jsdelivr.net/npm/comlink@4.3.0/dist/umd/comlink.min.js
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

/* eslint-disable */
/* jshint esversion: 6 */

(function () {
  'use strict';

  const gm_name = "u17";

  const _sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);
  const _error = (...args) => console.error(`[${gm_name}]\n`, ...args);

  // -------------------------------------

  // const $ = window.$ || unsafeWindow.$;
  function $n(e) {
    return document.querySelector(e);
  }

  /* global Comlink saveAs */
  // 网络请求
  const get = (url, responseType = "json", retry = 2) =>
    new Promise((resolve, reject) => {
      try {
        GM_xmlhttpRequest({
          method: "GET",
          url,
          headers: {
            "User-Agent": navigator.userAgent,
            referer: "https://www.manhuagui.com/",
          },
          responseType,
          onerror: (e) => {
            if (retry === 0) reject(e);
            else {
              console.warn("Network error, retry.");
              setTimeout(() => {
                resolve(get(url, responseType, retry - 1));
              }, 1000);
            }
          },
          onload: ({ status, response }) => {
            if (status === 200) resolve(response);
            else if (retry === 0) reject(`${status} ${url}`);
            else {
              console.warn(status, url);
              setTimeout(() => {
                resolve(get(url, responseType, retry - 1));
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

  let C_LEVEL = 1;
  let FILENAME_LENGTH = 2;

  const getCompressionOptions = () => {
    return {
      compression: "DEFLATE",
      compressionOptions: { level: C_LEVEL },
    };
  };

  const gob = {
    lstImgUrl: null,
    lstChapter: null,
    count: 0,
  };

  function fnGenUrl() {
    // 用于下载图片
    const imgUrl = $n(".cur_img").getAttribute("src");
    if (gob.lstImgUrl !== imgUrl) {
      _log(imgUrl);
      gob.lstImgUrl = imgUrl;
    }
    // return encodeURI(imgUrl);
    return imgUrl;
  }

  function fnGenInfo() {
    const name = $n("a.comic_name").innerHTML; // 漫画名
    let chapter = $n("#current_chapter_name").innerHTML; // 章节
    if (chapter.includes("...")) {
      chapter = fnChapterFromTitle(name);
    }
    const curImgUrl = fnGenUrl();
    const _pages = $n(".pagenum").innerText.trim().split("/"); // 页数
    return { name, chapter, curImgUrl, curPage: _pages[0], totalPage: _pages[1] };
  }

  function fnChapterFromTitle(name) {
    const title = document.title;
    const _chapter = title.match(/^([^-]+) - /);
    if (_chapter) {
      // _log("chapter from title", _chapter);
      return _chapter[1].trim().replace(`《${name}》`, "");
    }
    return "";
  }

  const fnDownload = async ($btn = null, oInfo) => {
    const info = oInfo;
    if (info.chapter == gob.lstChapter) {
      _error("章节重复");
      return;
    } else {
      gob.lstChapter = info.chapter;
    }
    const cfName = `${info.name}_${info.chapter}_${info.totalPage}p`;
    info.done = 0;
    info.error = 0;
    info.bad = {};
    // zip
    const zip = await new JSZip();
    //
    const btnDownloadProgress = (curPage = 0) => {
      if ($btn) {
        $btn.innerHTML = `正在下载：${curPage} /${info.totalPage}`;
      }
    };
    const btnCompressingProgress = (percent = 0) => {
      if ($btn) {
        $btn.innerHTML = percent == 100 ? "已完成√" : `正在压缩：${percent}`;
      }
    };
    // 下载并添加到zip
    // page 从 1 开始
    const dlPromise = async (url, page) => {
      const fileName = ((i) => {
        return `${String(i).padStart(FILENAME_LENGTH, 0)}.jpg`;
      })(page);
      try {
        const data = await get(url, "arraybuffer");
        await zip.file(fileName, Comlink.transfer({ data }, [data]));
        info.done++;
      } catch (e) {
        await zip.file(`${fileName}.bad.txt`, "");
        info.bad[page] = `${url}`;
        info.error++;
      }
    };
    for (let page = 0; page < info.totalPage; page++) {
      const url = fnGenUrl();
      btnDownloadProgress(page + 1);
      await dlPromise(url, page + 1);
      await _sleep(137);
      if (info.error) {
        alert("下载失败");
        break;
      }
      $n("#readtop .next").click();
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
      _log("fnDownload", info);
      // console.log("Done");
      return {
        name: `${cfName}.zip`,
        data: new Blob([data]),
        error: info.error,
      };
    };
  };

  async function fnMain($btn) {
    const $base = $n(".comic_read_img");
    if (!$base) {
      return;
    }
    const info = fnGenInfo();
    _log("fnMain", info);
    if (info.curPage > 1) {
      alert("请从第一页开始下载");
      return false;
    }
    const fnDL = await fnDownload($btn, info);
    const { data, name, error } = await fnDL();
    if (!error) {
      saveAs(data, name);
    } else {
      _error(error);
    }
  }

  function fnBtnDL() {
    const $pagebar = $n("#readtop .pagebar");
    if (!$pagebar) {
      return;
    }
    const $btnDL = document.createElement("a");
    $btnDL.innerHTML = "开始下载";
    $btnDL.className = "btn btn-dl";
    $btnDL.id = "u17_btn_dl";
    $btnDL.addEventListener("click", () => {
      $btnDL.classList.add("running");
      fnMain($btnDL);
    });
    $pagebar.appendChild($btnDL);
    GM_addStyle(`
    .btn.btn-dl {
      display: block;
      float: left;
      border: 1px solid #333;
      width: 89px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      color: #ccc;
      background: #333;
      font-weight: bold;
      cursor: pointer;
    }
    .btn.btn-dl:hover {
      text-decoration: none;
      border: 1px solid #ffc600;
    }
  `);
  }

  window.addEventListener("hashchange", async () => {
    await _sleep(3000);
    const info = fnGenInfo();
    const $btnDL = $n("#u17_btn_dl");
    if (info.curPage == "1") {
      $btnDL.innerHTML = "开始下载";
    }
    if (document.title.includes("...")) {
      // 刷新
      alert("章节标题被截断，请刷新页面");
      return;
    }
    // if (gob.count > 4) {
    //   gob.count = 0;
    //   $btnDL.classList.remove("running");
    //   return;
    // }
    // if (info.curPage === "1" && $btnDL.classList.contains("running")) {
    //   $btnDL.click();
    //   if (info.totalPage > 4) {
    //     gob.count++;
    //   }
    // }
  });

  fnBtnDL();

})();
