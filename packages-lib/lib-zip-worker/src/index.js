import { fnDownload } from './base';

// 调用示例
const urls = [
    {
        name: "userscript.png",
        url: "https://opengraph.githubassets.com/0/wdssmq/userscript"
    },
    {
        name: "GesF-Note.png",
        url: "https://opengraph.githubassets.com/0/wdssmq/GesF-Note"
    }
];

import './index.css';

document.querySelector('#root').innerHTML = `
<div class="content">
  <h1>Vanilla Rsbuild</h1>
  <p>Start building amazing things with Rsbuild.</p>
  <p><button id="btn">Download</button></p>
</div>
`;

const $btn = document.querySelector('#btn');

$btn.addEventListener('click', () => {
    // 当前年月日时分秒
    const now = (new Date()).toLocaleString().replace(/\/|:|\s/g, '-');
    fnDownload(urls, `download-${now}`, (percent) => $btn.innerHTML = `正在压缩：${percent}%`);
});
