import IUploader from "@/upload/IUploader";
import UploadException from "@/upload/exception/UploadException";

export default class TencentCosUploader extends IUploader{
    static async upload(file,config=false,progressCallback=false) {
        var COS = require('cos-js-sdk-v5');
        var cos = new COS({
            SecretId: config.secretId,
            SecretKey: config.secretKey
        });

        console.log("TencentCosUploader upload",file,config);

        let result = await new Promise((resolve,reject) => {
            cos.putObject({
                Bucket: config.bucket, /* 填入您自己的存储桶，必须字段 */
                Region: config.region,  /* 存储桶所在地域，例如ap-beijing，必须字段 */
                Key: file.name,  /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
                StorageClass: 'STANDARD',
                /* 当Body为stream类型时，ContentLength必传，否则onProgress不能返回正确的进度信息 */
                Body: file, // 上传文件对象
                ContentLength: file.size,
                onProgress: function(progressData) {
                    progressCallback(progressData.percent * 100);
                }
            }, function(err, data) {
                console.log(err || data);
                if (err) reject(err);
                else resolve(data);
            });
        })


        return {
            url: result.Location,
            expire: null
        };
    }

    static order(){ return 1;}

    static name(){
        return "腾讯云对象存储";
    }

    static config(){
        return [
            {label: "配置提示", value: "1. 在腾讯云 对象存储控制台 创建一个 Bucket<br>2. 在访问管理控制台中的 API 密钥管理 页面里获取 APPID，并创建 SecretId、SecretKey。",
                name: "tip", type: "tip"},
            {label: "SecretId", name: "secretId", type: "text"},
            {label: "SecretKey", name: "secretKey", type: "text"},
            {label: "Bucket", name: "bucket", type: "text"},
            {label: "Region", name: "region", type: "text"},
        ];
    }
}
