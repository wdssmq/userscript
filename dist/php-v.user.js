// ==UserScript==
// @name         php-v
// @namespace    https://www.wdssmq.com/
// @version      1.0.0
// @author       沉冰浮水
// @description  获取符合要求的 PHP 版本信息
// @license      MIT
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.com/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
// @noframes
// @run-at       document-end
// @match        https://www.php.net/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

/* eslint-disable */

(function () {
  'use strict';

  const gm_name = "php-v";

  // -------------------------------------

  const _curUrl = () => window.location.href;

  // -------------------------------------

  const _log = (...args) => console.log(`[${gm_name}] |`, ...args);

  const monthMap = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  function parseReleaseDate(text) {
    const match = String(text || "").match(/Released:\s+(\d{2})\s+([A-Za-z]{3})\s+(\d{4})/);
    if (!match) {
      return null;
    }

    const [, day, mon, year] = match;
    const monthIndex = monthMap[mon];
    if (monthIndex === undefined) {
      return null;
    }

    return new Date(Number(year), monthIndex, Number(day));
  }

  function formatDate(date) {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseVersionNumbers(version) {
    return String(version || "")
      .match(/\d+/g)
      ?.map(Number) || [];
  }

  function getVersionGroupKey(version) {
    const nums = parseVersionNumbers(version);
    if (nums.length < 2) {
      return String(version || "");
    }
    return `${nums[0]}.${nums[1]}`;
  }

  function compareVersion(versionA, versionB) {
    const a = parseVersionNumbers(versionA);
    const b = parseVersionNumbers(versionB);
    const len = Math.max(a.length, b.length);

    for (let i = 0; i < len; i += 1) {
      const av = a[i] || 0;
      const bv = b[i] || 0;
      if (av !== bv) {
        return av - bv;
      }
    }

    return 0;
  }

  const def = {
    checkUrl: () => {
      const url = _curUrl();
      if (!url.endsWith("/releases/")) {
        return false;
      }
      return true;
    },

    getRecentReleaseDates: () => {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 10);

      const results = Array.from(document.querySelectorAll("h2")).flatMap((heading) => {
        const version = heading.textContent.trim();
        const list = heading.nextElementSibling;
        if (!list) {
          return [];
        }

        const releasedItem = Array.from(list.querySelectorAll("li")).find(item => item.textContent.includes("Released:"));
        if (!releasedItem) {
          return [];
        }

        const releasedDate = parseReleaseDate(releasedItem.textContent);
        if (!releasedDate || releasedDate < cutoff) {
          return [];
        }

        return [{
          version,
          released: formatDate(releasedDate),
        }];
      });

      const latestByMajorMinor = results.reduce((acc, item) => {
        const key = getVersionGroupKey(item.version);
        const existing = acc.get(key);

        if (!existing || compareVersion(item.version, existing.version) > 0) {
          acc.set(key, item);
        }

        return acc;
      }, new Map());

      const filteredResults = Array.from(latestByMajorMinor.values());

      _log("10 年内的 PHP 发布日期：");
      console.table(filteredResults);
      return filteredResults;
    },

    run: () => {
      if (!def.checkUrl()) {
        return [];
      }

      return def.getRecentReleaseDates();
    },
  };

  def.run();

})();
