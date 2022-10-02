import IUploader from "@/upload/IUploader";
import UploadException from "@/upload/exception/UploadException";

export default class ExampleCosUploader extends IUploader{
    static async upload(file,config=false,progressCallback=false) {
        // 判断文件类型 .exe、.scr、.cpl、.doc*、.jar 不允许上传
        let ext = file.name.split('.').pop().toLowerCase();
        if (['exe','scr','cpl','doc','docx','jar'].includes(ext)){
            throw new UploadException("不允许上传此类型文件");
        }

        let userhash = config.userhash ? config.userhash : "";

        let formData = new FormData();
        formData.append("reqtype",'fileupload');
        formData.append("userhash", userhash);
        formData.append("fileToUpload",file);

        let result = await this._uploadFormData('https://catbox.moe/user/api.php',formData,progressCallback);

        return {
            url: result.data,
            expire: null
        };
    }

    static order(){
        return 11;
    }

    static name(){
        return "猫盒";
    }

    static config(){
        return [
            {label: "", name: "tip", type: "tip", value: "不设置对使用没有任何影响,获取地址：https://catbox.moe/user/manage.php"},
            {label: "用户userhash", name: "userhash", type: "text"},
        ];
    }
}
