const fs = require('fs')
const request = require("request");

const FormData = require('form-data');
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
    request(params) {
        params.proxy = 'http://127.0.0.1:8888';

        console.log(params);

        return new Promise((resolve, reject) => {
            request(params,function(err,httpResponse,body){
                if (err) {
                    reject(err);
                } else {
                    console.log(httpResponse);
                    let data = JSON.parse(body) ?? body;
                    resolve(data);
                }
            })
        })
    },
    requestFormData(params,formDatas) {
        let formData = new FormData();
        Object.keys(formDatas).forEach(key => {
          let value = formDatas[key];
            if (value instanceof Object) {
                formData.append(key, value.value, value.options.filename);
            }else{
                formData.append(key,value);
            }
        })

        params.body = formData.getBuffer();
        params.headers = params.headers || {};
        params.headers['Content-Type'] = 'multipart/form-data; boundary=' + formData.getBoundary();
        return this.request(params);
    }

}

var logger = require('simple-node-logger').createSimpleLogger('D:\\project.log');
var tempLog = console.log;
// window.console.log = (...args) => {
//     tempLog.apply(console, args);
//     logger.info(...args);
// };
