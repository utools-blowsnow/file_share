const fs = require('fs')
const got = require('got');
const NodeFormData = require('form-data');
const {HttpProxyAgent} = require("http-proxy-agent");
// const axios = require("axios");

window.utils = {
    readFile: (pathObj) => {
        var buffer = fs.readFileSync(pathObj.path);

        class MyFile extends File {
            setPath(path) {
                this.temp_path = path;
            }
        }
        const mime = require('mime/lite');
        var file = new MyFile([buffer], pathObj.name,{
            type: mime.getType(pathObj.path),
            path: pathObj.path
        });
        file.setPath(pathObj.path);
        return file;
    },
    createReadStream: (path) => {
        return fs.createReadStream(path);
    },
    db: function (name, value = undefined) {
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
    },

    async formData(name = null, file = null) {
        let formData = new NodeFormData();
        if (file === null) {
            return formData;
        }
        // 文件获取buffer  nodejs的buffer和浏览器的buffer不一样
        let buffer = Buffer.from(await file.arrayBuffer());
        formData.append(name, buffer, file.name);

        return formData;
    },
    async request(params) {
        // params.proxy = 'http://127.0.0.1:8888';
        console.log(params);

        params.agent = {
            http: new HttpProxyAgent('http://127.0.0.1:8888'),
        }

        let response = await got(params).on('uploadProgress', (event) => {
            if (params.onUploadProgress){
                params.onUploadProgress({
                    loaded: event.transferred,
                    total: event.total
                });
            }
        });

        return JSON.parse(response.body) ? JSON.parse(response.body) : response.body;
    }

}
