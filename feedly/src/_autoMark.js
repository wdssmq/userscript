import { _log, $n } from "./_base";
// 自动标记已读
(() => {
  if (!$n("#root") || $n("#root").dataset.MarkRead === "bind") {
    return;
  }
  // _log("fnAutoMark", "自动标记已读");
  $n("#root").dataset.MarkRead = "bind";

  // 根据事件返回需要的 dom 元素
  const fnEventFilter = (eType, eTgt) => {
    // _log("fnEventFilter", eType, eTgt);

    let pick = false;
    let objRlt = null, objDef = {
      $entry: null,
      $btn: null,
    };
    if (eType === "mouseup") {
      if (
        eTgt.classList.contains("entry__title") && eTgt.nodeName === "A"
      ) {
        objRlt = {
          // 当前条目元素
          $entry: eTgt.parentNode.parentNode,
          // 标记已读的按钮
          $btn: eTgt.parentNode.querySelector("button.EntryMarkAsReadButton"),
        };
        pick = true;
      }
    } else if (eType === "mouseover") {
      if (eTgt.nodeName === "ARTICLE" && eTgt.className.indexOf("entry") > -1) {
        objRlt = {
          // 当前内容条目元素
          $entry: eTgt,
          // 标记已读的按钮
          $btn: eTgt.querySelector("button.EntryMarkAsReadButton"),
        };

        // _log("fnEventFilter", "移入");
        // _log("fnEventFilter", eTgt.dataset.leaveCount, typeof eTgt.dataset.leaveCount);

        const intLeaveCount = parseInt(eTgt.dataset.leaveCount);

        // 已经触发过 leave 事件时才通过
        pick = intLeaveCount >= 1 ? true : false;
        if (pick) {
          return objRlt;
        }

        // _log("fnEventFilter", intLeaveCount);

        if (!isNaN(intLeaveCount)) {
          // _log("fnEventFilter", "已绑定移出事件");
          return objDef;
        }

        // 绑定移出事件
        eTgt.addEventListener("mouseleave", () => {
          // _log("fnEventFilter", "移出");
          const intLeaveCount = parseInt(eTgt.dataset.leaveCount);
          if (intLeaveCount === 0) {
            // await _sleep(1000);
            eTgt.dataset.leaveCount = "1";
          }
        }, false);

        // 设置初始值
        eTgt.dataset.leaveCount = 0;
      }
    }
    if (pick) {
      return objRlt;
    }
    return objDef;
  };
  // 事件处理函数
  const fnEventHandler = (event) => {
    // 限制鼠标在元素右侧移入才会触发
    if (event.type === "mouseover") {
      const intDiff = Math.abs(event.offsetX - event.target.offsetWidth);
      if (intDiff > 17) {
        return;
      }
    }
    const { $entry, $btn } = fnEventFilter(event.type, event.target);
    if (!$entry || !$btn) {
      return;
    }
    // 判断是否含有指定类名
    if ($entry.className.indexOf("entry--read") === -1) {
      _log("fnMarRead", event.button, "自动标记已读");
      $btn.click();
    }
  };
  // 绑定监听事件
  $n("#root").addEventListener("mouseup", fnEventHandler, false);
  $n("#root").addEventListener("mouseover", fnEventHandler, false);
})();
