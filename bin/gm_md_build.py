""" 读取和处理脚本文件 """

import os
import re
import datetime

from bin.base import fnGetFilesInDir2, fnLog

# 用于构建 assets/gm_md 文件夹下的 md 文件
md_head_tpl = """---
title: {title}
description: {description}
pubDate: {pubDate}
updateDate: {updateDate}
# heroImage: {heroImage}
gitUrl: {gitUrl}
gitUrlRaw: {gitUrlRaw}
cdnUrl: {cdnUrl}
docUrl: {docUrl}
tags: []
---\n"""

# 用于构建 packages/xxx 文件夹下的 README.md 文件
pkg_doc_tpl = """## {title}

{description}

### 当前脚本工程源码

userscript/packages/{name} at main · wdssmq/userscript：

[https://github.com/wdssmq/userscript/tree/main/packages/{name}](https://github.com/wdssmq/userscript/tree/main/packages/{name} "userscript/packages/{name} at main · wdssmq/userscript")

### 安装

GitHub: [点击安装]({gitUrlRaw} "点击安装 {title} - GitHub") 「[在线查看]({gitUrl} "在线查看 dist 源码")」

CDN: [点击安装]({cdnUrl} "点击安装 {title} - CDN") 「[更新缓存]({purgeUrl} "点击更新 CDN 缓存")」

### 关于

博客：[https://www.wdssmq.com](https://www.wdssmq.com "沉冰浮水")

爱发电： [https://afdian.com/@wdssmq](https://afdian.com/@wdssmq "沉冰浮水正在创作和 z-blog 相关或无关的各种有用或没用的代码 | 爱发电")

更多脚本： [https://github.com/wdssmq/userscript](https://github.com/wdssmq/userscript "wdssmq/userscript: 各种猴子脚本")

GreasyFork： [https://greasyfork.org/zh-CN/users/6865](https://greasyfork.org/zh-CN/users/6865 "wdssmq - GreasyFork")

交流反馈：<a target="_blank" href="https://qm.qq.com/cgi-bin/qm/qr?k=aUWw0GnzE6lREYxdHVPAIfJBPKPvnPN6&jump_from=webapi&authKey=CPLHemFTAHa9YuDOOXHE1DDqTUhlsJehvEQ4HmBpx4ihtBc9i8OGJCsnR3fc+cJ1">189574683</a>


"""


def gm_read_js(file_js, file_name):
    """读取脚本文件"""
    with open(file_js, "r", encoding="UTF-8") as f:
        con_js = f.read()
    name = re.findall(r"@name\s+([^\n]+)", con_js)
    desc = re.findall(r"@description\s+([^\n]+)", con_js)
    # name[0] = re.sub(r"(\[|\])", r"\\\1", name[0])
    gm_info = {
        "name": name[0],
        "desc": desc[0],
        "file_gm": file_name.replace(".user.js", ""),
        "file_full": file_name,
        "body": "",
    }
    return gm_info


def gm_read_doc(file_doc):
    """读取脚本介绍文件"""
    with open(file_doc, "r", encoding="UTF-8") as f:
        con_md = f.read()
    return con_md


def gm_write_doc(file_doc, con_md):
    """写入脚本介绍文件"""
    with open(file_doc, "w", encoding="UTF-8") as f:
        f.write(con_md)


def gm_build_link(branch, gm_info):
    """拼接脚本链接"""
    file_full = gm_info["file_full"]
    git_url = f"https://github.com/wdssmq/userscript/blob/{branch}/dist/{file_full}"
    git_url_raw = f"{git_url}?raw=true"
    cnd_url = f"https://cdn.jsdelivr.net/gh/wdssmq/userscript@{branch}/dist/{file_full}"
    purge_url = f"https://purge.jsdelivr.net/gh/wdssmq/userscript@{branch}/dist/{file_full}"
    doc_url = f"https://github.com/wdssmq/userscript/tree/main/packages/{gm_info['file_gm']}#readme"
    return {
        "gitUrl": git_url,
        "gitUrlRaw": git_url_raw,
        "cdnUrl": cnd_url,
        "purgeUrl": purge_url,
        "docUrl": doc_url,
    }


# 获取当前时间
now_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def gm_md_time(gm_md_file):
    """设置发布/更新时间"""
    pub_time = now_time
    up_time = now_time
    if os.path.exists(gm_md_file):
        with open(gm_md_file, "r", encoding="UTF-8") as f:
            con_md = f.read()
        pub_time = re.findall(r"pubDate: ([^\n]+)", con_md)[0]
    return (pub_time, up_time)


def gm_dist_changed_check(file_name, changed=[]):
    """检查文件是否发生修改"""
    bol_changed = False
    for file_path in changed:
        tmp_file_name = file_name.replace(".user.js", "/")
        # fnLog(f"检查：{tmp_file_name} in {file_path}")
        if tmp_file_name in file_path:
            bol_changed = True
            break
    return bol_changed


def gm_read_dist(path, changed=[]):
    """读取脚本文件夹"""
    gm_info_list = []
    fnLog(f"发生修改的文件：{changed}")
    if not changed:
        return gm_info_list
    for file_name in fnGetFilesInDir2(path, ".js"):
        file_path = os.path.join(path, file_name)
        # 判断是否发生修改
        if not gm_dist_changed_check(file_name, changed):
            fnLog(f"跳过：{file_path}")
            continue
        else:
            fnLog(f"读取：{file_path} ←←←←")
        gm_info_list.append(gm_read_js(file_path, file_name))
    # fnLog(gm_info_list)
    return gm_info_list


def gm_md_build(gob_config):
    """生成脚本介绍文件"""
    gm_info_list = gm_read_dist(gob_config["gm_dist_path"], gob_config["changed"])
    for gm_info in gm_info_list:
        # GM_脚本 链接拼接
        gm_link_info = gm_build_link("main", gm_info)
        # 拼接 README.md 文件路径
        gm_doc_path = os.path.join(
            gob_config["gm_src_path"], gm_info["file_gm"], "README.md"
        )
        gm_doc_con = pkg_doc_tpl.format(
            title=gm_info["name"],
            description=gm_info["desc"],
            name=gm_info["file_gm"],
            **gm_link_info,
        )
        # fnLog(gm_doc_con)
        gm_write_doc(gm_doc_path, gm_doc_con)
        # ---------------
        # 拼接 md 文件路径
        gm_md_file = os.path.join(gob_config["gm_md_path"], gm_info["file_gm"] + ".md")
        # 获取发布/更新时间
        (pub_time, up_time) = gm_md_time(gm_md_file)
        # fnLog(pub_time)
        # fnLog(up_time)

        # 拼接 md 文件内容
        gm_md = md_head_tpl.format(
            title=gm_info["name"],
            description=gm_info["desc"],
            pubDate=pub_time,
            updateDate=up_time,
            heroImage='""',
            **gm_link_info,
        )
        gm_md += "\n"
        gm_md += gm_info["body"]
        with open(gm_md_file, "w", encoding="UTF-8") as f:
            f.write(gm_md)
