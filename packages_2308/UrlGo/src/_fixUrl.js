import { curHost } from "./_base";

// 百度贴吧的各种链接统一
const arrHostList = [
  "jump.bdimg.com",
  "jump2.bdimg.com",
];

if (arrHostList.includes(curHost)) {
  const newUrl = window.location.href.replace(curHost, "tieba.baidu.com");
  window.location.href = newUrl;
}
