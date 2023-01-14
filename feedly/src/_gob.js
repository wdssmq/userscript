import { gm_name } from "./__info";
import { _log, curDate } from "./_base";

const curTime = Math.floor(curDate.getTime() / 1000);
const curHours = Math.floor(curTime / 3600);
// const cur4Hours = Math.floor(curTime / (60 * 60 * 4));
const cur4Minutes = Math.floor(curTime / 240);

// localStorage 封装
const lsObj = {
  setItem: function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: function (key, def = "") {
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
  $$Stars: [null, 0],
  bolUpd: [false, 0],
  bolReset: [false, 1],
  cntStars: [0, 0],
  diffStars: [{ decr: 0, incr: 0 }, 1],
  lstStars: [0, 1],
};
// decrease 减少
// increase 增加
const gob = {
  _lsKey: `${gm_name}_data`,
  _bolLoaded: false,
  _time: {
    cycle: 0,
    rem: 0,
  },
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

// 初始化
gob.init().load();


export {
  curHours,
  cur4Minutes,
  lsObj,
  gob,
};