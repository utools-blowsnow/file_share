import IUploader from "@/upload/IUploader";
import UploadException from "@/upload/exception/UploadException";
import axios from "axios";

export default class LanzouCosUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        // https://pc.woozooo.com/fileup.php
        let headers = {
            'Cookie': config.cookie
        }

        console.log(headers);

        let formData = new FormData();
        formData.append("task","1");
        formData.append("ve","2");
        formData.append("id","WU_FILE_1");
        formData.append("name",file.name);
        formData.append("type",file.type);
        formData.append("size",file.size);
        formData.append("upload_file",file);

        // formData 转对象
        let obj = {};
        for (let key of formData.keys()) {
            obj[key] = formData.get(key);
        }

        let result = await axios('http://pc.woozooo.com/fileup.php',{
            method: "post",
            body: formData,
            headers: {
                'Content-type': 'multipart/form-data',
                ...headers
            },
            onUploadProgress: function (progressEvent) { //原生获取上传进度的事件
                if (progressEvent.lengthComputable) {
                    progressCallback && progressCallback(progressEvent.loaded / progressEvent.total * 100);
                }
            }
        }, (res) => {
            // Do stuff with response
            console.log(res);
        });

        console.log("fileup",result);

        if (result.text === 'error'){
            throw new UploadException(result.info);
        }

        let id = result.text[0].id;

        let shareResult = await axios({
            url: "https://pc.woozooo.com/doupload.php",
            method: "post",
            data: {
                task: 22,
                file_id: id
            },
            headers: headers
        })

        return {
            url: shareResult.info.is_newd + '/' + shareResult.info.f_id,
            expire: null
        };
    }

    static name(){
        return "蓝奏云";
    }

    static async login(){
        var result = await utools.ubrowser.goto('https://pc.woozooo.com/')
            .devTools('detach')
            .when(() => document.cookie.includes("phpdisk_info"))
            .end()
            .evaluate(() => document.cookie)
            .run({ width: 1000, height: 600 })

        let cookie;

        if (result.length > 0) {

            cookie = result[0];

            utools.showNotification('蓝奏云登陆成功')
        }

        console.log('登陆成功',cookie);

        return cookie;
    }

    static config(){
        return [
            {label: "登录", name: "login", type: "button",handle: async (event,uploader) =>{
                    uploader.config.cookie = await this.login();
            }},
            {label: "登录后的cookie", name: "cookie", type: "text"},
        ];
    }
}
