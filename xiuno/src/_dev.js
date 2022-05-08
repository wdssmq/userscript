// _devView.js | 开发者申请查看
import { $, curHref, lsObj, _log, fnGetRequest, fnFormatTime } from './_base.js';
(() => {
  // CDN 地址替换
  function fnGetCDNUrl(url) {
    const arrMap = [
      ["https://github.com/", "https://cdn.jsdelivr.net/gh/"],
      ["/blob/", "@"]
    ]
    let cdnUrl = url;
    arrMap.forEach(line => {
      cdnUrl = cdnUrl.replace(line[0], line[1]);
    });
    return cdnUrl;
  }

  // time 2 hour
  function fnTime2Hour(time = null) {
    if (!time) {
      time = new Date();
    }
    // 时间戳
    const timeStamp = time.getTime();
    return Math.floor(timeStamp / 1000 / 60 / 60);
  }

  // YML 地址列表
  const useCDN = GM_getValue("useCDN", false);
  let ymlList = GM_getValue("useCDN", ["2021H2", "2022H1"]);
  ymlList = ymlList.map(yml => {
    let url = `https://raw.githubusercontent.com/wdssmq/ReviewLog/main/data/${yml}.yml`;
    if (useCDN) {
      url = fnGetCDNUrl(url);
    }
    return url;
  });

  // 模板函数
  function fnStrtr(
    str,
    obj,
    callback = (str) => {
      return str;
    }
  ) {
    let rltStr = str;
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const reg = new RegExp(`#${key}#`, "g");
        rltStr = rltStr.replace(reg, value);
      }
    }
    return callback(rltStr);
  }

  // 数据读取封装
  const gobDev = {
    data: {
      lstLogs: [],
      lstCheck: null
    },
    init: function (ymlList) {
      this.data = lsObj.getItem("gobDev", this.data);
      _log("gobDev init", this.data);
      this.ymlList = ymlList;
    },
    checkUrl: function (url) {
      let rlt = null;
      this.data.lstLogs.forEach(log => {
        if (log.url.indexOf(url) > -1) {
          _log("checkUrl", url, log.url);
          rlt = log;
        }
      });
      return rlt;
    },
    save: function () {
      lsObj.setItem("gobDev", this.data);
    },
    update: function () {
      const curHour = fnTime2Hour();
      if (this.data.lstCheck === curHour && this.data.lstLogs.length > 0) {
        return;
      }
      this.data.lstLogs = [];
      this.data.lstCheck = curHour;
      this.ajax();
    },
    ajax: function () {
      const self = this;
      this.ymlList.forEach(yml => {
        fnGetRequest(yml, (responseText, url) => {
          const ymlObj = jsyaml.load(responseText, "utf8");
          const curLogs = self.data.lstLogs;
          self.data.lstLogs = curLogs.concat(ymlObj);
          self.save();
        });
      });
    }
  }
  gobDev.init(ymlList);
  gobDev.update();

  // 根据 log 数据设置状态徽章
  const _setBadge = function (log, $item = null, act = "after") {
    // console.log("log", log);
    let $badge = null;
    if (log && log.status === "通过") {
      $badge = $(`<span class="badge badge-success">${log.status}</span>`);
    } else if (log) {
      $badge = $(`<span class="badge badge-primary">${log.status}</span>`);
    } else {
      $badge = $(`<span class="badge badge-warning">未记录</span>`);
    }
    if (act === "after") {
      $item.after($badge);
    } else {
      $item.append($badge);
    }
  }

  // 标题列表
  const $titleList = $("li.media .subject a");
  $titleList.each(function () {
    const $this = $(this);
    const href = $this.attr("href");
    const title = $this.text();
    if (title.indexOf("申请开发者") === -1) {
      return;
    }
    const log = gobDev.checkUrl(href);
    _setBadge(log, $this);
  });

  // 博文内页
  const $h4 = $(".media-body h4");
  let title = $h4.text().trim();
  if (title.indexOf("申请开发者") === -1) {
    return;
  }
  const log = gobDev.checkUrl(curHref);
  _setBadge(log, $h4, "append");

  // 初始化
  $("div.message").each(function () {
    if ($(this).attr("isfirst") == 1) {
      $(this).prepend(
        `<blockquote class="blockquote"><pre class="pre-yml"></pre></blockquote>`
      );
      $(".pre-yml").text(`标题格式错误`);
    }
  });

  // 标题内容解析
  title = title.replace(/\[|【/g, "「").replace(/\]|】/g, "」");
  const objMatch = title.match(/「([^」]+)」「(theme|plugin)」/);
  _log("objMatch", objMatch);
  if (!objMatch) {
    return;
  }

  // YML 模板
  const tplYML = `
- id: #id#
  type: #type#
  status: 进行中
  rating:
  url: #url#
  date:
    - #date#
  reviewers:
    - null
`;
  // 构建 YML
  const styYML = fnStrtr(
    tplYML,
    {
      id: objMatch[1],
      type: objMatch[2],
      url: curHref,
      date: fnFormatTime(),
    },
    (str) => {
      str = str.replace(/\n/g, "\\|");
      // str = str.replace(/\s{6}/g, "_2__2_");
      // str = str.replace(/\s{4}/g, "_2_");
      // str = str.replace(/_2_/g, "  ");
      str = str.replace(/\\\|/g, "\n");
      const objMatch = title.match(/(通过|拒绝)/);
      if (objMatch) {
        str = str.replace(/status: 进行中/, `status: ${objMatch[1]}`);
      }
      return str;
    }
  );
  // 插入 YML
  $(".pre-yml").text(`${styYML}`);
})();
