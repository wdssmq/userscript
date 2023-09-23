import { _curUrl, _log, $n, fnElChange, _warn } from "../_base";
import { gob } from "../_gob";
import { fnCheckUrl, fnControl } from "./_funcs";
import { fnViewStars } from "./_funcs";
import { fnColorStars } from "./_colorStars";

// 滚动条滚动时触发
function fnOnScroll() {
  fnViewStars();
  fnColorStars();
}

// 处理器函数
function fnHandler(e = null) {
  if (!fnCheckUrl()) {
    return;
  }
  // 判断是否为滚动事件
  if (e && e.type === "scroll") {
    fnOnScroll();
  }
  // 更新 ls 记录
  let bolUpd = false;
  if (!gob.bolUpd) {
    bolUpd = fnControl();
  }
  if (bolUpd) {
    _warn("fnHandler", gob.data);
    gob.bolUpd = true;
  }
}

// 星标部分入口函数
function fnMain(record, observer) {
  if (!fnCheckUrl()) {
    return;
  }
  // 随机直接返回
  if (Math.random() > 0.6) {
    return;
  }
  gob.GetStarItems();
  _log("_laterCtrl fnMain", { cntStars: gob.cntStars });
  if (gob.cntStars === 0) {
    return;
  }
  // observer.disconnect();
  // 绑定事件
  if ($n("#feedlyFrame") && $n("#feedlyFrame").dataset.addEL !== "done") {
    // 加载后尝试执行一次
    fnHandler();
    $n("#feedlyFrame").addEventListener("scroll", fnHandler);
    $n("#feedlyFrame").dataset.addEL = "done";
    _log("fnMain", "绑定滚动监听");
    observer.disconnect();
  }
}

fnElChange($n("#root"), fnMain);
