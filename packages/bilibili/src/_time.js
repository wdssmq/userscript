import { $n, _curUrl, _warn } from "./_base.js";
// 时间轴书签

const gob = {
  lstTime: 0,
  curTime: 0,
  curPart: 0,
  isRunning: false,
  title: "",
  step: 73,
};

function fnUpTitle(part, time) {
  if (gob.title === "") {
    gob.title = $n("h1.video-title").innerHTML;
  }
  const strAdd = ((obj) => {
    let str = "";
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (!val) {
          continue;
        }
        const s = key === "part" ? "P" : "播放至 ";
        str += `_${s}${val}`;
      }
    }
    return str;
  })({ part, time });
  $n("title").innerHTML = `${gob.title}${strAdd}_bilibili`;
  // debug
  _warn(`title: ${$n("title").innerHTML}`);
}

function fnUpUrl(p, time) {
  let url = _curUrl();
  let urlNew = url;
  // 清理参数
  url = url.split("?")[0];
  // _warn("fnUpUrl", { p, time });
  // 新参数构造
  const params = new URLSearchParams();
  for (const key in { p, time }) {
    if (Object.hasOwnProperty.call({ p, time }, key)) {
      const item = { p, time }[key];
      if (item) {
        params.append(key, item);
      }
    }
  }
  // 拼接参数
  urlNew = `${url}?${params.toString()}`;
  // 更新至地址栏
  window.history.pushState(null, null, urlNew);
  // debug
  _warn(`url: ${urlNew}`);
}

function fnGetTime() {
  const $timLabel = $n(".bpx-player-ctrl-time-label");
  const $curTime = $n(".bpx-player-ctrl-time-current");
  if ($timLabel && $curTime) {
    const str = $curTime.innerHTML;
    const arr = str.split(":");
    if (arr.length === 3) {
      return Number.parseInt(arr[0]) * 3600 + Number.parseInt(arr[1]) * 60 + Number.parseInt(arr[2]);
    }
    else {
      return Number.parseInt(arr[0]) * 60 + Number.parseInt(arr[1]);
    }
  }
  return 0;
}

function fnGetPart() {
  const $list = $n("ul.list-box");
  const $cur = $list?.querySelector("li.on");
  const $curHref = $cur?.querySelector("a");
  if ($cur && $curHref) {
    // _warn($cur, $curHref);
    const str = $curHref.href;
    const arr = str.split("?p=");
    if (arr.length === 2) {
      return Number.parseInt(arr[1]);
    }
  }
  return null;
}

function fnDelay(time, fnc = () => { }) {
  if (gob.isRunning) {
    return;
  }
  gob.isRunning = true;
  setTimeout(() => {
    fnc();
    gob.isRunning = false;
  }, time);
}

document.addEventListener(
  "mouseover",
  (_e) => {
    // const $target = e.target;
    fnDelay(1000, () => {
      // bpx-player-container bpx-state-no-cursor
      const $container = $n(".bpx-player-container");
      let bolFlag = false;
      if ($container && !$container.classList.contains("bpx-state-no-cursor")) {
        gob.curTime = fnGetTime();
        gob.curPart = fnGetPart();
        if (gob.curTime > 0 && gob.curTime - gob.lstTime > gob.step) {
          bolFlag = true;
        }
        if (gob.curTime < gob.lstTime) {
          bolFlag = true;
        }
        if (gob.lstTime <= Number.parseInt(gob.step / 4)) {
          bolFlag = true;
        }
        if (bolFlag) {
          fnUpTitle(gob.curPart, gob.curTime);
          fnUpUrl(gob.curPart, gob.curTime);
          gob.lstTime = gob.curTime;
        }
        // _warn("进度条触发", e.target);
        // _warn("进度条触发", gob);
      }
    });
  },
  false,
);
