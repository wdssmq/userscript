import * as Comlink from "comlink";
import { saveAs } from 'file-saver';

const JSZipCLS = (() => {
    const worker = new Worker(new URL("./workers/jszip.js", import.meta.url));
    return Comlink.wrap(worker);
})();

// 文件下载
const dlPromise = async (url, name) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return { name, blob };
}

const fnDownload = async (urls, zipName, ProgressCB) => {
    const JSZip = await new JSZipCLS();
    const dlPromises = urls.map((item, i) => dlPromise(item.url, item.name));
    const files = await Promise.all(dlPromises);
    files.forEach(
        ({ name, blob }) => JSZip.file(name, blob)
    );
    const compressedBlob = await JSZip.generateAsync(
        { type: "blob" },
        Comlink.proxy(({ percent, currentFile }) => {
            console.log(percent, currentFile);
            ProgressCB(percent.toFixed(2));
        }),
    );
    saveAs(compressedBlob, `${zipName}.zip`);
}

export { fnDownload };
