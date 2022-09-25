import IUploader from "@/upload/IUploader";
import UploadException from "@/upload/exception/UploadException";

export default class ExampleCosUploader extends IUploader{
    static async upload(file,config=false,progressCallback=false) {


        return {
            url: null,
            expire: null
        };
    }

    static name(){
        return "腾讯对象存储";
    }

    static config(){
        return [
            {label: "SecretId", name: "secretId", type: "text"},
            {label: "SecretKey", name: "secretKey", type: "text"},
            {label: "Bucket", name: "bucket", type: "text"},
            {label: "Region", name: "region", type: "text"},
        ];
    }
}
