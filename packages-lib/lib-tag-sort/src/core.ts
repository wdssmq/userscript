// 独立模块：插入容器、文本框与可拖拽的可排序列表，双向同步（列表 <-> 文本框）

type Item = string;

function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
}

function initSortableList() {
    // 避免重复初始化
    if (document.getElementById('tags-sortable-container')) return;

    // 容器
    const container = createElement('div', 'tags-sortable-container');
    container.id = 'tags-sortable-container';

    // 文本框（以逗号分隔）
    const textarea = createElement('textarea') as HTMLTextAreaElement;
    textarea.placeholder = '用逗号分隔项目，例如：苹果, 香蕉, 橘子';
    textarea.value = '苹果, 香蕉, 橘子';
    textarea.name = "tags"
    container.appendChild(textarea);

    // 列表容器
    const listWrap = createElement('div', 'tags-list-wrap');
    const ul = createElement('ul') as HTMLUListElement;
    listWrap.appendChild(ul);
    container.appendChild(listWrap);

    document.body.appendChild(container);

    // 当前项数组
    let items: Item[] = [];
    let fromIdx = -1;
    let toIdx = -1;

    // 渲染函数
    function render() {
        ul.innerHTML = '';
        items.forEach((it, idx) => {
            const li = createElement('li') as HTMLLIElement;
            li.draggable = true;
            li.dataset.index = String(idx);

            // const handle = createElement('span', 'handle');
            // handle.title = '拖动调整顺序';
            // li.appendChild(handle);

            const text = createElement('span', 'text', it);
            li.appendChild(text);

            // // 可直接点击编辑单项（双击）
            // li.ondblclick = () => {
            //     const input = document.createElement('input');
            //     input.type = 'text';
            //     input.value = it;
            //     input.style.flex = '1';
            //     li.innerHTML = '';
            //     li.appendChild(handle);
            //     li.appendChild(input);
            //     input.focus();
            //     input.onblur = () => {
            //         items[idx] = input.value.trim();
            //         syncToTextarea();
            //         render();
            //     };
            //     input.onkeydown = (e) => {
            //         if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            //         if (e.key === 'Escape') render();
            //     };
            // };

            // 拖拽事件
            li.addEventListener('dragstart', (e) => {
                li.classList.add('dragging');
                fromIdx = idx;
                // 以 move 为默认效果
                if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
            });
            li.addEventListener('dragend', () => {
                li.classList.remove('dragging');
                removePlaceholder();
            });
            li.addEventListener('dragover', (e) => {
                e.preventDefault();
                const dragging = ul.querySelector('.dragging') as HTMLLIElement | null;
                if (!dragging || dragging === li) return;
                // 在当前 li 插入占位（根据鼠标位置决定插入前或后）
                const curIdx = Number(li.dataset.index);
                if (Number.isNaN(curIdx)) return;
                const rect = li.getBoundingClientRect();
                const halfway = rect.top + rect.height / 2;
                if (e.clientY < halfway) {
                    toIdx = curIdx - 1;
                    toIdx !== fromIdx &&
                        insertPlaceholder(li, 'before');
                } else {
                    toIdx = curIdx + 1;
                    toIdx !== fromIdx &&
                        insertPlaceholder(li, "after");
                }
            });

            ul.appendChild(li);
        });
    }

    function syncToTextarea() {
        // 去除空元素并保留顺序
        textarea.value = items.filter(s => s.trim() !== '').map(s => s.trim()).join(', ');
    }

    // 文本框 -> 列表
    textarea.addEventListener('input', () => {
        const raw = textarea.value.replace(/，/g, ",");
        if (raw.trim() === ""){
            removeSelf();
            return;
        }
        items = raw.split(',').map(s => s.trim()).filter(s => s.length > 0);
        render();
        container.style.width = 400 + items.length * 15 + 'px';
    });

    // 初始解析并渲染
    items = textarea.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    render();

    // 占位管理
    function removePlaceholder() {
        const ph = ul.querySelector('.placeholder');
        if (ph) ph.remove();
    }
    function insertPlaceholder(el: HTMLLIElement, position: 'before' | 'after' = 'before') {
        const elIdx = el.dataset.index;
        const phID = `${position}-${elIdx}`;
        if (document.getElementById(phID)) {
            return;
        }
        removePlaceholder();
        const ph = createElement('li', 'placeholder') as HTMLLIElement;
        ph.className = 'placeholder';
        ph.id = phID;
        // console.log(phID);

        // 使用现代插入语法：Element.before / Element.after
        if (position === 'before') {
            // 在目标元素之前插入
            (el as ChildNode).before(ph);
        } else {
            // 在目标元素之后插入
            (el as ChildNode).after(ph);
        }
        ph?.addEventListener('drop', dropHandle)
    }

    // drop 事件处理
    function dropHandle(e: Event) {
        e.preventDefault();
        const moved = items[fromIdx];
        items = items.toSpliced(fromIdx, 1);
        if (toIdx > fromIdx) {
            items.splice(toIdx - 1, 0, moved);
        } else {
            items.splice(toIdx + 1, 0, moved);
        }
        syncToTextarea();
        render();
    }

    document.addEventListener('dragover', (e) => {
        // console.log((e.target as Element)?.closest?.('.tags-list-wrap'));
        if ((e.target as Element)?.closest?.('.tags-list-wrap')) {
            e.preventDefault();
        }
    });

    // 移除
    function removeSelf(){
        if (container) container.remove();
    }
}



export default initSortableList;
