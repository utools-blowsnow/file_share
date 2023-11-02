import UploadException from "@/upload/exception/UploadException";
import axios from 'axios'
axios.defaults.withCredentials = false;

class IUploader{

    /**
     * 上传文件
     * @param file 文件
     * @param config 配置
     * @param progressCallback 进度回调
     * @return {url,expire}  expire 为过期时间 秒
     */
    static upload(file,config=false,progressCallback=false){}

    /**
     * 上传组件的名称
     * @return string
     */
    static name(){}

    /**
     * 初始化配置
     * @param uploader
     */
    static init({config, configParameters}){};

    /**
     * 上传组件的配置
     * type 支持 select, text, number, button
     * select 下需要配置 options  {label: "7天",value: 8},
     * {label: "有效期(天)", name: "expire", type: "number", min: 1,value: "7"}
     */
    static config(){ return false; }

    /**
     * 排序
     * @returns {number}
     */
    static order(){ return 0;}


    static async configParameters(userConfig) {
        let configParameters = this.config();

        return configParameters;
    }

    static async uploadStream(url,file,method='post',params={},progressCallback=false){
        let buffer = Buffer.from(await this._fileToBuffer(file));

        console.log(buffer);

        return this._upload(url, method, buffer, params, progressCallback);
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

    static _uploadFormData2(url, data, options, progressCallback = false) {
        return this._upload(url, 'post', data, options, progressCallback);
    }


    static async _fileToBuffer(file){
        return new Uint16Array(await file.arrayBuffer())
    }
}


export default IUploader;
