# lib-paid-or-ad

一个特殊的弹出层封装；

## 提取 bulma 文件

```bash
cd ~/tmp
# 下载最新的 bulma 源码
version="0.9.4"
wget "https://github.com/jgthms/bulma/releases/download/${version}/bulma-${version}.zip"

# 解压
unzip "bulma-${version}.zip"

```

```bash
cd ~/tmp/bulma

path=$(pwd)
output_file="${path}/_all.sass"
echo "@charset \"utf-8\"" > $output_file

# 遍历 sass 下的子目录
for dir in $(ls -d sass/*/)
do
    echo $dir
    # 基于拷贝文件操作
    file="${dir}_all_bak.sass"
    rm -rf $file
    cp "${dir}_all.sass" $file
    # 删除 @charset "utf-8" 行
    sed -i '/@charset "utf-8"/d' $file
    # @import 路径替换，新路径为 "${dir}xxx"
    sed -i "s#@import \"#@import \"${dir}#g" $file
    # 追加到 output_file
    cat $file >> $output_file
    # 插入空行
    echo "" >> $output_file
done

```
