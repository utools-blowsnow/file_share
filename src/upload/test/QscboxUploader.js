import IUploader from '../IUploader'
import axios from 'axios'

import UploadException from '../exception/UploadException'

class QscboxUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        // https://www.qsc.zju.edu.cn/box/item/add_item
        // PHP_SESSION_UPLOAD_PROGRESS: qscbox
        // filecount: 1
        // file: (binary)
        // callback: handleUploadCallback
        // is_ie9: 0

        // https://box.zjuqsc.com/-59739696
        let formData = new FormData();
        formData.append("PHP_SESSION_UPLOAD_PROGRESS","qscbox");
        formData.append("filecount","1");
        formData.append("file",file);
        formData.append("callback","handleUploadCallback");
        formData.append("is_ie9","0");

        let res = await this._uploadFormData("https://www.qsc.zju.edu.cn/box/item/add_item",formData,progressCallback);

        if (res.data.err !== 0){
            throw new UploadException(res.data.msg);
        }
        let data = res.data.data;
        let expire = config.expire || 2592000;

        await this.expire(data.secure_id,data.token,expire);

        return {
            url: "https://box.zjuqsc.com/-" + data.token,
            expire: expire
        };
    }

    static async expire(secure_id,token,expiration){
        //修改有效期
        let params = {
            new_token: "",
            old_token: token,
            secure_id: secure_id,
            token_sec: "",
            old_sec: "",
            expiration: expiration
        };
        console.log(Qs.stringify(params));
        let res = await axios.post("https://www.qsc.zju.edu.cn/box/item/change_item", Qs.stringify(params));
        console.log(res);
    }

    static name(){
        return "求是潮云U盘";
    }

    static config(){
        return [
            {label: "有效期", name: "expire", type: "select",value: "2592000", options: [
                    {label: "1小时", value: "3600"},
                    {label: "12小时", value: "43200"},
                    {label: "1天", value: "86400"},
                    {label: "5天", value: "432000"},
                    {label: "10天", value: "864000"},
                    {label: "30天", value: "2592000"},
            ]}
        ];
    }
}


export default QscboxUploader;
