import { _log } from "./_base";

const _config = {
  data: {},
  dataDef: {
    pickRules: [
      {
        name: "Kirara Fantasia",
        regex: "Baha\\s",
      },
      {
        name: "漫猫字幕组&爱恋字幕组",
        regex: "1080p.+简中",
      },
      {
        name: "华盟字幕社&千夏字幕组",
        regex: "简体",
      },
      {
        name: "北宇治字幕组",
        regex: "简日内嵌",
      }
    ]
  },
  optToggle: (opt, ret = false) => {
  },
  menuCommand: () => {
  },
  load: () => {
    _config.data = GM_getValue("config", _config.dataDef);
    _config.menuCommand();
  },
};

_config.load();

export default _config;
