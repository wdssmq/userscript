## 前置

博客：[https://www.wdssmq.com](https://www.wdssmq.com "沉冰浮水")

爱发电： [https://afdian.net/@wdssmq](https://afdian.net/@wdssmq "沉冰浮水正在创作和 z-blog 相关或无关的各种有用或没用的代码 | 爱发电")

更多脚本： [https://github.com/wdssmq/userscript](https://github.com/wdssmq/userscript "wdssmq/userscript: 各种猴子脚本")

QQ 群：[189574683](//jq.qq.com/?_wv=1027&k=jijevXi0 "我的咸鱼心") [![QQ群](https://pub.idqqimg.com/wpa/images/group.png "QQ群")](//jq.qq.com/?_wv=1027&k=jijevXi0 "我的咸鱼心")

> wdssmq/rollup-plugin-monkey: 使用 rollup 开发「GM\_脚本」：
>
> [https://github.com/wdssmq/rollup-plugin-monkey](https://github.com/wdssmq/rollup-plugin-monkey "wdssmq/rollup-plugin-monkey: 使用 rollup 开发「GM\_脚本」")


## qBittorrent 管理脚本

为 qBittrorrent 的 WebUI 增加批量替换 Tracker 的功能；


### 开发时 CSP 限制解除

字段名：

> content-security-policy

原始值：

> default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; object-src 'none'; form-action 'self'; frame-ancestors 'self';

更新为：

> default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self' 'unsafe-inline' localhost:3000; object-src 'none'; form-action 'self'; frame-ancestors 'self'; connect-src 'self' ws://localhost:3000;

----

> 「折腾」使用浏览器自带功能修改网站「响应标头」\_电脑网络\_沉冰浮水：
>
> [https://www.wdssmq.com/post/20120902324.html](https://www.wdssmq.com/post/20120902324.html "「折腾」使用浏览器自带功能修改网站「响应标头」\_电脑网络\_沉冰浮水")

### 其他

> The Content-Security-Policy directive name 'content-security-policy:' contains one or more invalid characters. Only ASCII alphanumeric characters or dashes '-' are allowed in directive names.

如果遇到上边报错，那是因为把 `content-security-policy:` 在字段值也写了一遍，去掉就好了；「- -」
