import {
  _log,
  $n,
  curHref,
  lsObj,
} from "./_base.js";

(() => {
  const $body = $n("body");
  const defData = {
    status: 0, // 用于记录状态
    href: curHref,
  };

  // 更新 lsData 中的 status 状态
  const updateStatus = (status) => {
    const lsData = lsObj.getItem("xiuno_login", defData);
    lsData.status = status;
    lsObj.setItem("xiuno_login", lsData);
  };

  // 登录后跳转前登录前的页面
  const goUrl = () => {
    // 读取 localStorage
    const lsData = lsObj.getItem("xiuno_login", defData);
    // 根据记录的状态判断是否跳转
    if (lsData.status === 1) {
      // 更新状态
      updateStatus(2);
      // 跳转前的页面地址
      location.href = lsData.href;
    }
  };

  // 主入口函数，判断是否登录
  const checkLogin = () => {
    // 判断 body 内容是否为空
    if ($body.textContent.trim() !== "") {
      // 有内容，说明已登录，根据记录的地址跳转
      goUrl();
      return;
    }
    // 更新状态及 href 到 localStorage
    updateStatus(1);
    // 跳转登录页
    location.href = "/user-login.html";
  };

  // 延时 3 秒检查
  setTimeout(checkLogin, 3000);
})();
