import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

class FileioUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        let formData = new FormData();
        // formData.append("qquuid","qscbox");
        // formData.append("qqfilename",file.name);
        formData.append("file",file);
        // formData.append("qqtotalfilesize",file.size);
        let expire = config.config || 7;
        let res = await this._uploadFormData("https://file.io/?expires="+expire+"d",formData,progressCallback);
        if (res.data.success !== true){
            throw new UploadException(res.data.message);
        }
        return {
            url: res.data.link,
            expire: parseInt(expire) * 24 * 60 * 60
        };
    }

    static name(){
        return "fileio";
    }

    static config(){
        return [
            {label: "有效期(天)", name: "expire", type: "number", min: 1,value: "7"}
        ];
    }
}

export default FileioUploader;
