import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

var ubrowser;

export default class YoudaoUploader extends IUploader{

    static async request(params){
        let res = await window.utils.request(params);
        console.log(res);
        return {
            ...res,
            data: res.body === "" ? "" : JSON.parse(res.body),
            proxy: "http://127.0.0.1:7788",
            rejectUnauthorized: false,
        }
    }

    static uploadStream(url,file,method='post',params={}){
        var that = this;
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);//安字节读取文件并存储至二进制缓存区
        return new Promise((resolve, reject) => {
            reader.onload = async function (e) {
                let result = new Uint8Array(e.target.result);
                let res2 = await that.request({
                    url: url,
                    method: method,
                    body: result,
                    ...params
                });
                resolve(res2);
            }
        })
    }

    static async upload(file,config=false) {
        let expire = config.expire || 7;
        let headers = {
            'Cookie': ''
        }

        // https://note.youdao.com/yws/api/personal/sync/upload?keyfrom=web
        // cstk=2TGyUIBN
        let res = await this.request({
            url: 'https://note.youdao.com/yws/api/personal/sync/upload?keyfrom=web',
            method: 'post',
            body: "",
            headers: {
                ...headers,
                'File-Size': file.size
            }
        })
        if (res.data.error){
            if (res.data.error === "207" && !config.retry){  //未登录
                //尝试登录
                let times = 1;

                return this.upload(file,{
                    ...config,
                    retry: true
                });
            }
            throw new UploadException(res.data.message);
        }
        console.log(res);

        // https://note.youdao.com/yws/api/personal/sync/upload/160465771822378CA?cstk=2TGyUIBN
        // application/x-zip-compressed
        let res2 = await this.uploadStream('https://note.youdao.com/yws/api/personal/sync/upload/' + res.data.transmitId,file,'post',{
            headers: {
                ...headers,
                'Content-Type': 'application/x-zip-compressed'
            }
        })
        console.log(res2);

        var md5 = require('md5');
        let fileId = "WEB" + md5(res.data.transmitId);

        var sync = async ()=>{
            let url = 'https://note.youdao.com/yws/api/personal/sync?method=push&fileId='+fileId+'&domain=1&parentId=SVRE1C8FE10C8594E07A84EE45C1048ED18&transmitId='+res.data.transmitId+'&rootVersion=-1&sessionId=&dir=false&createTime=1604657717&modifyTime=1604657717&transactionId='+fileId+'&transactionTime=1604657717&editorVersion=1601177355000&keyfrom=web&name=' + encodeURI(file.name);
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


    static login(){
        ubrowser = utools.ubrowser;
        return ubrowser.goto('https://note.youdao.com/signIn/wxlogin.html?state=Pz6LQu0MeS06z6Mw40Lqz0ZZZZZZuHqz0&redirect_uri=https%3A%2F%2Fnote.youdao.com%2Flogin%2Facc%2Fcallback')
            .devTools('detach')
            .wait(function(){
                setInterval(function (){
                    console.log(document.cookie);
                },1000)
                console.log(document.cookie);
            },5*60*1000)
            .run({ width: 1000, height: 600 });
    }

    static name(){
        return "有道云";
    }

    static config(){
        var that = this;
        var nowhandle = false;
        return [
            {label: "登录", name: "expire", type: "button",handle: async function (){
                console.log('登录',nowhandle);
                if (!ubrowser){
                    nowhandle = true;
                    try {
                        await that.login();
                    }catch (e){}finally {
                        nowhandle = false;
                    }
                }else{
                    console.log(ubrowser,ubrowser.hide());
                }
            }},
            {label: "有效期(天)", name: "expire", type: "number", min: 1,value: "7"}
        ];
    }
}
