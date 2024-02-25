import IUploader from './IUploader'
import UploadException from './exception/UploadException'

class CustomAHttpUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        let uploadFunction = new Function("file","progressCallback",config.code);
        let downloadUrl = await uploadFunction(file,progressCallback);
        return {
            url: downloadUrl,
            expire: null
        }
    }

    static name(){
        return "高级自定义上传源";
    }

    static order(){ return 10;}

    static config(){
        return [
            {label: "上传代码", name: "code", type: "textarea",required: true, descPre: `上传代码，使用fetch请求接口，返回下载地址
例子：(变量：file File, progressCallback function(int))
return fetch("https://pixeldrain.com/api/file/" + file.name, {
    "method": "PUT",
    "body": file
  }).then(res => res.json())
    .then(res => "https://pixeldrain.com/u/" + res.id);`},
        ];
    }
}

export default CustomAHttpUploader;
