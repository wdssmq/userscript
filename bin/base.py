""" 通用函数封装 """
import os
import time

# pylint: disable=invalid-name

def fnEmpty(arg):
    """ 占位空函数，用来应对 unused-variable """
    # 返回 arg 的值
    return arg
# 占位空函数，用来应对 unused-variable


def fnLog(msg="", tip=None, log_type=""):
    """ 输出信息 """
    if not tip is None:
        tip = f" ← {tip}"
    else:
        tip = ""
    if isinstance(msg, list):
        rlt = ""
        for x in msg:
            if not any(rlt):
                rlt += str(x)
            else:
                rlt = rlt + "，" + str(x)
        msg = rlt
    if isinstance(msg, int):
        msg = str(msg)
    if not any(msg) and not any(tip):
        print("")
    else:
        print(f"_{log_type}{msg}{tip}")
# 输出信息


def fnBug(msg, tip=None, debug=True):
    """ 调试信息输出 """
    if debug:
        fnLog(msg, tip, "[debug]")
# 调试信息输出


def fnErr(msg, tip=None):
    """ 错误信息 """
    fnLog(msg, tip, "_[err]")
# 错误信息

def fnGetTimeStr(time_stamp):
    """ 时间戳转换 """
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time_stamp))
# 时间戳转换

def fnGetDirsInDir(path):
    """ 获取子文件夹 """
    return [x for x in os.listdir(path) if os.path.isdir(x)]
# 获取子文件夹


def fnGetFilesInDir(path):
    """ 获取文件夹中的文件 """
    return [x for x in os.listdir(path) if not os.path.isdir(x)]
# 获取文件夹中的文件


def fnGetFilesInDir2(path, ext):
    """ 获取指定后缀的文件 """
    return [x for x in os.listdir(path) if not os.path.isdir(x) and os.path.splitext(x)[1] == ext]
# 获取指定后缀的文件


def fnGetFileTime(file):
    """ 获取文件时间 """
    mtime = os.stat(file).st_mtime  # 文件的修改时间
    ctime = os.stat(file).st_ctime  # 文件的创建时间
    return (int(mtime), int(ctime))
# 获取文件时间
