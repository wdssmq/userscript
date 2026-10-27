// 时间处理：统一格式为 Y-m-d H:i:s，并支持各类日期文本的解析

// 脚本加载时刻，用于默认值
const timeDate = new Date();

const DAY_MS = 24 * 60 * 60 * 1000;

const _curDate = () => new Date();
const _curTimestamp = () => Math.floor(_curDate().getTime() / 1000);

// -------------------------------------

// 完整日期：2025年12月18日 / 2025-12-18，紧随其后的时分秒另行匹配
const RE_DATE_FULL = /(\d{4})[年./-](\d{1,2})[月./-](\d{1,2})日?/;
// 日期之后紧接的时分秒： 12:30 / 12:30:45
const RE_DATE_TIME = /^\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/;
// 缺年份：10月1日 / 10-01，后者前后需为空白或边界，以免命中「1.2万」之类
const RE_DATE_MD = /(\d{1,2})\s*月\s*(\d{1,2})\s*日?|(?:^|\s)(\d{1,2})-(\d{1,2})(?=\s|$)/;

// -------------------------------------

// 相对时间单位 → 毫秒，解析时按 key 匹配，可自行扩展或整体覆盖
const UNIT_MS = {
  秒: 1000,
  分钟: 60 * 1000,
  半小时: 30 * 60 * 1000,
  小时: 60 * 60 * 1000,
  天: DAY_MS,
  周: 7 * DAY_MS,
  个月: 30 * DAY_MS,
  年: 365 * DAY_MS,
};

// 相对日期 → 天数差，同样可扩展或覆盖
const DAY_DIFF = {
  今天: 0,
  昨天: 1,
  前天: 2,
};

// 无间隔的相对时间词，统一取当前时间
const REL_NOW = ["刚刚"];

// -------------------------------------

// 构造日期，时分秒默认补 0
function _mkDate(y, m, d, h = 0, mi = 0, s = 0) {
  return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(mi), Number(s));
}

// 统一时间格式：Y-m-d H:i:s；withTime = false 时输出 Y-m-d
function _fmtDate(date = _curDate(), withTime = true) {
  const dt = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(dt.getTime())) {
    return "";
  }
  const pad = n => String(n).padStart(2, "0");
  const str = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  return withTime ? `${str} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}` : str;
}

// 只输出日期部分：Y-m-d
function _getDateStr(date = timeDate) {
  return _fmtDate(date, false);
}

// -------------------------------------

// 正则分支按词长度倒序，避免短词抢先命中，如「个月」与「月」
const RE_CACHE = new Map();
const escapeReg = str => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function unitPattern(words = []) {
  return words
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeReg)
    .join("|");
}

// 由 UNIT_MS 与 REL_NOW 构造相对时间正则：(数字)?(单位)前 | 即时词
function reRel(units = {}, nowWords = []) {
  const srcUnit = Object.keys(units);
  const key = `rel|${srcUnit.join("|")}|${nowWords.join("|")}`;
  if (!RE_CACHE.has(key)) {
    const srcNow = nowWords.length > 0 ? `|(${unitPattern(nowWords)})` : "";
    RE_CACHE.set(key, new RegExp(`(?:(\\d+)\\s*)?(${unitPattern(srcUnit)})前${srcNow}`));
  }
  return RE_CACHE.get(key);
}

// 由 DAY_DIFF 构造相对日期正则
function reDay(dayDiff = {}) {
  const srcDay = Object.keys(dayDiff);
  const key = `day|${srcDay.join("|")}`;
  if (!RE_CACHE.has(key)) {
    RE_CACHE.set(key, new RegExp(`(${unitPattern(srcDay)})`));
  }
  return RE_CACHE.get(key);
}

// 取数据键对应的值，避开原型链
function pickVal(obj = {}, key = "") {
  return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
}

// 解析日期文本，输出 Y-m-d H:i:s，解析失败返回空字符串
// 支持：完整日期（可带时分秒）、缺年份、相对时间、相对日期
// opt：{ baseDate, units, dayDiff, nowWords }，后三者用于覆盖或扩展词表
function _parseDate(str = "", opt = {}) {
  const text = String(str || "").trim();
  if (!text) {
    return "";
  }
  const units = opt.units || UNIT_MS;
  const dayDiff = opt.dayDiff || DAY_DIFF;
  const nowWords = opt.nowWords || REL_NOW;
  const tmp = opt.baseDate instanceof Date ? opt.baseDate : new Date(opt.baseDate || Date.now());
  const cur = Number.isNaN(tmp.getTime()) ? _curDate() : tmp;
  // 完整年月日；其后紧接的时分秒一并保留
  const oFull = text.match(RE_DATE_FULL);
  if (oFull) {
    const strTime = text.slice(oFull.index + oFull[0].length);
    const oTime = strTime.match(RE_DATE_TIME);
    if (oTime) {
      return _fmtDate(_mkDate(oFull[1], oFull[2], oFull[3], oTime[1], oTime[2], oTime[3] || 0));
    }
    return _fmtDate(_mkDate(oFull[1], oFull[2], oFull[3]));
  }
  // 相对时间：3小时前 / 半小时前 / 刚刚
  const oRel = text.match(reRel(units, nowWords));
  if (oRel) {
    // 「刚刚」一类取当前时间
    if (oRel[3]) {
      return _fmtDate(cur);
    }
    const ms = pickVal(units, oRel[2]) || 0;
    // 未带数字的表述（半小时）按 1 倍计
    const num = oRel[1] ? Number(oRel[1]) : 1;
    if (ms > 0) {
      return _fmtDate(new Date(cur.getTime() - num * ms));
    }
  }
  // 相对日期：昨天
  const oDay = text.match(reDay(dayDiff));
  if (oDay) {
    const diff = pickVal(dayDiff, oDay[1]);
    if (typeof diff === "number") {
      return _fmtDate(_mkDate(cur.getFullYear(), cur.getMonth() + 1, cur.getDate() - diff));
    }
  }
  // 缺年份：10月1日
  const oMd = text.match(RE_DATE_MD);
  if (oMd) {
    const m = oMd[1] || oMd[3];
    const d = oMd[2] || oMd[4];
    if (m && d) {
      const dt = _mkDate(cur.getFullYear(), m, d);
      // 晚于「明天」的日期按去年处理
      if (dt.getTime() - cur.getTime() > DAY_MS) {
        dt.setFullYear(cur.getFullYear() - 1);
      }
      return _fmtDate(dt);
    }
  }
  return "";
}

// -------------------------------------

export {
  _curDate,
  _curTimestamp,
  _fmtDate,
  _getDateStr,
  _mkDate,
  _parseDate,
  DAY_DIFF,
  DAY_MS,
  REL_NOW,
  timeDate,
  UNIT_MS,
};
