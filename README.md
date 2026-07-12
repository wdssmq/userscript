## 概述

各种猴子脚本

## 关于

博客：[https://www.wdssmq.com](https://www.wdssmq.com "沉冰浮水")

爱发电： [https://afdian.com/@wdssmq](https://afdian.com/@wdssmq "沉冰浮水正在创作和 z-blog 相关或无关的各种有用或没用的代码 | 爱发电")

更多脚本： [https://github.com/wdssmq/userscript](https://github.com/wdssmq/userscript "wdssmq/userscript: 各种猴子脚本")

GreasyFork： [https://greasyfork.org/zh-CN/users/6865](https://greasyfork.org/zh-CN/users/6865 "wdssmq - GreasyFork")

交流反馈：<a target="_blank" href="https://qm.qq.com/cgi-bin/qm/qr?k=aUWw0GnzE6lREYxdHVPAIfJBPKPvnPN6&jump_from=webapi&authKey=CPLHemFTAHa9YuDOOXHE1DDqTUhlsJehvEQ4HmBpx4ihtBc9i8OGJCsnR3fc+cJ1">189574683</a>

> wdssmq/rollup-plugin-monkey: 使用 rollup 开发「GM\_脚本」：
>
> [https://github.com/wdssmq/rollup-plugin-monkey](https://github.com/wdssmq/rollup-plugin-monkey "wdssmq/rollup-plugin-monkey: 使用 rollup 开发「GM\_脚本」")

<!--
## 用于复制

```js
// @null         ----------------------------
// @contributionURL    https://github.com/wdssmq#%E4%BA%8C%E7%BB%B4%E7%A0%81
// @contributionAmount 5.93
// @null         ----------------------------
// @link         https://github.com/wdssmq/userscript
// @link         https://afdian.com/@wdssmq
// @link         https://greasyfork.org/zh-CN/users/6865-wdssmq
// @null         ----------------------------
```
-->

## 已有项目

占位

## postcss

```bash
pnpm i postcss rollup-plugin-postcss -D
# less sass stylus 按需安装对应的依赖

```

```js
import postcss from "rollup-plugin-postcss";

[prodConfig, devConfig].forEach((config) => {
  config.plugins.push(postcss());
});

```
