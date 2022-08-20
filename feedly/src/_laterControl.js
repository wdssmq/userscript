import { curDate, _curUrl, _log, $n, $na, fnElChange, fnFindDomUp } from "./_base";

// localStorage 封装
const lsObj = {
  setItem: function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: function (key, def = "") {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return def;
  },
};

// 数据读写封装
const gob = {
  // 非 ls 字段
  _loaded: false,
  _curStars: 0,
  _time: {
    cycle: 0,
    rem: 0,
  },
  // ls 字段
  data: {
    bolReset: false,
    lstStars: 0,
    diffStars: { decr: 0, incr: 0 },
    // decrease 减少
    // increase 增加
  },
  // 读取
  load: function () {
    if (this._loaded) {
      return;
    }
    this._loaded = true;
    this.data = lsObj.getItem("feedly_bld_data", this.data);
    _log("load", gob);
  },
  // 保存
  save: function () {
    lsObj.setItem("feedly_bld_data", this.data);
    _log("save", gob);
  },
}

// 判断当前地址是否是收藏页
const fnCheckUrl = () => {
  if ("https://feedly.com/i/saved" === _curUrl()) {
    return true;
  }
  return false;
}

// 当前星标数获取
function fnLaterGetItems(obj) {
  const $listWrap = $n("div.list-entries");
  if ($listWrap) {
    obj.$list = $listWrap.querySelectorAll("div.content a");
    return obj.$list.length;
  }
  return 0;
}

// 收藏数 View
function fnLaterViewStars() {
  gob._curStars = fnLaterGetItems(gob);
  const strText = `Read later（${gob._curStars} 丨 -${gob.data.diffStars.decr} 丨 +${gob.data.diffStars.incr}）（${gob._time.cycle} - ${gob._time.rem}）`;
  $n("h1 #header-title").innerHTML = strText;
  if ($n("header.header h2")) {
    $n("header.header h2").innerHTML = strText;
  }
  $n("#header-title").innerHTML = strText;
}

// 滚动条滚动时触发
function fnLaterOnScroll() {
  if (!fnCheckUrl()) {
    return;
  }
  fnLaterViewStars();
  fnColorStars();
  // 全部条目加载后执行
  if ($n(".list-entries > h2")) {
    !gob._loaded && _log("fnLaterOnScroll", "页面加载完成");
    fnLaterControl();
  } else {
    _log("fnLaterOnScroll", "页面加载中");
  }
}

// 星标部分入口函数
function fnLaterMain(record, observer) {
  if (!fnCheckUrl()) {
    return;
  }
  // 随机直接返回
  if (Math.random() > 0.4) {
    return;
  }
  gob._curStars = fnLaterGetItems(gob);
  if (gob._curStars === 0) {
    return;
  }
  // observer.disconnect();
  // 绑定事件
  if ($n("#feedlyFrame") && $n("#feedlyFrame").dataset.addEL !== "done") {
    fnLaterOnScroll();
    $n("#feedlyFrame").addEventListener("scroll", fnLaterOnScroll);
    $n("#feedlyFrame").dataset.addEL = "done";
    _log("fnLaterMain", "绑定滚动监听");
  }
}

fnElChange($n("#root"), fnLaterMain);

const curTime = Math.floor(curDate.getTime() / 1000);
const curHours = Math.floor(curTime / 3600);
// const cur4Hours = Math.floor(curTime / (60 * 60 * 4));
const cur4Minutes = Math.floor(curTime / 240);

const fnCheckControl = (diff) => {
  const iTime = curHours;
  gob._time.cycle = iTime;
  gob._time.rem = iTime % 4;
  // 累计已读少于 17 或者累计新增大于累计已读
  if (diff.decr < 17 || diff.incr - diff.decr >= 4) {
    return "default";
  }
  // 每 4 小时且累计已读大于累计新增
  if (iTime % 4 === 0 && diff.decr - diff.incr >= 4) {
    return "reset";
  }
  return "lock";
};

// 星标变动控制
function fnLaterControl() {
  if (gob._loaded) {
    return;
  }
  gob.load();

  // 解锁重置判断
  if (gob.data.bolReset) {
    gob.data.diffStars.decr = 0;
    gob.data.diffStars.incr = 0;
  }

  // 星标变化计数
  const diff = gob._curStars - gob.data.lstStars;

  // 写入新的星标数
  gob.data.lstStars = gob._curStars;

  // 初始化时直接返回
  if (diff === gob._curStars) {
    gob.save();
    return;
  }

  // 大于上一次记录
  if (diff > 0) {
    // 新增星标计数
    gob.data.diffStars.incr += Math.abs(diff);
  } else {
    // 已读星标计数
    gob.data.diffStars.decr += Math.abs(diff);
  }

  // 记录变量原始值
  const strReset = gob.data.bolReset.toString();

  // _log("fnLaterControl", strReset);

  gob.data.bolReset = ((diff) => {
    if (fnCheckControl(diff) === "reset") {
      return true;
    }
    return false;
  })(gob.data.diffStars);

  // 更新 localStorage 存储
  if (diff !== 0 || strReset !== gob.data.bolReset.toString()) {
    gob.save();
  }
}

// 按规则给星标条目着色
function fnColorStars(offset = 0) {
  // _log("fnColorStars", curTime, cur4Minutes);

  const $stars = gob.$list;
  const isLock = fnCheckControl(gob.data.diffStars);
  if (isLock === "lock") {
    $n(".list-entries").style.backgroundColor = "#666";
  }
  let pickCount = 0;
  [].forEach.call($stars, function ($e, i) {
    // _log("fnColorStars", $e, i);
    // _log("fnColorStars", "==============================");

    const $ago = fnFindDomUp($e, ".ago", 2);
    const href = $e.href + $ago.innerHTML;
    const hash = parseInt(href.replace(/\D/g, ""));

    // _log("fnColorStars", href, hash);

    // const intNum = parseInt(hash + cur4Minutes + i);
    const intNum = parseInt(hash + cur4Minutes + offset);

    if (intNum % 4 === 0) {
      // _log("fnColorStars", intNum, intNum % 4);
      pickCount++;
      $e.parentNode.parentNode.style.backgroundColor = "#ddd";
    } else {
      $e.parentNode.parentNode.style.backgroundColor = "transparent";
      if (isLock === "lock" || pickCount > 7) {
        // console.log($e.parentNode.parentNode.classList);
        $e.parentNode.parentNode.style.backgroundColor = "#666";
      }
    }
  });
  if (pickCount <= 4) {
    fnColorStars(offset + 1);
  }
}
