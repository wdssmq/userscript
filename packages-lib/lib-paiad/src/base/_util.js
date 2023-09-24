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


export { lsObj };
