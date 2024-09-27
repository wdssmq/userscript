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

## up empty_def

```bash
PROJECT_SCRIPT=empty_def
rm -rf ${PROJECT_SCRIPT}
# 下载初始模板
wget https://ghproxy.com/https://github.com/wdssmq/rollup-plugin-monkey/releases/latest/download/script_def.tar.gz
tar -xzvf script_def.tar.gz
mv script_def ${PROJECT_SCRIPT}
# cd ${PROJECT_SCRIPT}
sed -i "s/\"script_def\"/\"${PROJECT_SCRIPT}\"/" ${PROJECT_SCRIPT}/src/__info.js
eslint empty_def/**/*.js empty_def/*.mjs --fix
rm -rf script_def.tar.gz
```

## postcss

```bash
cnpm i postcss rollup-plugin-postcss -d
# less sass stylus 按需安装对应的依赖
```

```js
import postcss from "rollup-plugin-postcss";

[prodConfig, devConfig].forEach((config) => {
  config.plugins.push(postcss());
});

```
