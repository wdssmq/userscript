import { $n } from "./_base.js";

// 防止误点
const fnStopSource = (e) => {
  const $target = e.target;
  if ($target.classList.contains("entry__source")) {
    // 记录触发次数到 dataset
    const intCount = $target.dataset.clickCount || 0;
    if (intCount === 0) {
      $target.dataset.clickCount = intCount + 1;
      e.preventDefault();
      e.stopPropagation();
      // e.stopImmediatePropagation();
      // alert("entry__source");
      return;
    }
  }
};

$n("#root").addEventListener("click", fnStopSource);

