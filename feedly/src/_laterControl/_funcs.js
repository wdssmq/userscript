import { _curUrl, $n, _log } from "../_base";
import { gob, curHours } from "../_gob";

// 判断当前地址是否是收藏页
const fnCheckUrl = () => {
  if ("https://feedly.com/i/saved" === _curUrl()) {
    return true;
  }
  return false;
};

// 当前星标数获取
function fnGetItems(obj) {
  const $listWrap = $n("div.list-entries");
  if ($listWrap) {
    obj.$$Stars = $listWrap.querySelectorAll("div.content>a");
    return obj.$$Stars.length;
  }
  return 0;
}

const fnCheckControl = (diff) => {
  const iTime = curHours;
  const modTime = iTime % 4;
  gob._time.cycle = iTime;
  gob._time.rem = modTime;
  // _log("fnCheckControl", JSON.stringify(diff), iTime, modTime);
  // diff.decr 累计已读
  // diff.incr 累计新增
  if (diff.decr >= 17 && diff.decr - diff.incr >= 4) {
    if (modTime === 0) {
      return "reset";
    } else {
      return "lock";
    }
  }
  return "default";
};

// 星标变动控制
function fnControl() {
  const $end = $n(".list-entries > h2");
  if (!$end) {
    _log("fnControl", "页面加载中");
    return false;
  }

  // 读取 gob 值备用
  const strReset = gob.bolReset.toString();
  let diffStars = gob.diffStars;

  // 解锁重置判断
  if (gob.bolReset) {
    diffStars = { decr: 0, incr: 0 };
  }
  // decrease 减少
  // increase 增加

  // 星标变化计数
  const diff = gob.cntStars - gob.lstStars;

  // 写入新的星标数
  gob.lstStars = gob.cntStars;

  // 初始化时直接返回
  if (diff === gob.cntStars) {
    gob.save();
    return true;
  }

  // 判断变化状态
  if (diff > 0) {
    // 新增星标计数
    diffStars.incr += Math.abs(diff);
  } else {
    // 已读星标计数
    diffStars.decr += Math.abs(diff);
  }

  gob.bolReset = ((diff) => {
    if (fnCheckControl(diff) === "reset") {
      return true;
    }
    return false;
  })(diffStars);

  // 更新 localStorage 存储
  if (diff !== 0 || strReset !== gob.bolReset.toString()) {
    gob.diffStars = diffStars;
    gob.save();
  }

  return true;
}

// 收藏数 View
function fnViewStars() {
  gob.cntStars = fnGetItems(gob);
  // _log("fnViewStars", gob.cntStars);
  const strText = `Read later（${gob.cntStars} 丨 -${gob.diffStars.decr} 丨 +${gob.diffStars.incr}）（${gob._time.cycle} - ${gob._time.rem}）`;
  $n("h1 #header-title").innerHTML = strText;
  if ($n("header.header h2")) {
    $n("header.header h2").innerHTML = strText;
  }
  $n("#header-title").innerHTML = strText;
}


export {
  fnCheckUrl,
  fnGetItems,
  fnCheckControl,
  fnControl,
  fnViewStars,
};
