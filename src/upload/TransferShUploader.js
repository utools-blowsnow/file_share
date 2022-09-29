import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

var utility = require('utility');

export default class ExampleUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        let url = "https://transfer.sh/" + utility.encodeURIComponent(file.name);

        let result = await this._upload(url,'put',file,{},progressCallback);

        let data = result.data;
        // 直接获取下载地址
        data = data.replace("https://transfer.sh/","https://transfer.sh/get/");

        return {
            url: data,
            expire: null
        };
    }

    static name(){
        return "TransferSh";
    }

    static order(){
        return 9;
    }

    static config(){
        return false;
    }
}
