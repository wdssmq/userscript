import {
  _log,
  $n,
  curHref,
  lsObj,
} from "./_base.js";

(() => {
  const $body = $n("body");
  const defData = {
    status: null, // 用于记录状态
    href: "",
  };

  // 更新 lsData 中的 status 状态
  const updateStatus = (status) => {
    const lsData = lsObj.getItem("xiuno_login", defData);
    lsData.status = status;
    lsData.href = status === "未登录" ? curHref : "";
    lsObj.setItem("xiuno_login", lsData);
  };

  // 登录后跳转前登录前的页面
  const goUrl = () => {
    // 读取 localStorage
    const lsData = lsObj.getItem("xiuno_login", defData);
    // 根据记录的状态判断是否跳转
    if (lsData.status === "未登录" && lsData.href) {
      // 读取要跳转的地址
      const href = lsData.href;
      // 更新状态
      updateStatus("已登录");
      // 跳转前的页面地址
      location.href = href;
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
    updateStatus("未登录");
    // 跳转登录页
    location.href = "/user-login.html";
  };

  _log("检查登录状态");
  // 延时 3 秒检查
  setTimeout(checkLogin, 3000);
})();
