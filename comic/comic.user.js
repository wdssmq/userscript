// ==UserScript==
// @name         [manhuagui]打包下载（QQ群：189574683）
// @namespace    https://www.wdssmq.com/
// @version      0.1
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
/*jshint esversion:6 */
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
  function fnGenUrl() {
    // 用于下载图片
    let imgUrl = document.querySelector(".mangaFile").getAttribute("src");
    if (imgUrl.includes("[") || imgUrl.includes("]")) {
      //如果url里含有[]这两个符号，会被encodeURI编码掉。所以encodeURI之后要在转换回来（我在这地方被坑了数小时）。但为什么下边还要再encodeURI一次？不经过二次encodeURI就不行，我也是好晕啊
      imgUrl = encodeURI(imgUrl).replace(/%5B/g, "[").replace(/%5D/g, "]");
    } else if (imgUrl.includes("%") && imgUrl.includes("%26") === false) {
      //如果含有已经转码过的汉字，就全解码成汉字，再编码。%26是排除&符号。但为什么还是需要第二次编码？
      imgUrl = encodeURI(decodeURI(imgUrl));
    } else {
      //虽然不知道为什么，总之编码两次就对了
      imgUrl = encodeURI(imgUrl);
    }
    console.log(imgUrl);
    return imgUrl;
  }

  function fnGenInfo() {
    const name = $n(".title h1 a").innerHTML; //漫画名
    const chapter = $n(".title h2").innerHTML; //漫画名
    const pages = $na("option").length; // 总页数
    return { name, chapter, pages };
  }

  // 网络请求
  const get = (url, responseType = "json", retry = 3) =>
    new Promise((resolve, reject) => {
      try {
        GM_xmlhttpRequest({
          method: "GET",
          url,
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
  let FILENAME_LENGTH = parseInt(GM_getValue("filename_length", "0")) || 0;
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
  const fnDownload = async () => {
    const info = fnGenInfo();
    const cfName = `${info.name}_${info.chapter}`;
    info.done = 0;
    console.log(info);
    // zip
    const zip = await new JSZip();
    // 下载并添加到zip
    const dlPromise = (url, page, threadID = 0) => {
      return get(url, "arraybuffer")
        .then(async (data) => {
          const fileName = ((i) => {
            return `${String(i + 1).padStart(FILENAME_LENGTH, 0)}.jpg`;
          })(page);
          await zip.file(fileName, Comlink.transfer({ data }, [data]));
          info.done++;
        })
        .catch((e) => {
          info.error = true;
          throw e;
        });
    };
    for (let page = 0; page < info.pages; page++) {
      await sleep(593);
      const url = fnGenUrl();
      await dlPromise(url, page);
      $n("#next").click();
    }
    // await multiThread(urls, dlPromise);
    return async () => {
      info.compressing = true;
      let lastZipFile = "";
      const { data } = await zip.generateAsync(
        { type: "arraybuffer", ...getCompressionOptions() },
        Comlink.proxy(({ percent, currentFile }) => {
          if (lastZipFile !== currentFile && currentFile) {
            lastZipFile = currentFile;
            console.log(`Compressing ${percent.toFixed(2)}%`, currentFile);
          }
          info.compressingPercent = percent;
        })
      );
      console.log(info);
      console.log("Done");
      return {
        name: `${cfName}.zip`,
        data: new Blob([data]),
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
    const fnDL = await fnDownload();
    const { data, name } = await fnDL();
    saveAs(data, name);
  });
})();
