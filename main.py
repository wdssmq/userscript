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
}


# 主函数定义
def fnMain():
    """主函数"""
    print("Hello World!")
    # print(gob_config)
    gm_md_build(gob_config)


# 调用主函数
fnMain()
