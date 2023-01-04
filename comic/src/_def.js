import { _log, $n } from "./_base";

// 一个全局数据存储封装，带 ls 读写
import { gob } from "./_gob.js";
_log("[TEST]gob.data", gob.data);

// Your code here...
_log("[TEST]Hello, world!");
if (gob.intTest <= 3) {
  alert("[TEST]Hello, world!");
}
const $p = $n("p");
$p.innerHTML += `<br>${gob.strTest}`;
// Your code here...
