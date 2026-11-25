import { gm_name } from "./__info";
import { _log } from "./_base";

type GobValue = string | number;

interface GobInfoItem {
  value: GobValue
  persist: boolean
}

// localStorage 封装
const lsObj = {
  setItem(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem<T>(key: string, def: T): T {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
    return def;
  },
};

// 数据读写封装
const gobInfo: Record<string, GobInfoItem> = {
  // key: [默认值, 是否记录至 ls]
  strTest: { value: "TEST", persist: false },
  intTest: { value: 0, persist: true },
};

class Gob {
  readonly _lsKey = `${gm_name}_data`;
  _bolLoaded = false;
  data: Record<string, GobValue> = {};
  declare strTest: string;
  declare intTest: number;

  // 初始
  init(): this {
    // 根据 gobInfo 设置 gob 属性
    for (const [key, item] of Object.entries(gobInfo)) {
      this.data[key] = item.value;
      Object.defineProperty(this, key, {
        get: () => this.data[key],
        set: (value: GobValue) => {
          this.data[key] = value;
        },
      });
    }
    return this;
  }

  // 读取
  load(): void {
    if (this._bolLoaded) {
      return;
    }
    const lsData = lsObj.getItem<Record<string, GobValue>>(this._lsKey, this.data);
    _log("[log]gob.load()", lsData);
    for (const [key, value] of Object.entries(lsData)) {
      this.data[key] = value;
    }
    this._bolLoaded = true;
  }

  // 保存
  save(): void {
    const lsData: Record<string, GobValue> = {};
    for (const [key, item] of Object.entries(gobInfo)) {
      if (item.persist) {
        lsData[key] = this.data[key];
      }
    }
    _log("[log]gob.save()", lsData);
    lsObj.setItem(this._lsKey, lsData);
  }
}

// 初始化
const gob = new Gob().init();
gob.load();

export {
  gob,
  lsObj,
};
