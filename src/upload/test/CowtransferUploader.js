import IUploader from '../IUploader'
import axios from 'axios'

import UploadException from '../exception/UploadException'

//未完成
class CowtransferUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {

        // preparesend
        // https://cowtransfer.com/transfer/preparesend
        let formData = {
            totalSize: file.size,
            message: "",
            notifyEmail: "",
            validDays: 7,
            saveToMyCloud: "false",
            downloadTimes: -1,
            smsReceivers: "",
            emailReceivers: "",
            enableShareToOthers: "false",
            language: "cn"
        };

        let headers = {};
        headers.Referer =  'https://cowtransfer.com/'
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36';
        headers.Cookie = 'cf-cs-k-20181214=1604383846403;'


        let preRes = await this.form_request("https://cowtransfer.com/transfer/preparesend",formData);

        console.log(preRes);
        if (preRes.data.error){
            throw new UploadException(preRes.data.error_message);
        }

        const mime = require('mime-types');


        let beforeFormData = new FormData();
        beforeFormData.append("type",mime.lookup(file.name));
        beforeFormData.append("fileId","");
        // url编码后的
        beforeFormData.append("fileName",encodeURI(file.name));
        // 中文
        beforeFormData.append("originalName",file.name);
        beforeFormData.append("fileSize",file.size);
        beforeFormData.append("transferGuid",preRes.data.transferguid);
        beforeFormData.append("storagePrefix",preRes.data.prefix);
        beforeFormData.append("unfinishPath","");
        let beforeRes = await this.form_request("https://cowtransfer.com/transfer/beforeupload",beforeFormData);
        console.log(beforeRes);
        console.log(file);


        // 上传文件
        let uploadFormData = new FormData();
        uploadFormData.append("file",file);
        uploadFormData.append("token",preRes.data.uptoken);
        uploadFormData.append("key",preRes.data.prefix + '/' + preRes.data.transferguid + "/" + encodeURI(file.name));
        uploadFormData.append("fname",encodeURI(file.name));
        let uploadRes = await axios.post("https://upload.qiniup.com/",uploadFormData,{
            onUploadProgress: progressEvent => {
                let persent = (progressEvent.loaded / progressEvent.total * 100 | 0)
                console.log(progressEvent,persent);
                progressCallback && progressCallback(persent);
            }
        });
        console.log(uploadRes);

        let uploadedFormData = new FormData();
        uploadedFormData.append("hash",uploadRes.data.hash);
        uploadedFormData.append("fileGuid",beforeRes.data.fileGuid);
        uploadedFormData.append("transferGuid",preRes.data.transferguid);
        let uploadedRes = await this.form_request("https://cowtransfer.com/transfer/uploaded",uploadedFormData);
        console.log(uploadedRes);

        let completeFormData = new FormData();
        completeFormData.append("transferGuid",preRes.data.transferguid);
        let completeRes = await this.form_request("https://cowtransfer.com/transfer/complete",uploadedFormData);
        console.log(completeRes);

        return {
            url: preRes.data.uniqueurl,
            expire: 7 * 24 * 60 *60
        };

    }

    static async form_request(url,form_data){
        let formData = {};
        if (form_data instanceof FormData){
            form_data.forEach((value,key)=>{
                formData[key] = value;
            })
        }else{
            formData = form_data;
        }
        console.log(formData);

        let headers = {};
        headers.Referer =  'https://cowtransfer.com/'
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36';
        headers.Cookie = 'cf-cs-k-20181214=1604383846403;'


        let preRes = await window.utils.request({
            url: url,
            method: 'POST',
            formData: formData,
            headers: headers,
            // proxy: "http://127.0.0.1:7788",
            // rejectUnauthorized: false,
        });
        console.log(preRes);
        return {
            ...preRes,
            data: JSON.parse(preRes.body)
        };
    }

    static name(){
        return "奶牛快传";
    }

    static config(){
        return false;
    }
}

export default CowtransferUploader;
