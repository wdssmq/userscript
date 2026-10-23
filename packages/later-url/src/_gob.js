import { gm_name } from "./__info";
import { _log, curTimestamp } from "./_base";
import config from "./func/_config";
import http from "./func/_http";

// localStorage 封装
const lsObj = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key, def = "") => {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return def;
  },
};

// 数据读写封装
const gobInfo = {
  // key: [默认值, 是否记录至 ls]
  errCount: [0, false],
  postCount: [0, false],
  postIndex: [0, false],
  remoteTotal: [0, false],
  // 上次同步登记名单的时间戳，-1 表示从未同步
  lstSync: [-1, true],
  curUrl: [location.href, false],
  lstUrl: ["", false],
};
const gob = {
  _lsKey: `${gm_name}_data`,
  _bolLoaded: false,
  data: {},
  config,
  // 初始
  init() {
    // 根据 gobInfo 设置 gob 属性
    for (const key in gobInfo) {
      if (Object.hasOwnProperty.call(gobInfo, key)) {
        const item = gobInfo[key];
        this.data[key] = item[0];
        Object.defineProperty(this, key, {
          // value: item[0],
          // writable: true,
          get() { return this.data[key] },
          set(value) { this.data[key] = value },
        });
      }
    }
    return this;
  },
  // 读取
  load() {
    if (this._bolLoaded) {
      return this;
    }
    const lsData = lsObj.getItem(this._lsKey, this.data);
    _log("[log]gob.load()", lsData);
    for (const key in lsData) {
      if (Object.hasOwnProperty.call(lsData, key)) {
        const item = lsData[key];
        this.data[key] = item;
      }
    }
    this._bolLoaded = true;
    return this;
  },
  // 保存
  save() {
    const lsData = {};
    for (const key in gobInfo) {
      if (Object.hasOwnProperty.call(gobInfo, key)) {
        const item = gobInfo[key];
        if (item[1]) {
          lsData[key] = this.data[key];
        }
      }
    }
    _log("[log]gob.save()", lsData);
    lsObj.setItem(this._lsKey, lsData);
  },
};

gob.http = http;

// 由推送地址解析站点根与登记名单地址
// zbpUrl: {host}zb_system/cmd.php?act=ajax&src=odd_Later&token=xxx
gob.zbpInfo = () => {
  const info = {
    host: "",
    usersUrl: "",
  };
  const strUrl = (config.data.zbpUrl || "").trim();
  if (!strUrl) {
    return info;
  }
  const oMatch = strUrl.match(/^(https?:\/\/[^/]+\/.*?)zb_system\/cmd\.php/i);
  if (!oMatch) {
    return info;
  }
  info.host = oMatch[1];
  info.usersUrl = `${info.host}zb_users/plugin/odd_Later/usr/bili.json`;
  return info;
};

// 距上次同步超过一天时同步一次，成功才记录时间
gob.checkSyncZbpUsers = async () => {
  const curTime = curTimestamp;
  if (gob.lstSync > 0 && curTime - gob.lstSync < 86400) {
    return false;
  }
  const rlt = await gob.syncZbpUsers();
  if (rlt) {
    gob.lstSync = curTime;
    gob.save();
  }
  return rlt;
};

// 拉取登记名单（bili.json）并更新 zbpUsers
// 名单形如：[{ uid, name, type }]
gob.syncZbpUsers = async () => {
  const { usersUrl } = gob.zbpInfo();
  if (!usersUrl) {
    _log("gob.syncZbpUsers() - 未配置推送地址");
    return false;
  }
  try {
    const res = await gob.http.get(usersUrl);
    const list = JSON.parse(res.responseText);
    const users = {};
    list.forEach((item) => {
      if (!item || !item.uid) {
        return;
      }
      users[String(item.uid)] = String(item.name || item.uid);
    });
    config.data.zbpUsers = users;
    config.save();
    _log("gob.syncZbpUsers()\n", users);
    return true;
  }
  catch (error) {
    _log("gob.syncZbpUsers() - error\n", error);
    return false;
  }
};

// 删除 url
gob.delUrl = async (url, category) => {
  const { baseUrl, authToken } = config.data;
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  const apiUrl = `${baseUrl}admin/${category}/del-url/?url=${url}`;
  try {
    const res = await gob.http.get(apiUrl, headers);
    // _log("gob.delUrl()\n", res);
    // _log("gob.delUrl()\n", res.responseText);
    const resJSON = JSON.parse(res.responseText);
    _log("gob.delUrl()\n", resJSON);
    return true;
  }
  catch (error) {
    gob.errCount += 1;
    _log("gob.delUrl() - error\n", error);
    return false;
  }
};

gob.stopByErrCount = () => {
  if (gob.errCount >= 4) {
    _log("gob.stopByErrCount()\n", "累计错误达到限制");
    return true;
  }
  return false;
};

// 快速防重检查，指定 key 在本地存储中计数，达到 4 次则返回 true
gob.stopByQuickCheck = (quickKey, write = false) => {
  if (quickKey === "")
    return null;
  const lsData = lsObj.getItem(quickKey, { count: -1 });
  if (lsData.count >= 4) {
    return true;
  }
  if (write) {
    lsData.count += 1;
    lsObj.setItem(quickKey, lsData);
  }
  return false;
};

// 使用 lsObj 记录发送历史，同一个链接在指定天数内 dayLimit 内最多发送 sendLimit 次
gob.stopBySendLimit = (url, dayLimit = 37, sendLimit = 4) => {
  const curDay = Math.floor(curTimestamp / 86400);
  const key = `sendLimit_${url}`;
  const item = lsObj.getItem(key, { lstDay: curDay, count: 0 });
  if (curDay - item.lstDay > dayLimit) {
    item.lstDay = curDay;
    item.count = 0;
  }
  if (item.count >= sendLimit) {
    _log("gob.stopBySendLimit()\n", `当前链接 ${url} 已达到重复发送限制:\n`, {
      item,
      curDay,
      dayLimit,
      sendLimit,
    });
    return true;
  }
  item.count += 1;
  lsObj.setItem(key, item);
  return false;
};

// 初始化
gob.init().load().checkSyncZbpUsers();

export {
  gob,
  lsObj,
};
