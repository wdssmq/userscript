import { lsObj } from "./base";

export type Item = string;

export const core = {
  TEXT_CACHE_KEY: "lib-tag-sort:text",
  DEFAULT_TEXT: "苹果, 香蕉, 橘子",

  // 输入文本的规范化处理
  normalizeInputText(value: string) {
    return value.replace(/[，+|]/g, ",");
  },

  // 将输入文本解析为条目列表
  parseItems(value: string) {
    return core
      .normalizeInputText(value)
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);
  },

  // 将条目列表序列化为文本
  serializeItems(items: Item[]) {
    return items
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .join(", ");
  },

  // 从本地存储加载文本
  loadText() {
    const cached = lsObj.getItem(core.TEXT_CACHE_KEY, core.DEFAULT_TEXT);
    return typeof cached === "string" ? cached : core.DEFAULT_TEXT;
  },

  // 将文本保存到本地存储
  saveText(value: string) {
    lsObj.setItem(core.TEXT_CACHE_KEY, value);
  },

  // 从本地存储加载条目列表
  loadItems() {
    return core.parseItems(core.loadText());
  },

  // 移动条目位置
  moveItem(items: Item[], fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= items.length)
      return items;
    if (toIndex < 0)
      toIndex = 0;
    if (toIndex > items.length - 1)
      toIndex = items.length - 1;
    if (fromIndex === toIndex)
      return items;

    const next = items.slice();
    const [moved] = next.splice(fromIndex, 1);
    if (toIndex > fromIndex) {
      next.splice(toIndex - 1, 0, moved);
    }
    else {
      next.splice(toIndex + 1, 0, moved);
    }
    return next;
  },

  // 更新条目内容
  updateItem(items: Item[], index: number, value: string) {
    if (index < 0 || index >= items.length)
      return items;

    const next = items.slice();
    const text = value.trim();
    if (text.length === 0) {
      next.splice(index, 1);
      return next;
    }

    next[index] = text;
    return next;
  },

  // 删除条目
  removeItem(items: Item[], index: number) {
    if (index < 0 || index >= items.length)
      return items;
    return items.toSpliced(index, 1);
  },
};
