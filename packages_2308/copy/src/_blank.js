import { _log, $na, fnFindDom } from "./_base";

// 指定元素中的链接增加 target="_blank"
const config = [
    [".markdown_body", ".reply_content"],
    ["#additional-info"],
    ["div.forum_table table"],
];

const fnSetBlank = ($a) => {
    $a.setAttribute("target", "_blank");
};

config.forEach((e) => {
    const selector = e.join(",");
    const $$container = $na(selector);
    // // print $$container
    // _log($$container);
    // 遍历 $$container
    [].forEach.call($$container, ($el) => {
        const $$a = fnFindDom($el, "a");
        // _log($$a);
        if ($$a.length > 0) {
            [].map.call($$a, fnSetBlank);
        }
    });
});
