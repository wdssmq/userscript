import {
  _log,
  $n,
} from "./_base";

// Your code here...

_log("[TEST]Hello, world!");

// 一个全局数据存储封装，带 ls 读写
import { gob } from "./_gob.js";
_log("[TEST]gob.data", gob.data);

if (gob.intTest <= 3) {
  alert("[TEST]Hello, world!");
}

// 写入数据并保存
gob.intTest += 1;
gob.save();
_log("[TEST]gob.data", gob.data);

const $p = $n("p");
$p.innerHTML += `<br>${gob.strTest} - by innerHTML`;

$("p").append(`<br>${gob.intTest} - by jQuery`);

// Your code here...
