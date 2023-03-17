import { _log, $n, $na } from "./_base";

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


window.addEventListener("hashchange", () => {
  setCurImgLink();
});

export {
  fnGenUrl,
  fnGenInfo,
  fnGet,
};
