import { fnAfter, fnAppendStart, $n, _warn } from "./_base";


const fnMain = () => {
  // 导航设置
  const $sub_nav_list = $n(".sub_nav_list");
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


  /* // #right_wrap
  const $right_wrap = $n("#right_wrap");
  _warn($right_wrap)
  const $h3_i = document.createElement("h3");
  $h3_i.className = "right_title";
  $h3_i.innerHTML = `
    <a href="https://tieba.baidu.com/i/i/forum?&pn=2" class="right_title_link" target="_blank">
      我关注的贴吧
    </a>
  `;
  // 插入到侧栏
  fnAppendStart($h3_i, $right_wrap); */
};

try {
  fnMain();
} catch (error) {
  _warn(error);
}

