import { _log, $n, $na } from "./_base";
// 拿回订阅源地址
// 绑定监听事件到 div#box 上
$n("#root").addEventListener("mouseup", function (event) {
  // 输出触发事件的元素
  // 根据内容判断是否执行相应操作
  const elText = event.target.innerHTML;
  if (
    // elText.indexOf("Feed not found") > -1 ||
    elText.indexOf("Wrong feed URL") > -1
  ) {
    // 内部再输出一次确定判断条件正确
    console.log(event.target);
    // 拿到解码后的订阅源地址
    const curUrl = ((url) => {
      return url.replace("https://feedly.com/i/subscription/feed/", "");
    })(decodeURIComponent(curUrl));
    // 输出到页面中
    $n("#feedlyPageFX h2").insertAdjacentHTML(
      "beforeend",
      `<div class="sub">${curUrl}</div>`,
    );
  }
}, false);
