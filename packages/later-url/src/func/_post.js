import { _log, _logOnce } from "../_base";
import { gob } from "../_gob";
import config from "./_config";

// 标题清洗：去空白与 #
gob.filter = str => String(str).replace(/\s/g, "").replace(/#/g, "");

// 发送链接信息到远程服务（CF）
// info: { uid, name, bvid, title, date, url, category }
gob.postCF = async (info, data = {}) => {
  // 未启用则不发请求
  if (!config.data.enableCf) {
    _logOnce("gob.postCF() - 远程服务未启用，跳过发送");
    return false;
  }
  const { baseUrl, authToken } = config.data;
  gob.postIndex += 1;
  info.title = gob.filter(info.title);
  const url = `${baseUrl}add?url=${encodeURIComponent(info.url)}&title=${encodeURIComponent(info.title)}&author=${encodeURIComponent(data.username)}&category=${encodeURIComponent(data.category)}&date=${data.date}`;
  _log(`gob.postCF() - ${gob.postIndex}\n`, url);
  try {
    const res = await gob.http.get(url, {
      Authorization: `Bearer ${authToken}`,
    });
    _log("gob.postCF()\n", res.responseText);
    if (res.status !== 200) {
      return false;
    }
    const resJSON = JSON.parse(res.responseText);
    gob.remoteTotal = resJSON.data.count || 0;
    if (typeof data.showProgress === "function") {
      data.showProgress(gob.postIndex, gob.remoteTotal);
    }
    return true;
  }
  catch (error) {
    _log("gob.postCF() - error\n", error);
    return false;
  }
};

// 发送链接信息到 ZBP 插件（odd_Later）
// 推送地址形如：{host}zb_system/cmd.php?act=ajax&src=odd_Later&token=xxx
gob.postZBP = async (info, data = {}) => {
  // 未启用则不发请求
  if (!config.data.enableZbp) {
    _logOnce("gob.postZBP() - ZBP 插件未启用，跳过发送");
    return false;
  }
  const strUrl = (config.data.zbpUrl || "").trim();
  if (!strUrl) {
    _logOnce("gob.postZBP() - 未配置推送地址");
    return false;
  }
  // 只推送已登记的 UP
  const uid = String(info.uid || data.uid || "").trim();
  if (!(config.data.zbpUsers || {})[uid]) {
    _logOnce(`gob.postZBP() - 未登记的 UP，跳过发送：${uid}`);
    return false;
  }
  const body = {
    uid,
    name: info.name || data.username || "",
    url: info.url,
    title: info.title,
  };
  _log("gob.postZBP()\n", body);
  try {
    const res = await gob.http.postJson(strUrl, body);
    const resJSON = JSON.parse(res.responseText);
    _log("gob.postZBP()\n", resJSON);
    // 6 为重复推送，视为已存在
    return resJSON.err === 0 || resJSON.err === 6;
  }
  catch (error) {
    _log("gob.postZBP() - error\n", error);
    return false;
  }
};
