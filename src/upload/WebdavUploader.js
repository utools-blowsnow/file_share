import IUploader from './IUploader'
import UploadException from './exception/UploadException'
import { createClient } from 'webdav/web';

class WebdavUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        console.log("upload",file);
        let client = this.buildClient(config);
        let path = config.path ? config.path : "/utools";
        if (path){
            // 判断上传的文件夹是否存在
            let exists = await client.exists(path);
            if (!exists){
                await client.createDirectory(path);
            }
        }
        client.getDirectoryContents("").then(function (contents) {
            console.log("getDirectoryContents",contents);
        });
        let newFilePath = path + "/" + file.name;
        // 转换为 arraybuffer
        const buffer = await file.arrayBuffer();
        let result = await client.putFileContents(newFilePath, buffer, {
            onUploadProgress: function (progressEvent) {
                let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                if (progressCallback){
                    progressCallback(percentCompleted);
                }
            }
        });
        if (!result){
            throw new UploadException("上传失败");
        }
        return {
            url: client.getFileDownloadLink(newFilePath),
            expire: null
        };
    }

    static buildClient(config) {
        return createClient(config.url, {
            username: config.username,
            password: config.password
        });
    }

    static name(){
        return "webdav";
    }

    static order(){ return 80;}

    static config(){
        return [
            {label: "webdavUrl", name: "url", type: "text", required: true},
            {label: "webdav账号", name: "username", type: "text", required: true},
            {label: "webdav密码", name: "password", type: "text", required: true},
            {label: "上传路径", name: "path", type: "text",desc: "为空 默认新建目录 /utools"},
        ];
    }
}

export default WebdavUploader;
