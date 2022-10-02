import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

var utility = require('utility');

export default class ExampleUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        let host = config.host || "https://transfer.sh/";
        if (host.substr(-1) !== "/")  host += "/";
        if (!(host.startsWith("http://") || host.startsWith("https://"))) host = "https://" + host;
        let url = host + utility.encodeURIComponent(file.name);

        let headers = {};
        if (config.maxDownload) headers["Max-Downloads"] = config.maxDownload;
        if (config.maxDay) headers["Max-Days"] = config.maxDay;

        let result = await this._upload(url,'put',file,{
            headers: headers
        },progressCallback);

        let data = result.data;

        // 直接获取下载地址
        data = data.replace(host,host + "get/");

        return {
            url: data,
            expire: config.maxDay * 24 * 60 * 60
        };
    }

    static name(){
        return "TransferSh";
    }

    static order(){
        return 9;
    }

    static config(){
        return [
            {label: "自定义服务器地址", name: "host", type: "text", value: "https://transfer.sh/"},
            {label: "最大下载数量(0不限制)", name: "maxDownload", type: "number", value: "0",min: 0},
            {label: "最大天数(0不限制)", name: "maxDay", type: "number", value: "0",min: 0}
        ];
    }
}
