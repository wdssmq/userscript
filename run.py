import os
import re

# Base Functions


def fnEmpty(arg):
    return 1
# 什么也不做


def fnLog(msg="", tip=None):
    if not tip is None:
        tip = " ← %s" % tip
    else:
        tip = ""
    if not any(msg):
        print("")
    else:
        print("_%s%s" % (msg, tip))
# 输出信息


def fnBug(msg, tip):
    fnLog("[debug]%s" % msg, tip)
# debug输出


def fnErr(msg, tip=None):
    fnLog("_[err]%s" % msg, tip)
# 错误信息


def fnGetDirsInDir(path):
    # print(path)
    return [(os.path.join(path, x), x) for x in os.listdir(path) if os.path.isdir(x)]
# 获取子文件夹


def fnGetFilesInDir(path):
    # print(path)
    return [os.path.join(path, x) for x in os.listdir(path) if not os.path.isdir(x)]
# 获取文件夹中的文件


def fnGetFilesInDir2(path, ext):
    return [(os.path.join(path, x), x) for x in os.listdir(path) if not os.path.isdir(x) and os.path.splitext(x)[1] == ext]
# 获取指定后缀的文件
# Base Functions


def fnReadJS(filePath):
    with open(filePath, 'r', encoding='UTF-8') as f:
        read_js = f.read()
    name = re.findall(r'@name\s+([^\n]+)', read_js)
    desc = re.findall(r'@description\s+([^\n]+)', read_js)
    name[0] = re.sub(r'(\[|\])', r'\\\1', name[0])
    return (name[0], desc[0])
# 正则匹配文件内容


def fnGenScriptInfo(name, desc, dir, file):
    url = "https://github.com/wdssmq/userscript/blob/master/%s/%s" % (
        dir, file)
    # https://cdn.jsdelivr.net/gh/wdssmq/userscript/other/typecho.in.user.js
    # https://cdn.jsdelivr.net/gh/wdssmq/userscript@master/other/typecho.in.user.js 1
    cdn = "https://cdn.jsdelivr.net/gh/wdssmq/userscript@master/%s/%s" % (
        dir, file)
    return "name：%s\n\ndesc：%s\n\nurl：%s\n\ncdn：%s\n\n" % (name, desc, url, cdn)
# 拼接脚本信息用于 ReadMe


def fnUpdateReadMe(newInfo):
    newInfo = "---start---\n\n" + newInfo + "---end---"
    # 获取README.md内容
    with open(_readme_file, 'r', encoding='utf-8') as f:
        readme_md_content = f.read()
    new_readme_md_content = re.sub(
        r'---start---(.|\n)*?---end---', newInfo, readme_md_content, 1)
    with open(_readme_file, 'w', encoding='utf-8', newline="\n") as f:
        f.write(new_readme_md_content)
    fnLog("更新ReadMe成功")
    return True
# 更新 ReadMe


# 全局变量
# README.md
_readme_file = os.path.join(os.getcwd(), "README.md")


def fnMain():
    baseDir = os.getcwd()
    print("当前工作目录为 %s" % baseDir)
    scriptDirs = fnGetDirsInDir(baseDir)
    rltInfo = ""
    for (dirPath, dirName) in scriptDirs:
        if dirName == "node_modules" or dirName == ".history":
            continue
        files = fnGetFilesInDir2(dirPath, ".js")
        for (f, n) in files:
            if ("user.js" not in n):
                fnLog("跳过 %s" % n)
                continue
            # else:
                # fnLog("正在处理 %s" % n)
            scripInfo = fnReadJS(f)
            rltInfo += fnGenScriptInfo(scripInfo[0], scripInfo[1], dirName, n)
            rltInfo += "--------\n\n"
    fnUpdateReadMe(rltInfo)
# 主函数


fnMain()
