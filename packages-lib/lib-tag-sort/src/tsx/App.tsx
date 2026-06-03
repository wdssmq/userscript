import type { Component, JSX } from "solid-js";
import { createSignal, createMemo, For } from "solid-js";

import { core } from "../core";

type RenderEntry =
  | {
    kind: "item";
    index: number;
    value: string;
  }
  | {
    kind: "placeholder";
  };

type ItemEntry = Extract<RenderEntry, { kind: "item" }>;

// 计算拖动时的插入位置
function computeInsertionIndex(fromIndex: number, targetIndex: number, before: boolean) {
  if (before) {
    return fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
  }

  return fromIndex < targetIndex ? targetIndex : targetIndex + 1;
}

// 构建渲染列表，包含占位符
function buildRenderEntries(items: string[], draggingIndex: number | null, dropIndex: number | null, editingIndex: number | null) {
  if (editingIndex !== null || draggingIndex === null || dropIndex === null || items.length === 0 || draggingIndex === dropIndex) {
    return items.map((value, index) => ({
      kind: "item" as const,
      index,
      value,
    }));
  }

  const entries: RenderEntry[] = [];
  const insertionIndex = Math.max(0, Math.min(dropIndex, items.length - 1));
  let reducedIndex = 0;

  items.forEach((value, index) => {
    if (index === draggingIndex)
      return;

    if (reducedIndex === insertionIndex) {
      entries.push({ kind: "placeholder" });
    }

    entries.push({
      kind: "item",
      index,
      value,
    });
    reducedIndex += 1;
  });

  if (reducedIndex === insertionIndex) {
    entries.push({ kind: "placeholder" });
  }

  return entries;
}

// 在指定索引插入条目
function insertAtIndex(items: string[], fromIndex: number, insertionIndex: number) {
  if (fromIndex < 0 || fromIndex >= items.length)
    return items;

  const next = items.filter((_, index) => index !== fromIndex);
  const targetIndex = Math.max(0, Math.min(insertionIndex, next.length));
  next.splice(targetIndex, 0, items[fromIndex]);
  return next;
}

// TSX 组件
const App: Component = () => {
  // 初始化 tag 条目
  const initialItems = core.loadItems();
  const [text, setText] = createSignal(core.serializeItems(initialItems));
  const [items, setItems] = createSignal(initialItems);
  // 正在拖动的条目索引
  const [draggingIndex, setDraggingIndex] = createSignal<number | null>(null);
  // 当前拖动目标索引
  const [dropIndex, setDropIndex] = createSignal<number | null>(null);
  // 编辑索引及草稿值
  const [editingIndex, setEditingIndex] = createSignal<number | null>(null);
  const [draftValue, setDraftValue] = createSignal("");


  // 文本变更时提交条目列表更新
  function commitItems(nextItems: string[]) {
    const nextText = core.serializeItems(nextItems);
    setItems(nextItems);
    setText(nextText);
    core.saveText(nextText);
    if (editingIndex() !== null && editingIndex()! >= nextItems.length) {
      setEditingIndex(null);
      setDraftValue("");
    }
  }

  // 清除拖动状态
  function clearDragState() {
    setDraggingIndex(null);
    setDropIndex(null);
  }

  // 处理文本输入事件
  const handleTextareaInput: JSX.EventHandler<HTMLTextAreaElement, InputEvent> = (event) => {
    const nextText = core.normalizeInputText(event.currentTarget.value);
    commitItems(core.parseItems(nextText));
  };

  // 处理条目编辑开始事件
  function handleStartEdit(index: number) {
    setEditingIndex(index);
    setDraftValue(items()[index] ?? "");
  }

  // 处理条目编辑保存事件
  function handleSaveEdit(index: number) {
    commitItems(core.updateItem(items(), index, draftValue()));
    setEditingIndex(null);
    setDraftValue("");
  }

  // 处理拖动开始事件
  function handleDragStart(idx: number, event: DragEvent) {
    // 如果正在编辑，禁止拖动
    if (editingIndex() !== null) {
      event.preventDefault();
      return;
    }
    // 设置正在拖动的条目索引
    setDraggingIndex(idx);
    setDropIndex(null);
    // 设置拖动效果
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  }

  // 处理拖动悬停事件
  function handleDragOver(index: number, event: DragEvent) {
    event.preventDefault();
    // 正在拖动的条目索引
    const sourceIndex = draggingIndex();
    if (sourceIndex === null || sourceIndex === index)
      return;

    // 计算插入位置
    const rect = (event.currentTarget as HTMLLIElement).getBoundingClientRect();
    const before = event.clientY < rect.top + rect.height / 2;
    const insertionIndex = computeInsertionIndex(sourceIndex, index, before);
    setDropIndex(insertionIndex);
  }

  // 处理拖动放下事件
  function handleDrop(event: DragEvent) {
    event.preventDefault();

    const sourceIndex = draggingIndex();
    const insertionIndex = dropIndex();
    if (sourceIndex === null || insertionIndex === null) {
      clearDragState();
      return;
    }

    commitItems(insertAtIndex(items(), sourceIndex, insertionIndex));
    clearDragState();
  }

  // 计算渲染列表，包含占位符
  const entries = createMemo(() => buildRenderEntries(items(), draggingIndex(), dropIndex(), editingIndex()));

  // 列表项内容组件，根据编辑状态切换显示文本或输入框
  const LiContent: Component<{ entry: ItemEntry }> = (contentProps) => {
    return (
      editingIndex() === contentProps.entry.index
        ? (
          <input
            type="text"
            value={draftValue()}
            onInput={event => setDraftValue(event.currentTarget.value)}
            onBlur={() => handleSaveEdit(contentProps.entry.index)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
              else if (event.key === "Escape") {
                setEditingIndex(null);
                setDraftValue("");
              }
            }}
            ref={(element) => {
              queueMicrotask(() => {
                element.focus();
              });
            }}
          />
        )
        : (
          <>
            <span>
              {contentProps.entry.value}
            </span>
            <div class="actions">
              <button
                type="button"
                class="delete-btn"
                onClick={() => {
                  const nextItems = core.removeItem(items(), contentProps.entry.index);
                  commitItems(nextItems);
                }}>
                删除
              </button>
            </div>
          </>
        )
    );
  };

  // 列表组件，渲染条目和占位符
  const List: Component = () => {
    return (
      <ul onDragOver={event => event.preventDefault()}>
        <For each={entries()}>
          {(entry) => (
            entry.kind === "placeholder"
              ? (
                <li
                  class="placeholder"
                  onDragOver={event => event.preventDefault()}
                  onDrop={handleDrop}
                />
              )
              : (
                <li
                  classList={{
                    "tag-item": true,
                    dragging: draggingIndex() === entry.index,
                    editing: editingIndex() === entry.index,
                  }}
                  draggable="true"
                  onDragStart={event => handleDragStart(entry.index, event)}
                  onDragOver={event => handleDragOver(entry.index, event)}
                  onDrop={handleDrop}
                  onDblClick={() => handleStartEdit(entry.index)}
                >
                  <LiContent entry={entry} />
                </li>
              )
          )}
        </For>
      </ul>
    );
  };

  // 组件渲染
  return (
    <div
      id="tags-sortable-container"
    >
      <textarea
        name="tags"
        placeholder="用逗号分隔项目，例如：苹果, 香蕉, 橘子"
        value={text()}
        onInput={handleTextareaInput}
      />

      <div class="tags-list-wrap">
        <List />
      </div>
    </div>
  )
};

export default App;
