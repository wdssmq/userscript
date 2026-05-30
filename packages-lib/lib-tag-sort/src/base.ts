// localStorage 封装
const lsObj = {
  setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem(key: string, def: any = "") {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return def;
  },
};

export { lsObj };
