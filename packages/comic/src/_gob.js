import { _log, $n, $na } from "./_base";
import { gm_name } from "./__info";

// localStorage 封装
const lsObj = {
  setItem: function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: function(key, def = "") {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return def;
  },
};

// 数据读写封装
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
    _log("[log]gob.load()\n", lsData);
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
    _log("[log]gob.save()\n", lsData);
    lsObj.setItem(this._lsKey, lsData);
  },
};

// 初始化 gobInfo
const gobInfo = {
  // key: [默认值, 是否记录至 ls]
  curImgUrl: ["", 0],
  curInfo: [{}, 0],
  autoNextC: [0, 1],
  autoNextChap: [0, 1],
  wgetImgs: [[], 1],
  maxWget: [7, 0],
};

// 初始化
gob.init().load();

export {
  lsObj,
  gob,
};
