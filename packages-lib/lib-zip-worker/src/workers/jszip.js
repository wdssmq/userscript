importScripts(
    "https://cdn.jsdelivr.net/npm/comlink@4.4.2/dist/umd/comlink.js",
    "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"
);

class JSZipWorker {
    constructor() {
        this.zip = new JSZip();
    }

    file(name, data) {
        this.zip.file(name, data);
    }

    async generateAsync(options, onUpdate) {
        const data = await this.zip.generateAsync(options, onUpdate);
        // console.log("jszip worker generateAsync");
        // console.log(data);
        return Comlink.transfer(data);
    }
}

Comlink.expose(JSZipWorker);
