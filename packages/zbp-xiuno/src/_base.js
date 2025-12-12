import { gm_name } from "./__info";

// 初始变量
const $n = (selector, context = document) => context.querySelector(selector);
const $ = window.jQuery || unsafeWindow.jQuery;
const UM = window.UM || unsafeWindow.UM;
const UE = window.UE || unsafeWindow.UE;
const curHref = location.href.replace(location.hash, "");
// localStorage 封装
const lsObj = {
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem(key, def = "") {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return def;
  },
};
// 预置函数
const _log = (...args) => console.log(`[${gm_name}]\n`, ...args);
const _hash = () => location.hash.replace("#", "");
// Get 封装
function fnGetRequest(strURL, strData, fnCallback) {
  if (typeof strData === "function") {
    fnCallback = strData;
    strData = "";
  }
  GM_xmlhttpRequest({
    method: "GET",
    data: strData,
    url: strURL,
    onload(responseDetail) {
      if (responseDetail.status === 200) {
        fnCallback(responseDetail.responseText, strURL);
      }
      else {
        console.log(responseDetail);
        alert("请求失败，请检查网络！");
      }
    },
  });
}
// formtTime 封装
function fnFormatTime() {
  const objTime = new Date();
  const strYear = objTime.getFullYear();
  const strMonth = objTime.getMonth() + 1;
  const strDate = objTime.getDate();
  // const strHour = objTime.getHours();
  // const strMinute = objTime.getMinutes();
  // const strSecond = objTime.getSeconds();
  return (
    `${[strYear, strMonth, strDate].map(n => n.toString().padStart(2, "0")).join("-")
    // " " +
    // [strHour, strMinute, strSecond].map((n) => n.toString().padStart(2, "0")).join(":") +
    }`
  ).trim();
}

export { $, $n, _hash, _log, curHref, fnFormatTime, fnGetRequest, lsObj, UE, UM };
