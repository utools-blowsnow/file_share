import UploadException from "@/upload/exception/UploadException";
import axios from 'axios'
axios.defaults.withCredentials = false;

class IUploader{

    /**
     * 上传文件
     * @param file 文件
     * @param config 配置
     * @param progressCallback 进度回调
     * @return {url,expire}
     */
    static upload(file,config=false,progressCallback=false){}

    /**
     * 上传组件的名称
     * @return string
     */
    static name(){}

    /**
     * 上传组件的配置
     * type 支持 select, text, number, button
     * select 下需要配置 options
     * {label: "有效期(天)", name: "expire", type: "number", min: 1,value: "7"}
     */
    static config(){}

    static uploadStream(url,file,method='post',params={},progressCallback=false){
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);//安字节读取文件并存储至二进制缓存区
        return new Promise((resolve, reject) => {
            reader.onload = async function (e) {
                let result = new Uint8Array(e.target.result);
                let res2 = await IUploader._upload(url,method,result,params,progressCallback);
                resolve(res2);
            }
        })
    }

    static _upload(url,method='post',data,params={},progressCallback=false){
        return axios({
            url: url,
            method: method,
            data: data,
            ...params,
            onUploadProgress: function (progressEvent) { //原生获取上传进度的事件
                console.log(progressEvent);
                if (progressEvent.lengthComputable) {
                    progressCallback && progressCallback(progressEvent.loaded / progressEvent.total * 100);
                }
            }
        });
    }

    static _uploadFormData(url,data,progressCallback=false){
        return this._upload(url,'post',data,{},progressCallback);
    }
}


export default IUploader;
