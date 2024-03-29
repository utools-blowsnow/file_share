import IUploader from '../IUploader'
import UploadException from '../exception/UploadException'
import axios from "axios";

export default class YoudaoUploader extends IUploader{

    static _upload(url,method='post',data,params={},progressCallback=false){
        return window.utils.request({
            url: url,
            method: method,
            body: data,
            ...params,
            onUploadProgress: function (progressEvent) { //原生获取上传进度的事件
                console.log(progressEvent);
                if (progressEvent.lengthComputable) {
                    progressCallback && progressCallback(progressEvent.loaded / progressEvent.total * 100);
                }
            }
        });
    }

    static async upload(file,config=false,progressCallback=false) {
        let expire = config.expire || 7;
        let headers = {
            'Cookie': config.cookie
        }

        // https://note.youdao.com/yws/api/personal/sync/upload?keyfrom=web
        // cstk=2TGyUIBN
        let res = await window.utils.request({
            url: 'https://note.youdao.com/yws/api/personal/sync/upload?cstk=u0EdSKkX',
            method: 'post',
            body: "",
            headers: {
                ...headers,
                'File-Size': file.size
            }
        })

        let data = res.body === "" ? "" : JSON.parse(res.body);

        let transmitId = data.transmitId;

        console.log(res);

        // https://note.youdao.com/yws/api/personal/sync/upload/160465771822378CA?cstk=2TGyUIBN
        // application/x-zip-compressed
        let res2 = await this.uploadStream('https://note.youdao.com/yws/api/personal/sync/upload/' + transmitId + "?cstk=u0EdSKkX",file,'post',{
            headers: {
                ...headers,
            }
        },progressCallback)
        console.log(res2);


        var md5 = require('md5');
        let fileId = "WEB" + md5(transmitId);

        var sync = async ()=>{
            let url = 'https://note.youdao.com/yws/api/personal/sync?method=push&fileId='+fileId+'&domain=1&parentId=SVRE1C8FE10C8594E07A84EE45C1048ED18&transmitId='+transmitId+'&rootVersion=-1&sessionId=&dir=false&createTime=1604657717&modifyTime=1604657717&transactionId='+fileId+'&transactionTime=1604657717&editorVersion=1601177355000&keyfrom=web&name=' + encodeURI(file.name);
            return await this.request({
                url: url,
                method: 'post',
                headers: {
                    ...headers,
                    'Content-Type': 'application/ynote-stream;charset=UTF-8',
                    'YNOTE_STREAM_REQUEST': true,
                    'parameters-length': 0
                }
            });
        }

        let res3 = await sync();
        if (res3.data.error === "20108"){  //覆盖
            fileId = res3.data.duplicateFileId;
            res3 = await sync();
        }


        //分享地址
        let shareRes = await this.request({
            url: 'https://note.youdao.com/yws/api/personal/share?keyfrom=web&cstk=2TGyUIBN',
            method: 'post',
            qs: {
                method: "publish",
                fileId: fileId,
                passwordEnable: false,
                collabEnable: false,
                searchEnable: false,
                commentEnable: true,
                expiredDays: expire
            },
            headers: headers
        })

        return {
            url: shareRes.data.url,
            expire: expire * 24 * 60 * 60
        }
    }


    static async login(){
        var result = await utools.ubrowser.goto('https://note.youdao.com/web')
            .devTools('detach')
            .when(() => document.cookie.includes("YNOTE_LOGIN"))
            .end()
            .evaluate(() => document.cookie)
            .run({ width: 1000, height: 600 })

        let cookie;

        if (result.length > 0) {

            cookie = result[0];

            utools.showNotification('有道云登陆成功')
        }

        console.log('登陆成功',cookie);

        return cookie;
    }

    static name(){
        return "有道云";
    }

    static config(){
        return [
            {label: "登录", name: "expire", type: "button",handle: async (event,uploader) =>{
                    uploader.config.cookie = await this.login();
            }},
            {label: "登录后的cookie", name: "cookie", type: "text"},
            {label: "有效期(天)", name: "expire", type: "number", min: 1,value: "7"}
        ];
    }
}
