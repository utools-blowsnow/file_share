import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

export default class FirestoragejpUploader extends IUploader{
    static async upload(file,config=false,progressCallback=false) {
        // https://server28.firestorage.jp/upload.cgi
        let formData = new FormData();

        var date = new Date();
        var expire_type = config.expire||8;

        let params = {
            "folder_id": "2fd9a5a2f5fbca9806aff5fc43c9306c9f693459cb971a7b8285644",
            "ppass": "",
            "dpass": "",
            "thumbnail": "nomal",
            "top": 1,
            "max_size": 2147483648,
            "max_sized": 250,
            "max_size_photo": 15728640,
            "max_size_photod": 15,
            "max_count": 20,
            "max_count_photo": 150,
            "jqueryupload": 1,
            "eid": "",
            "processid": date.getFullYear() + date.getMonth() + date.getDate() + date.getTime(),
            "qst": "n1=Mozilla&n2=Netscape&n3=Win32&n4=Mozilla/5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit/537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome/86.0.4240.111%20Safari/537.36",
            "comments": "",
            "comment": "",
            "arc": "",
            "zips": "",
            "file_queue": 1,
            "pc": 1,
            "exp": expire_type
        }
        for(let key of Object.keys(params)){
            formData.append(key,params[key]);
        }
        formData.append("Filename",file);
        let res = await this._uploadFormData("https://server25.firestorage.jp/upload.cgi",formData,progressCallback);
        let data = decodeURIComponent(res.data);
        let arr = data.match(/href="(http:\/\/firestorage.jp\/download\/.*?)"/);

        return {
            url: arr[1],
            expire: this.expire(expire_type)
        };
    }

    static expire(expire_type){
        console.log(expire_type);
        if (expire_type == 8){
            return 7 * 24 * 60 * 60;
        }else if (expire_type == 7){
            return 3 * 24 * 60 * 60;
        }else if (expire_type == 6){
            return 2 * 24 * 60 * 60;
        }else if (expire_type == 5){
            return 1 * 24 * 60 * 60;
        }else if (expire_type == 4){
            return 12 * 60 * 60;
        }else if (expire_type == 3){
            return 6 * 60 * 60;
        }else if (expire_type == 2){
            return 3 * 60 * 60;
        }else if (expire_type == 1){
            return 1 * 60 * 60;
        }else if (expire_type == 0){
            return 7 * 24 * 60 * 60;
        }
    }

    static name(){
        return "firestoragejp";
    }

    static order(){ return 9;}

    static config(){
        return [
            {label: "有效期", name: "expire", type: "select" ,value: 8, options: [
                    {label: "7天",value: 8},
                    {label: "3天",value: 7},
                    {label: "2天",value: 6},
                    {label: "1天",value: 5},
                    {label: "12小时",value: 4},
                    {label: "6小时",value: 3},
                    {label: "3小时",value: 2},
                    {label: "1小时",value: 1},
                    {label: "未指定",value: 0},
            ]}
        ];
    }
}
