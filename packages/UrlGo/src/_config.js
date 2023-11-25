import { _log } from "./_base";

const _config = {
  data: {},
  dataDef: {
    倒计时: 5,
  },
  menuCommand: () => {
    const _this = _config;
    for (const key in _this.data) {
      if (Object.hasOwnProperty.call(_this.data, key)) {
        GM_registerMenuCommand(`${key}：${_this.data[key]}`, () => {
          const newValue = prompt(`请输入新的${key}值`, _this.data[key]);
          if (newValue !== null) {
            _this.data[key] = newValue;
            GM_setValue("config", _this.data);
            _log(`已将${key}值修改为：${newValue}`);
          }
        });
      }
    }
  },
  load: () => {
    const _this = _config;
    _config.data = GM_getValue("config", _this.dataDef);
    _config.menuCommand();
  },
};

_config.load();

export default _config;
