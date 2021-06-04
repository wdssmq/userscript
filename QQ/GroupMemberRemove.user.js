// ==UserScript==
// @name        [QQ 群] - 批量踢人（QQ群：189574683）
// @namespace   wdssmq
// @version     1.6
// @author      沉冰浮水
// @description 自动选择 20 名成员
// ----------------------------
// @link   https://afdian.net/@wdssmq
// @link   https://github.com/wdssmq/userscript
// @link   https://greasyfork.org/zh-CN/users/6865-wdssmq
// ----------------------------
// @link        https://greasyfork.org/zh-CN/scripts/26812
// ----------------------------
// @include     https://qun.qq.com/member.html*
// @include     http://qun.qq.com/member.html*
// @grant       none
// ==/UserScript==
function $n(e) {
  return document.querySelector(e);
}
function $na(e) {
  return document.querySelectorAll(e);
}

function fnRun() {
  if (!$n(".del-member.disabled"))
    return false;
  $n(".del-member.disabled").removeAttribute("disabled");
  $n(".del-member.disabled").className = "del-member";

  var mbList = $na('.mb .check-input');
  for (var x = 0; x < 20; x++) {
    mbList[x].setAttribute('checked', 'checked');
  }
  fnRun();
}
window.addEventListener('scroll', function () {
  fnRun();
});
$n('.select-result .submit').addEventListener('click', function () {
  t = setTimeout(function () {
    fnRun();
  }, 900);
}, false);
