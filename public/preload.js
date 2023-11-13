const fs = require('fs')
const got = require('got');
const NodeFormData = require('form-data');
const mime = require('mime-types');
// const axios = require("axios");
window.utils = {}
window.utils.readFile = function ({path, name}) {
    const buffer = fs.readFileSync(path);

    class MyFile extends File {
        constructor(buffers, name, options) {
            super(buffers, name, options);
        }

        setPath(path2) {
            this.temp_path = path2;
        }
    }

    var file = new MyFile([buffer], name, {
        type: mime.lookup(path),
        path: path
    });
    file.setPath(path);
    return file;
}
window.utils.fileToBase64 = async function (file) {
    let buffer = Buffer.from(file);
    return buffer.toString('base64');
}
window.utils.createReadStream = function (path) {
    return fs.createReadStream(path);
}
window.utils.db = function (name, value = undefined) {
    let obj = utools.db.get(name);
    if (value !== undefined) {
        let putdata = {
            _id: name,
            data: value,
        }
        if (obj && obj._rev) {
            putdata._rev = obj._rev;
        }
        utools.db.put(putdata)
        return;
    }
    if (obj == null) return null;
    return obj.data;
}
window.utils.formData = async function (name = null, file = null) {
    console.log('formData',name, file);
    let formData = new NodeFormData();
    if (file === null) {
        return formData;
    }
    // 文件获取buffer  nodejs的buffer和浏览器的buffer不一样
    let buffer = Buffer.from(await file.arrayBuffer());
    formData.append(name, buffer, file.name);

    return formData;
}
window.utils.request = async function (params) {
    console.log(params);

    if (utools.isDev()) {
        // const {HttpProxyAgent} = require("http-proxy-agent");
        params.agent = {
            // http: new HttpProxyAgent('http://127.0.0.1:8888'),
        }
    }

    let response = await got(params).on('uploadProgress', (event) => {
        if (params.onUploadProgress) {
            params.onUploadProgress({
                loaded: event.transferred,
                total: event.total
            });
        }
    });

    try {
        return JSON.parse(response.body);
    }catch (e) {
        return response.body;
    }
}


console.log('preload utils', window.utils);
