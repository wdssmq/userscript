import { $n, _warn, fnAfter } from "./_base";

function fnMain() {
  // 导航设置
  const $sub_nav_list = $n(".sub_nav_list");
  if (!$sub_nav_list) {
    return;
  }
  // 宽度 100%
  $sub_nav_list.style.width = "100%";
  // 匹配「个性动态」元素
  const $nav_personal = $n("#nav-personal-wraper");
  _warn($nav_personal);
  // 创建一个新的导航链接
  const $nav_i = document.createElement("li");
  $nav_i.className = "nav-i-forum";
  $nav_i.innerHTML = `
    <a href="https://tieba.baidu.com/i/i/forum?&pn=2" class="nav-item-link" target="_blank">
      我关注的贴吧
    </a>
  `;
  $nav_i.style.float = "right";
  // 插入到导航栏
  fnAfter($nav_i, $nav_personal);
}

try {
  fnMain();
}
catch (error) {
  _warn(error);
}
