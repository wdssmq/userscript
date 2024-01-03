import { _log, curTimestamp } from "./_base";
import { gm_name } from "./__info";
import http from "./_http";

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
  curUrl: [location.href, false],
  lstUrl: ["", false],
};
const gob = {
  _lsKey: `${gm_name}_data`,
  _bolLoaded: false,
  data: {},
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
      return;
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

gob.stopByErrCount = () => {
  if (gob.errCount >= 4) {
    _log("gob.stopByErrCount()\n", "累计错误达到限制");
    return true;
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
gob.init().load();

export {
  lsObj,
  gob,
};
