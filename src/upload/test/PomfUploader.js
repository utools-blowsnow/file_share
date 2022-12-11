import IUploader from '../IUploader'
import axios from 'axios'
import UploadException from '../exception/UploadException'

var utility = require('utility');

export default class PomfUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        let host = config.host || "https://uguu.se/";
        if (host.substr(-1) !== "/")  host += "/";
        if (!(host.startsWith("http://") || host.startsWith("https://"))) host = "https://" + host;
        let url = host + '/upload.php';

        let formData = new FormData();
        formData.append("files[]",file);

        let {data,status} = await this._uploadFormData(url,formData,progressCallback);

        console.log(data);

        if (!data.success) throw new UploadException(data.description);

        return {
            url: data.files[0].url,
            expire: config.maxDay ? config.maxDay * 24 * 60 * 60 : null
        };
    }

    static name(){
        return "Pomf";
    }

    static order(){
        return 9;
    }

    static config(){
        return [
            {label: "", name: "tip", type: "tip", value: "自行搭建：https://github.com/Pomf/Pomf\n使用推荐服务器：ninja（48小时过期）：https://tmp.ninja/\nUguu（48小时过期）：https://uguu.se/"},
            {label: "自定义服务器地址", name: "host", type: "text", value: "https://uguu.se/"},
            {label: "最大天数(0不限制)", name: "maxDay", type: "number", value: "2",min: 0}
        ];
    }
}
