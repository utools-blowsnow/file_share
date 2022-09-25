import IUploader from '../IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from '../exception/UploadException'

class FtpodUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        // 先获取上传地址
        let expire = config.expire || 30;
        let download = config.download || 0;
        let res = await axios.get("https://ftpod.cn/uploadSession?fileName=" + file.name + "&fileSize=" + file.size + "&validDays="+expire+"&allowDownloadsNum="+download);

        let res2 = await this.uploadStream(res.data.uploadUrl + "&chunk=0&chunks=1",file,'put',{
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Range': 'bytes 0-' + (file.size - 1) + '/' + file.size
            }
        },progressCallback)
        if (res2.data.error){
            throw new UploadException(res2.data.error.message);
        }

        let res3 = await axios.post("https://ftpod.cn/uploadCallback/" + res.data.callbackId);
        if (res3.data.code !== 0){
            throw new UploadException(res3.data.msg);
        }

        return {
            url: res3.data.data.url,
            expire: expire * 24 * 60 * 60
        };
    }

    static name(){
        return "ftpod";
    }

    static config(){
        return [
            {label: "有效期", name: "expire", type: "select" ,value: 30, options: [
                    {label: "1天",value: 1},
                    {label: "3天",value: 3},
                    {label: "7天",value: 7},
                    {label: "15天",value: 15},
                    {label: "30天",value: 30},
                ]},
            {label: "下载次数", name: "download", type: "number" ,value: 0, min: 0}
        ];
    }
}

export default FtpodUploader;
