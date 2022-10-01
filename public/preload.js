const fs = require('fs')
const request = require("request");
const axios = require('axios')
const needle = require("needle");
window.utils = {
    readFile: (pathObj) => {
        var buffer = fs.readFileSync(pathObj.path,{
            encoding: 'binary'
        });

        console.log("buffer",buffer);

        class MyFile extends File {
            setPath(path) {
                this.temp_path = path;
            }
        }

        var file = new MyFile([buffer], pathObj.name);
        file.setPath(pathObj.path);
        return file;
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
    // request(params = {},form=false) {
    //     params.proxy = 'http://127.0.0.1:8888'
    //
    //     return new Promise((resolve,reject) => {
    //         console.log(params);
    //         let res = request(params.url,params, function(error, response, body) {
    //             if (error !== null) reject(error);
    //             resolve(response);
    //         });
    //
    //         if (form) {
    //             form(res.form());
    //         }
    //     })
    // },
    request(params) {
        const needle = require('needle');
        needle.defaults({
            proxy: 'http://127.0.0.1:8888',
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.53"
        })

        // 转换下data
        if (params.data instanceof FormData) {
            let obj = {};
            params.data.forEach((value, key) => {
                obj[key] = value;
            })
            params.encoding = 'binary';
            params.data = obj;
            params.multipart = true;
            // 生成 10个随机字符
            params.boundary = "--------------------" + Math.random().toString(36).substr(2, 10)
        }

        console.log(params);

        return needle(params.method,params.url, params.data, params);
    }

}

var logger = require('simple-node-logger').createSimpleLogger('D:\\project.log');
var tempLog = console.log;
// window.console.log = (...args) => {
//     tempLog.apply(console, args);
//     logger.info(...args);
// };
