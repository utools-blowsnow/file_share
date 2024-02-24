import IUploader from './IUploader'
import UploadException from './exception/UploadException'

class PixeldrianUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        console.log("upload",file);
        let formData = new FormData();
        // formData.append("qquuid","qscbox");
        // formData.append("qqfilename",file.name);
        formData.append("file",file);
        // formData.append("qqtotalfilesize",file.size);
        // let expire = config.config || 7;
        let headers = {};
        if (config.token){
            headers['Authorization'] = `Basic ${btoa(":"+config.token.trim())}`;
        }
        let res = await this._upload("https://pixeldrain.com/api/file/" + file.name,'put',file,{
            headers: headers
        },progressCallback);
        if (!res.data.id){
            throw new UploadException(res.data.message);
        }
        let prefix = config.urlType === 0 ? "https://pixeldrain.com/api/file/" : "https://pixeldrain.com/u/";
        return {
            url: prefix + res.data.id,
            expire: null
        };
    }

    static name(){
        return "pixeldrain";
    }

    static order(){ return 100;}

    static config(){
        return [
            {label: "ApiToken", name: "token", type: "text",desc:"可选 请在 https://pixeldrain.com/user/api_keys 获取"},
            {label: "访问地址", name: "urlType", type: "select", options: [
                    {label: "下载地址", value: 0},
                    {label: "预览地址", value: 1},
                ],value: 0},
        ];
    }
}

export default PixeldrianUploader;
