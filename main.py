""" 项目入口文件 """
import os

from bin.base import fnLog
from bin.gm_md_build import gm_md_build

# 全局变量
gob_config = {
    # README.md
    "readme_file": os.path.join(os.getcwd(), "README.md"),
    # 脚本文件夹
    "gm_dist_path": os.path.join(os.getcwd(), "dist"),
    # 脚本介绍输出路径
    "gm_md_path": os.path.join(os.getcwd(), "site-astro", "src", "content", "gm_md"),
    # 脚本源码路径，用于读取 README.md
    "gm_src_path": os.path.join(os.getcwd(), "packages"),
    # 发生修改的文件列表
    "changed": [],
}

def fnInit():
    """初始化"""
    # 读取环境变量
    try:
        if os.environ["GIT_CHANGED_FILES"]:
            # 字符串转列表，去除首尾空格，空格分割
            gob_config["changed"] = os.environ["GIT_CHANGED_FILES"].strip().split(" ")
    except KeyError:
        # 未设置环境变量
        pass

    # 遍历修改文件列表，拼接绝对路径
    for i in range(len(gob_config["changed"])):
        gob_config["changed"][i] = os.path.join(os.getcwd(), gob_config["changed"][i])



# 主函数定义
def fnMain():
    """主函数"""
    gm_md_build(gob_config)

# 调用初始化函数
fnInit()
# 调用主函数
fnMain()
