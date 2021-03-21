// ==UserScript==
// @name         [manhuagui] - 打包下载（QQ群：189574683）
// @namespace    https://www.wdssmq.com/
// @version      0.3
// @description  按章节打包下载漫画柜的资源
// @author       沉冰浮水
// @link   ----------------------------
// @link：       https://github.com/wdssmq/userscript
// @link：       https://afdian.net/@wdssmq
// @link:        https://greasyfork.org/zh-CN/users/6865-wdssmq
// @link   ----------------------------
// @match        https://www.manhuagui.com/comic/*/*.html
// @require      https://cdn.jsdelivr.net/npm/comlink@4.3.0/dist/umd/comlink.min.js
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/*jshint esversion:9 */
// 本脚本综合以下项目实现
// https://greasyfork.org/scripts/28410
// https://greasyfork.org/scripts/375992
(() => {
  "use strict";
  function $n(e) {
    return document.querySelector(e);
  }
  function $na(e) {
    return document.querySelectorAll(e);
  }

  // 网络请求
  const get = (url, responseType = "json", retry = 2) =>
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
        'importScripts("https://cdn.jsdelivr.net/npm/comlink@4.3.0/dist/umd/comlink.min.js","https://cdn.jsdelivr.net/npm/jszip@3.5.0/dist/jszip.min.js");class JSZipWorker{constructor(){this.zip=new JSZip}file(name,{data:data}){this.zip.file(name,data)}generateAsync(options,onUpdate){return this.zip.generateAsync(options,onUpdate).then(data=>Comlink.transfer({data:data},[data]))}}Comlink.expose(JSZipWorker);',
      ],
      { type: "text/javascript" }
    );
    const worker = new Worker(URL.createObjectURL(blob));
    return Comlink.wrap(worker);
  })();

  // 自定义压缩级别
  let C_LEVEL = parseInt(GM_getValue("c_lv", "0")) || 0;
  GM_registerMenuCommand("Compression Level", () => {
    let num;
    do {
      num = prompt(
        `Please input a number (0-9) as compression level:
  0: store (no compression)
  1: lowest (best speed)
  ...
  9: highest (best compression)`,
        C_LEVEL
      );
      if (num === null) return;
      num = parseInt(num.trim());
    } while (isNaN(num) || num < 0 || num > 9);
    C_LEVEL = num;
    GM_setValue("c_lv", C_LEVEL);
  });
  const getCompressionOptions = () => {
    if (C_LEVEL === 0) return {};
    return {
      compression: "DEFLATE",
      compressionOptions: { level: C_LEVEL },
    };
  };

  // 文件名补零
  let FILENAME_LENGTH = parseInt(GM_getValue("filename_length", "2")) || 2;
  GM_registerMenuCommand("Filename Length", () => {
    let num;
    do {
      num = prompt(
        `Please input the minimum image filename length you want >=0, zeros will be padded to the start of filename when its length lower than this value:`,
        FILENAME_LENGTH
      );
      if (num === null) return;
      num = parseInt(num);
    } while (num.toString() == "NaN" || num < 0);
    FILENAME_LENGTH = num;
    GM_setValue("filename_length", num);
  });

  // 下载线程数
  let THREAD = GM_getValue("thread_num", 8);
  GM_registerMenuCommand("Download Thread", () => {
    let num;
    do {
      num = prompt(
        "Please input the number of threads you want (1~32):",
        THREAD
      );
      if (num === null) return;
      num = parseInt(num);
    } while (num.toString() == "NaN" || num < 1 || num > 32);
    THREAD = num;
    GM_setValue("thread_num", num);
  });

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // 伪多线程
  const multiThread = async (tasks, promiseFunc) => {
    const threads = [];
    let taskIndex = 0;

    const run = (threadID) =>
      new Promise(async (resolve) => {
        while (true) {
          let i = taskIndex++;
          if (i >= tasks.length) break;
          await promiseFunc(tasks[i], threadID);
        }
        resolve();
      });

    // 创建线程
    for (let threadID = 0; threadID < THREAD; threadID++) {
      await sleep(Math.min(2000 / THREAD, 300));
      threads.push(run(threadID));
    }
    return Promise.all(threads);
  };

  let curImgUrl = "";
  function fnGenUrl() {
    // 用于下载图片
    const imgUrl = $n(".mangaFile").getAttribute("src");
    // $n(".mangaFile").setAttribute("src","");
    if (curImgUrl !== imgUrl) {
      console.log(imgUrl);
      curImgUrl = imgUrl;
    }
    // return encodeURI(imgUrl);
    return imgUrl;
  }

  function fnGenInfo() {
    const name = $n(".title h1 a").innerHTML; // 漫画名
    const chapter = $n(".title h2").innerHTML; // 章节
    const pages = $na("option").length; // 总页数
    return { name, chapter, pages };
  }

  const fnDownload = async ($btn = null) => {
    const info = fnGenInfo();
    const cfName = `${info.name}_${info.chapter}`;
    info.done = 0;
    info.error = 0;
    info.bad = {};
    console.log(info);
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
    // 下载并添加到zip
    // page 从1开始
    const dlPromise = (url, page, threadID = 0) => {
      const fileName = ((i) => {
        return `${String(i).padStart(FILENAME_LENGTH, 0)}.jpg`;
      })(page);
      return get(url, "arraybuffer")
        .then(async (data) => {
          await zip.file(fileName, Comlink.transfer({ data }, [data]));
          info.done++;
        })
        .catch(async (e) => {
          await zip.file(`${fileName}.bad.txt`, "");
          info.bad[page] = `${url}`;
          info.error++;
          // throw e;
        });
    };
    for (let page = 0; page < info.pages; page++) {
      const url = fnGenUrl();
      btnDownloadProgress(page + 1);
      await dlPromise(url, page + 1);
      await sleep(137);
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
        })
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

  // 创建开始按钮
  let startDownload = document.createElement("a");
  startDownload.id = "startDownload";
  startDownload.className = "btn-red";
  startDownload.innerHTML = "开始下载";
  $n(".main-btn").appendChild(startDownload);
  startDownload.style.background = "#0077D1";
  startDownload.style.cursor = "pointer";
  startDownload.addEventListener("click", async () => {
    let curPage = parseInt($n("#page").innerHTML);
    if (curPage > 1) {
      alert("请从第一页开始下载");
      return false;
    }
    const fnDL = await fnDownload(startDownload);
    const { data, name, error } = await fnDL();
    if (!error) {
      saveAs(data, name);
    }
  });

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

  window.addEventListener("hashchange", () => {
    setCurImgLink();
  });
})();
